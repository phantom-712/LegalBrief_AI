"""
Document Ingestion Service

This module handles the processing of uploaded documents (specifically PDFs).
It performs text extraction, chunking, and vector embedding generation to prepare
documents for indexing in the vector database.
"""

import uuid
from typing import List
from datetime import datetime
import pypdf
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from app.models.document import TextChunk, DocumentMetadata
from app.core.config import settings

# Initialize the sentence transformer model for generating embeddings
# 'all-mpnet-base-v2' is a high-performing model for semantic search
embedding_model = SentenceTransformer('all-mpnet-base-v2')

class IngestService:
    """
    Service class for processing and ingesting documents.
    """
    def __init__(self):
        # Configure the text splitter to create overlapping chunks
        # This helps maintain context across chunk boundaries
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            is_separator_regex=False,
        )

    async def process_pdf(self, file_path: str, filename: str) -> List[TextChunk]:
        """
        Processes a PDF file: extracts text, splits it into chunks, and generates embeddings.

        Args:
            file_path (str): The absolute path to the PDF file.
            filename (str): The original filename of the uploaded document.

        Returns:
            List[TextChunk]: A list of processed text chunks with metadata and embeddings.
        """
        text_content = ""
        pages = []
        
        # 1. Extract Text from PDF
        try:
            reader = pypdf.PdfReader(file_path)
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    pages.append({"text": text, "page_number": i + 1})
                    text_content += text + "\n"
        except Exception as e:
            # Log the error and return empty list if extraction fails
            print(f"Error reading PDF {filename}: {str(e)}")
            return []

        # 2. Split Text into Chunks
        # We iterate through pages to maintain accurate page number metadata.
        # This is critical for legal documents where citation is important.
        
        chunks: List[TextChunk] = []
        
        for page in pages:
            page_chunks = self.text_splitter.split_text(page["text"])
            for chunk_text in page_chunks:
                # Future enhancement: Extract dates and entities using NER or LLM
                
                metadata = DocumentMetadata(
                    source=file_path,
                    filename=filename,
                    page_number=page["page_number"],
                    dates=[], # Placeholder for extracted dates
                    entities=[] # Placeholder for extracted entities
                )
                
                chunk_id = str(uuid.uuid4())
                
                # 3. Generate Vector Embedding
                embedding = embedding_model.encode(chunk_text).tolist()
                
                chunks.append(TextChunk(
                    text=chunk_text,
                    metadata=metadata,
                    chunk_id=chunk_id,
                    embedding=embedding
                ))
                
        return chunks

# Global instance of the ingestion service
ingest_service = IngestService()
