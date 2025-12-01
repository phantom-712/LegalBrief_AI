"""
Memory Consolidation Endpoint

This module provides endpoints for consolidating fragmented memory chunks.
It groups related document chunks (e.g., by source file) to create higher-level
summaries or "consolidated memories".
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.memory import memory_service
import uuid

router = APIRouter()

class ConsolidateRequest(BaseModel):
    """
    Request model for the consolidation endpoint.
    """
    threshold: float = 0.75

class ConsolidateResponse(BaseModel):
    """
    Response model containing the consolidated memory groups.
    """
    message: str
    consolidated_groups: List[Dict[str, Any]]

@router.post("/consolidate", response_model=ConsolidateResponse)
async def consolidate_memories(request: ConsolidateRequest):
    """
    Consolidates memory chunks into groups.

    Currently implements a grouping strategy based on the source filename.
    In a production environment, this could be enhanced with semantic clustering
    (e.g., DBSCAN) to group thematically similar chunks across different documents.
    """
    
    # Fetch recent vectors from the database
    # Using 'scroll' to retrieve a batch of points with their payloads
    points, _ = memory_service.client.scroll(
        collection_name="legal_memory",
        limit=100,
        with_payload=True
    )
    
    # Group chunks by their source filename
    groups = {}
    for p in points:
        filename = p.payload["filename"]
        if filename not in groups:
            groups[filename] = []
        groups[filename].append(p.payload["text"])
        
    consolidated_memories = []
    for filename, texts in groups.items():
        # Generate a summary for the group
        # Future enhancement: Use LLM to generate a semantic summary of the grouped texts
        summary = f"Consolidated memory of {len(texts)} chunks from {filename}."
        
        consolidated_memories.append({
            "id": str(uuid.uuid4()),
            "summary": summary,
            "member_count": len(texts),
            "source": filename
        })
        
    return ConsolidateResponse(
        message=f"Consolidated {len(consolidated_memories)} groups.",
        consolidated_groups=consolidated_memories
    )
