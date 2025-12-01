"""
Document Ingestion Endpoint

This module handles the uploading and processing of legal documents.
It supports PDF uploads, which are processed asynchronously to extract text,
generate embeddings, and store them in the vector database.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.services.ingest import ingest_service
from app.services.memory import memory_service
from app.services.llm import llm_service
from app.models.document import IngestResponse
import shutil
import os
import uuid

router = APIRouter()

async def process_upload_background(file_path: str, filename: str):
    """
    Background task to process the uploaded PDF file.
    
    Steps:
    1. Extract text and create chunks from the PDF.
    2. Enrich chunks with metadata (dates, entities) using the LLM.
    3. Store the enriched chunks and embeddings in the vector database.
    4. Clean up the temporary file.
    """
    # 1. Process PDF: Extract text and generate embeddings
    chunks = await ingest_service.process_pdf(file_path, filename)
    
    # 2. Enrich with Metadata (LLM)
    # We iterate through chunks to extract structured data like dates and entities.
    # Note: In a high-volume production environment, this step should be batched 
    # or handled by a dedicated metadata extraction service to avoid latency.
    for chunk in chunks:
        metadata = await llm_service.extract_metadata(chunk.text)
        chunk.metadata.dates = metadata.get("dates", [])
        chunk.metadata.entities = metadata.get("entities", [])
    
    # 3. Upsert to Vector Database (Qdrant)
    await memory_service.upsert_chunks(chunks)
    
    # 4. Cleanup temporary file
    if os.path.exists(file_path):
        os.remove(file_path)

@router.post("/upload", response_model=IngestResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Endpoint to upload a PDF document for processing.

    The file is saved temporarily and then processed in the background to ensure
    the API remains responsive.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Generate a unique filename to prevent collisions
    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_path = os.path.join("raw_documents", temp_filename)
    
    # Ensure the temporary directory exists
    os.makedirs("raw_documents", exist_ok=True)
    
    # Save the uploaded file to disk
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Schedule the background processing task
    background_tasks.add_task(process_upload_background, temp_path, file.filename)
    
    return IngestResponse(
        message="Document uploaded and processing started.",
        num_chunks=0, # Actual chunk count is determined during background processing
        document_id=temp_filename
    )
