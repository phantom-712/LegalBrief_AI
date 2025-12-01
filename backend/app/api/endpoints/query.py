"""
Query and Retrieval Endpoints

This module provides endpoints for querying the document knowledge base.
It supports semantic search, retrieval-augmented generation (RAG) for answering questions,
and specialized views like timelines and semantic graphs.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.memory import memory_service
from app.services.llm import llm_service
from app.services.ingest import embedding_model
import networkx as nx
import json
import uuid

router = APIRouter()

class QueryRequest(BaseModel):
    """
    Request model for the query endpoint.
    """
    query: str
    filters: Optional[Dict[str, Any]] = None
    synthesize: bool = True

class QueryResponse(BaseModel):
    """
    Response model containing the generated answer and source citations.
    """
    answer: str
    sources: List[Dict[str, Any]]
    created_memory_id: Optional[str] = None

@router.post("/query", response_model=QueryResponse)
async def query_memory(request: QueryRequest):
    """
    Performs a semantic search and optionally synthesizes an answer using the LLM.

    1. Generates an embedding for the user's query.
    2. Retrieves the most relevant document chunks from the vector database.
    3. (Optional) Uses the LLM to generate a natural language answer based on the retrieved context.
    """
    # 1. Generate Query Embedding
    # We use the same embedding model as the ingestion service to ensure compatibility
    query_vector = embedding_model.encode(request.query).tolist()

    # 2. Retrieve Relevant Chunks
    results = await memory_service.search(query_vector, limit=5)
    
    sources = []
    context_chunks = []
    for res in results:
        payload = res.payload
        sources.append({
            "text": payload["text"],
            "filename": payload["filename"],
            "page_number": payload["page_number"],
            "score": res.score
        })
        context_chunks.append(f"Source ({payload['filename']} p.{payload['page_number']}): {payload['text']}")

    # 3. Synthesize Answer (RAG)
    if request.synthesize:
        # Generate answer using the LLM with the retrieved context
        answer = await llm_service.synthesize_answer(request.query, context_chunks)
        return QueryResponse(
            answer=answer,
            sources=sources,
            created_memory_id="interaction_" + str(uuid.uuid4())
        )

    # If synthesis is disabled, return only the sources
    return QueryResponse(answer="", sources=sources)


@router.get("/timeline")
async def get_timeline():
    """
    Retrieves a timeline of events based on dates extracted from documents.
    
    Returns a list of events sorted by date.
    """
    # Fetch recent items from the vector database
    # In a production system, this should be an optimized query for items with date metadata
    client = memory_service.client
    results, _ = client.scroll(
        collection_name="legal_memory",
        limit=100,
        with_payload=True
    )
    
    timeline_events = []
    for res in results:
        dates = res.payload.get("dates", [])
        if dates:
            for date in dates:
                timeline_events.append({
                    "date": date,
                    # Truncate text for the timeline view
                    "event": res.payload["text"][:100] + "...",
                    "source": res.payload["filename"],
                    "chunk_id": res.id
                })
    
    # Sort events by date
    # Note: This uses simple string sorting. Robust date parsing is recommended for production.
    timeline_events.sort(key=lambda x: x["date"])
    return timeline_events

@router.get("/semantic_graph")
async def get_semantic_graph(query: Optional[str] = None):
    """
    Generates a semantic graph of document chunks.
    
    Nodes represent chunks, and edges represent relationships (e.g., same document).
    If a query is provided, the graph focuses on chunks relevant to the query.
    """
    limit = 20
    if query:
        # If query provided, get relevant chunks
        query_vector = embedding_model.encode(query).tolist()
        results = await memory_service.search(query_vector, limit=limit)
        points = [r for r in results]
    else:
        # Otherwise, get a random sample of recent chunks
        points, _ = memory_service.client.scroll(collection_name="legal_memory", limit=limit, with_payload=True)
    
    # Build the graph using NetworkX
    G = nx.Graph()
    
    # Add nodes (chunks)
    for p in points:
        pid = p.id
        payload = p.payload
        G.add_node(pid, label=payload["filename"], text=payload["text"][:50])
        
    # Add edges
    # Currently linking chunks from the same document.
    # Future enhancement: Link based on semantic similarity or shared entities.
    for p1 in points:
        for p2 in points:
            if p1.id != p2.id:
                if p1.payload["filename"] == p2.payload["filename"]:
                    G.add_edge(p1.id, p2.id, weight=0.5)
                
    # Convert graph to a format suitable for frontend visualization (e.g., Cytoscape)
    elements = []
    for node in G.nodes(data=True):
        elements.append({"data": {"id": str(node), "label": G.nodes[node]["label"]}})
        
    for u, v, data in G.edges(data=True):
        elements.append({"data": {"source": str(u), "target": str(v)}})
        
    return elements
