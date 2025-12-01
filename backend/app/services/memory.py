"""
Vector Memory Service

This module handles interactions with the Qdrant vector database.
It manages the storage (upsert) and retrieval (semantic search) of document chunks
and their associated metadata.
"""

from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.core.config import settings
from app.models.document import TextChunk
from typing import List

class MemoryService:
    """
    Service class for managing vector memory using Qdrant.
    """
    def __init__(self):
        # Initialize Qdrant client
        self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        self.collection_name = "legal_memory"
        self._ensure_collection()

    def _ensure_collection(self):
        """
        Checks if the vector collection exists, and creates it if not.
        Configures the vector size (768 for all-mpnet-base-v2) and distance metric (Cosine).
        """
        try:
            self.client.get_collection(self.collection_name)
        except Exception:
            # Collection doesn't exist, create it
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
            )

    async def upsert_chunks(self, chunks: List[TextChunk]):
        """
        Inserts or updates document chunks in the vector database.

        Args:
            chunks (List[TextChunk]): List of processed text chunks to store.
        """
        points = []
        for chunk in chunks:
            # Create a PointStruct for each chunk, including vector and metadata payload
            points.append(models.PointStruct(
                id=chunk.chunk_id,
                vector=chunk.embedding,
                payload={
                    "text": chunk.text,
                    "filename": chunk.metadata.filename,
                    "page_number": chunk.metadata.page_number,
                    "source": chunk.metadata.source,
                    "created_at": chunk.metadata.created_at.isoformat(),
                    "dates": chunk.metadata.dates,
                    "entities": chunk.metadata.entities
                }
            ))
        
        if points:
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            
    async def search(self, query_vector: List[float], limit: int = 5) -> List[models.ScoredPoint]:
        """
        Performs a semantic search in the vector database.

        Args:
            query_vector (List[float]): The embedding vector of the search query.
            limit (int): The maximum number of results to return.

        Returns:
            List[models.ScoredPoint]: A list of scored points (matches) from the database.
        """
        return self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit
        )

# Global instance of the memory service
memory_service = MemoryService()
