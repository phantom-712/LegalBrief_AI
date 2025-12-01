"""
LegalBriefAI Backend Application Entry Point

This module initializes the FastAPI application, configures middleware (CORS),
and registers the API routers for different functional modules (ingestion, query, consolidation).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import ingest, query, consolidate

# Initialize the FastAPI application with metadata
app = FastAPI(
    title="LegalBriefAI",
    description="Memory-driven document intelligence system",
    version="1.0.0"
)

# Configure Cross-Origin Resource Sharing (CORS) middleware
# This allows the frontend to communicate with the backend from different origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """
    Root endpoint to verify that the backend is running.
    """
    return {"message": "LegalBriefAI Backend is running"}

# Register API routers
app.include_router(ingest.router, prefix="/api/v1", tags=["ingest"])
app.include_router(query.router, prefix="/api/v1", tags=["query"])
app.include_router(consolidate.router, prefix="/api/v1", tags=["consolidate"])


