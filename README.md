# LegalBriefAI

**Built by Ansuman Patra**  
[https://github.com/phantom-712/LegalBrief_AI](https://github.com/phantom-712/LegalBrief_AI)

**LegalBriefAI** is a production-grade, memory-driven document intelligence system designed to transform complex legal PDFs into structured, queryable, and visual knowledge. Unlike standard RAG systems, it implements a **Temporal Memory** and **Semantic Graph** architecture to understand not just *what* a document says, but *when* events happen and *how* concepts are related.

## 🚀 Key Features

### 1. Temporal Memory Engine
Extracts date-specific obligations and events from contracts (e.g., "Confidentiality expires 2 years after termination") and visualizes them in a chronological **Legal Timeline**.

### 2. Semantic Memory Graph
Goes beyond vector similarity by constructing a **Knowledge Graph** of document chunks. This allows users to see connections between disparate clauses (e.g., linking "Liability" in an NDA to "Indemnification" in a Service Agreement).

### 3. Hierarchical Memory Consolidation
Implements a "brain-like" consolidation process that groups related low-level memory chunks into higher-level summaries, improving retrieval accuracy for broad queries.

### 4. Retrieval-Augmented Synthesis (RAG)
Features a professional **Query Console** that:
- Retrieves precise evidence using dense vector search (Qdrant).
- Synthesizes answers using Google's Gemini 1.5 Flash.
- Cites specific page numbers and source documents.

### 5. Production-Ready Interface
A modern, dark-mode enabled dashboard built with **React, Vite, and TailwindCSS**, featuring real-time upload progress, streaming responses, and interactive visualizations.

---

## 🛠️ System Architecture

The system follows a microservices architecture orchestrated via Docker Compose:

- **Frontend (`/frontend`)**: 
  - **Framework**: React 18 + Vite
  - **State**: TanStack Query (React Query) for robust server state management.
  - **Visuals**: React Flow for graph rendering, Recharts for analytics.
  - **Styling**: TailwindCSS for a premium, responsive UI.

- **Backend (`/backend`)**:
  - **API**: FastAPI (Python) for high-performance, async endpoints.
  - **Ingestion**: `pypdf` for extraction, `RecursiveCharacterTextSplitter` for semantic chunking.
  - **LLM Integration**: Google Gemini API for metadata extraction and answer synthesis.
  - **Vector Store**: Qdrant (running in a dedicated container) for storing 768-dimensional embeddings (`all-mpnet-base-v2`).

- **Data Pipeline**:
  1. **Upload**: PDF is streamed to the backend.
  2. **Process**: Text is extracted and split into overlapping chunks (1000 chars).
  3. **Enrich**: LLM extracts metadata (Dates, Entities) from each chunk.
  4. **Index**: Chunks + Metadata are vectorized and upserted to Qdrant.
  5. **Consolidate**: Background processes cluster related chunks into summary nodes.

---

## 📋 Prerequisites

- **Docker Desktop** (installed and running)
- **Git**
- **Google Gemini API Key** (You have already configured this in the project)

---

## ⚡ Quick Start (Exact Instructions)

Follow these steps to launch the entire system.

### 1. Clone the Repository
```bash
git clone https://github.com/phantom-712/LegalBrief_AI.git
cd LegalBriefAI
```

### 2. Verify Configuration
We have already created the `.env` file for you with your API key. You can verify it exists:
- Windows (PowerShell): `Get-Content .env`
- Linux/Mac: `cat .env`

It should look like this:
```env
GEMINI_API_KEY=INSERT YOUR API KEY HERE
```

### 3. Launch with Docker Compose
This command builds the backend and frontend images and starts the Qdrant database.
```bash
docker-compose up --build
```
*Wait for about 1-2 minutes. You will see logs indicating `backend` and `frontend` are running.*

### 4. Access the Application
Open your browser and navigate to:
- **Main Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Qdrant Console**: [http://localhost:6333/dashboard](http://localhost:6333/dashboard)

---

## 📖 Usage Guide

### Step 1: Ingest Documents
1. Go to the **Dashboard**.
2. Click the **Upload Area** and select the sample PDFs from the `raw_documents/` folder (downloaded automatically during setup).
3. Watch the progress as the system chunks and indexes the files.

### Step 2: Query Your Legal Brain
1. Navigate to the **Query Console**.
2. Ask a question like: *"What are the obligations regarding confidential information?"*
3. The system will stream an answer and list the **exact source files and page numbers** used.

### Step 3: Explore Visualizations
- **Timeline**: Click the "Timeline" tab to see extracted dates (e.g., Effective Date, Termination Date) plotted chronologically.
- **Semantic Graph**: Click "Semantic Graph" to explore how different contract clauses are semantically related in a node-link diagram.

### Step 4: Consolidate Memories
1. Go to the **Consolidate** tab.
2. Click "Start Consolidation".
3. The system will group similar chunks and generate a high-level summary for each document/topic.

---

## 📂 Project Structure

```
LegalBriefAI/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API Routes (ingest, query, consolidate)
│   │   ├── core/           # Config & Settings
│   │   ├── models/         # Pydantic Data Models
│   │   └── services/       # Business Logic (Ingest, Memory, LLM)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── features/       # Feature-based components (Dashboard, Graph, etc.)
│   │   └── api/            # API Client
│   ├── Dockerfile
│   └── nginx.conf
├── raw_documents/           # Folder for sample PDFs
├── docker-compose.yml       # Orchestration
└── README.md                # This file
```
