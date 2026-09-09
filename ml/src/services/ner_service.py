import re
from typing import List, Dict, Set
from src.core.model_loader import model_manager
from src.core.cache import cache_manager
from src.core.logger import logger
from src.schemas.ner import NERRequest, NERResponse, EntityItem

CAMPUS_LOCATION_REGEX = re.compile(
    r"\b(Hostel\s+[A-Za-z0-9]+|Block\s+[A-Za-z0-9]+|Room\s+[0-9]+|Lab\s+[0-9A-Za-z]+|Auditorium|Cafeteria|Canteen|Library|Sports\s+Complex|Main\s+Gate|Seminar\s+Hall|Mess\s+[A-Za-z0-9]+|Wing\s+[A-Za-z0-9]+)\b",
    re.IGNORECASE,
)

class NERService:
    def extract_entities(self, request: NERRequest) -> NERResponse:
        clean_text = request.text.strip()

        # Check cache
        cache_key = cache_manager.generate_key("ner", clean_text)
        cached_result = cache_manager.get_ner(cache_key)
        if cached_result:
            return NERResponse(**cached_result)

        entities: List[EntityItem] = []
        locations: Set[str] = set()
        people: Set[str] = set()
        organizations: Set[str] = set()

        # 1. Campus Regex Location Extraction
        for match in CAMPUS_LOCATION_REGEX.finditer(clean_text):
            loc_text = match.group(0).strip()
            locations.add(loc_text)
            entities.append(
                EntityItem(
                    text=loc_text,
                    entity_group="LOC",
                    score=0.99,
                    start=match.start(),
                    end=match.end(),
                )
            )

        # 2. Pretrained Transformer Pipeline (dslim/bert-base-NER)
        try:
            ner_pipeline = model_manager.get_ner_pipeline()
            # dslim/bert-base-NER with aggregation_strategy="simple"
            raw_entities = ner_pipeline(clean_text[:512])

            for item in raw_entities:
                ent_text = item["word"].strip()
                ent_group = item["entity_group"].upper()
                score = float(item["score"])

                # Avoid duplicate if already caught by campus regex
                if any(e.start == item["start"] for e in entities):
                    continue

                entities.append(
                    EntityItem(
                        text=ent_text,
                        entity_group=ent_group,
                        score=round(score, 4),
                        start=int(item["start"]),
                        end=int(item["end"]),
                    )
                )

                if ent_group == "LOC":
                    locations.add(ent_text)
                elif ent_group == "PER":
                    people.add(ent_text)
                elif ent_group == "ORG":
                    organizations.add(ent_text)

        except Exception as e:
            logger.error(f"Inference error in NERService: {e}. Utilizing regex campus entities.", exc_info=True)

        response = NERResponse(
            entities=entities,
            locations=sorted(list(locations)),
            people=sorted(list(people)),
            organizations=sorted(list(organizations)),
        )

        cache_manager.set_ner(cache_key, response.model_dump())
        return response

ner_service = NERService()
