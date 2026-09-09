import numpy as np
from typing import List
from sentence_transformers import util
from src.core.model_loader import model_manager
from src.core.cache import cache_manager
from src.core.logger import logger
from src.schemas.duplicate import (
    DuplicateCheckRequest,
    DuplicateCheckResponse,
    SimilarityMatch,
)

class SimilarityService:
    def check_duplicates(self, request: DuplicateCheckRequest) -> DuplicateCheckResponse:
        corpus = request.corpus
        if not corpus:
            return DuplicateCheckResponse(
                query=request.query,
                matches=[],
                top_match=None,
                has_duplicate=False,
                evaluated_corpus_size=0,
            )

        clean_query = request.query.strip()

        try:
            embedder = model_manager.get_embedding_model()

            # Encode query (using cache where possible)
            query_cache_key = cache_manager.generate_key("embed", clean_query)
            query_embedding = cache_manager.get_embedding(query_cache_key)

            if query_embedding is None:
                query_embedding = embedder.encode(clean_query, convert_to_tensor=True)
                cache_manager.set_embedding(query_cache_key, query_embedding)

            # Encode corpus items
            corpus_texts = [item.text.strip() for item in corpus]
            corpus_embeddings = []

            for text in corpus_texts:
                item_cache_key = cache_manager.generate_key("embed", text)
                emb = cache_manager.get_embedding(item_cache_key)
                if emb is None:
                    emb = embedder.encode(text, convert_to_tensor=True)
                    cache_manager.set_embedding(item_cache_key, emb)
                corpus_embeddings.append(emb)

            # Compute Cosine Similarities
            # util.cos_sim calculates pairwise cosine similarity matrix
            cos_scores = util.cos_sim(query_embedding, corpus_embeddings)[0].cpu().numpy()

            matches: List[SimilarityMatch] = []
            for i, score_val in enumerate(cos_scores):
                score = float(score_val)
                item = corpus[i]
                is_duplicate = score >= request.similarity_threshold
                matches.append(
                    SimilarityMatch(
                        id=item.id,
                        tracking_code=item.tracking_code,
                        similarity_score=round(score, 4),
                        is_duplicate=is_duplicate,
                    )
                )

            # Sort descending by similarity score
            matches.sort(key=lambda m: m.similarity_score, reverse=True)
            top_matches = matches[: request.top_k]

            top_match = top_matches[0] if top_matches else None
            has_duplicate = any(m.is_duplicate for m in top_matches)

            return DuplicateCheckResponse(
                query=clean_query,
                matches=top_matches,
                top_match=top_match,
                has_duplicate=has_duplicate,
                evaluated_corpus_size=len(corpus),
            )

        except Exception as e:
            logger.error(f"Inference error in SimilarityService: {e}. Falling back to Jaccard similarity.", exc_info=True)
            return self._fallback_check(request)

    def _fallback_check(self, request: DuplicateCheckRequest) -> DuplicateCheckResponse:
        """Token-overlap heuristic fallback."""
        query_tokens = set(request.query.lower().split())
        matches: List[SimilarityMatch] = []

        for item in request.corpus:
            doc_tokens = set(item.text.lower().split())
            intersection = len(query_tokens.intersection(doc_tokens))
            union = len(query_tokens.union(doc_tokens)) or 1
            jaccard = intersection / union

            matches.append(
                SimilarityMatch(
                    id=item.id,
                    tracking_code=item.tracking_code,
                    similarity_score=round(jaccard, 4),
                    is_duplicate=jaccard >= request.similarity_threshold,
                )
            )

        matches.sort(key=lambda m: m.similarity_score, reverse=True)
        top_matches = matches[: request.top_k]
        top_match = top_matches[0] if top_matches else None

        return DuplicateCheckResponse(
            query=request.query,
            matches=top_matches,
            top_match=top_match,
            has_duplicate=any(m.is_duplicate for m in top_matches),
            evaluated_corpus_size=len(request.corpus),
        )

similarity_service = SimilarityService()
