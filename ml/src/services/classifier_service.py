import re
from typing import Dict, Any, List
from src.config import settings
from src.core.model_loader import model_manager
from src.core.cache import cache_manager
from src.core.logger import logger
from src.schemas.classify import ClassifyRequest, ClassifyResponse, CategoryScore

# Critical Safety and Emergency Keywords that trigger instant critical rating
EMERGENCY_PATTERNS = re.compile(
    r"\b(fire|spark|sparking|shock|electrocution|short circuit|gas leak|flooding|roof collapse|explosion|live wire|hazard|medical emergency|structural collapse)\b",
    re.IGNORECASE,
)

HIGH_URGENCY_PATTERNS = re.compile(
    r"\b(no water|sewage overflow|power outage|blackout|broken lock|wifi down|server down|food poisoning|insects in food|contaminated)\b",
    re.IGNORECASE,
)

class ClassifierService:
    def classify(self, request: ClassifyRequest) -> ClassifyResponse:
        full_text = f"{request.title}. {request.text}" if request.title else request.text
        clean_text = full_text.strip()

        categories = request.candidate_categories or settings.DEFAULT_CATEGORIES

        # Check Cache
        cache_key = cache_manager.generate_key(
            "classify", clean_text, ",".join(categories), request.multi_label
        )
        cached_result = cache_manager.get_classification(cache_key)
        if cached_result:
            return ClassifyResponse(**cached_result)

        is_emergency = bool(EMERGENCY_PATTERNS.search(clean_text))
        is_high_pattern = bool(HIGH_URGENCY_PATTERNS.search(clean_text))

        try:
            classifier = model_manager.get_classifier()

            # 1. Zero-shot category classification with facebook/bart-large-mnli
            cat_result = classifier(
                clean_text,
                candidate_labels=categories,
                multi_label=request.multi_label,
            )

            top_category = cat_result["labels"][0]
            confidence = float(cat_result["scores"][0])

            category_scores = [
                CategoryScore(category=label, score=float(score))
                for label, score in zip(cat_result["labels"], cat_result["scores"])
            ]

            # 2. Urgency Detection using Zero-shot MNLI
            urgency_result = classifier(
                clean_text,
                candidate_labels=settings.URGENCY_LABELS,
                multi_label=False,
            )

            top_urgency_label = urgency_result["labels"][0]
            urgency_score_raw = float(urgency_result["scores"][0])

            # Map raw label to standard urgency tier
            urgency_tier = "medium"
            numeric_urgency = 0.5

            if "critical" in top_urgency_label or is_emergency:
                urgency_tier = "critical"
                numeric_urgency = max(0.92, urgency_score_raw)
            elif "high" in top_urgency_label or is_high_pattern:
                urgency_tier = "high"
                numeric_urgency = max(0.75, urgency_score_raw * 0.9)
            elif "low" in top_urgency_label:
                urgency_tier = "low"
                numeric_urgency = min(0.35, 1.0 - urgency_score_raw)
            else:
                urgency_tier = "medium"
                numeric_urgency = 0.55

            if is_emergency:
                urgency_tier = "critical"
                numeric_urgency = 0.98

            response = ClassifyResponse(
                category=top_category,
                confidence=round(confidence, 4),
                urgency=urgency_tier,
                urgency_score=round(numeric_urgency, 4),
                category_scores=category_scores,
                is_emergency=is_emergency,
            )

            # Store in cache
            cache_manager.set_classification(cache_key, response.model_dump())
            return response

        except Exception as e:
            logger.error(f"Inference error in ClassifierService: {e}. Executing fallback heuristics.", exc_info=True)
            return self._fallback_classify(clean_text, categories, is_emergency, is_high_pattern)

    def _fallback_classify(
        self, text: str, categories: List[str], is_emergency: bool, is_high: bool
    ) -> ClassifyResponse:
        """Robust fallback heuristic if model download or pipeline forward pass fails."""
        lower = text.lower()
        selected_cat = categories[0]
        confidence = 0.75

        # Heuristic keywords mapping
        keywords_map = {
            "Hostel & Residential Life": ["hostel", "room", "washroom", "bathroom", "water", "geyser", "warden", "bed", "mess"],
            "IT Infrastructure & Wi-Fi": ["wifi", "wi-fi", "internet", "lan", "network", "server", "portal", "login", "ethernet"],
            "Cafeteria & Food Services": ["canteen", "food", "cafeteria", "mess", "meal", "snack", "dinner", "lunch", "hygiene"],
            "Classroom & Academic Labs": ["classroom", "projector", "lab", "computer", "desk", "blackboard", "speaker", "ac"],
            "Sanitation & Environment": ["garbage", "trash", "waste", "drain", "clean", "sweep", "smell", "odor"],
            "Transport & Parking": ["bus", "parking", "car", "bike", "shuttle", "transport"],
            "Campus Security & Safety": ["security", "guard", "theft", "gate", "threat", "fight", "safety"],
            "Library Services": ["library", "book", "journal", "reading", "study hall"],
            "Administration & Fees": ["fee", "scholarship", "document", "id card", "certificate"],
        }

        best_score = 0
        for cat, keywords in keywords_map.items():
            if cat in categories:
                score = sum(1 for kw in keywords if kw in lower)
                if score > best_score:
                    best_score = score
                    selected_cat = cat
                    confidence = min(0.95, 0.70 + (score * 0.05))

        urgency = "medium"
        urgency_score = 0.50
        if is_emergency:
            urgency = "critical"
            urgency_score = 0.98
        elif is_high:
            urgency = "high"
            urgency_score = 0.78

        category_scores = [
            CategoryScore(
                category=cat,
                score=confidence if cat == selected_cat else round((1.0 - confidence) / (len(categories) - 1), 3),
            )
            for cat in categories
        ]

        return ClassifyResponse(
            category=selected_cat,
            confidence=round(confidence, 4),
            urgency=urgency,
            urgency_score=round(urgency_score, 4),
            category_scores=category_scores,
            is_emergency=is_emergency,
        )

classifier_service = ClassifierService()
