"""
Data Models

This module defines the Pydantic models used for data validation and serialization
within the application. It includes models for document metadata, text chunks,
and API responses.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class DocumentMetadata(BaseModel):
    """
    Metadata associated with a document or a text chunk.
    """
    source: str
    filename: str
    page_number: int
    created_at: datetime = Field(default_factory=datetime.now)
    doc_type: Optional[str] = None
    
    # Extracted metadata from the document content
    dates: List[str] = []
    entities: List[str] = []

class TextChunk(BaseModel):
    """
    Represents a chunk of text from a document, including its metadata
    and vector embedding.
    """
    text: str
    metadata: DocumentMetadata
    chunk_id: str
    embedding: Optional[List[float]] = None

class IngestResponse(BaseModel):
    """
    Response model for the document ingestion endpoint.
    """
    message: str
    num_chunks: int
    document_id: str
