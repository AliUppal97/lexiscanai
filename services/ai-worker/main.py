from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import logging
import os
from datetime import datetime
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LexiScan AI Worker",
    description="AI-powered document processing service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ProcessingRequest(BaseModel):
    document_id: str
    file_path: str
    mime_type: str
    user_id: str

class ProcessingResponse(BaseModel):
    task_id: str
    status: str
    message: str

class ProcessingStatus(BaseModel):
    task_id: str
    status: str
    progress: int
    result: Optional[dict] = None
    error: Optional[str] = None

# In-memory task storage (replace with Redis in production)
tasks = {}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/process-document", response_model=ProcessingResponse)
async def process_document(
    request: ProcessingRequest,
    background_tasks: BackgroundTasks
):
    """Start document processing task"""
    task_id = str(uuid.uuid4())
    
    # Initialize task status
    tasks[task_id] = {
        "status": "queued",
        "progress": 0,
        "document_id": request.document_id,
        "user_id": request.user_id,
        "created_at": datetime.utcnow(),
        "result": None,
        "error": None
    }
    
    # Add background task
    background_tasks.add_task(process_document_task, task_id, request)
    
    return ProcessingResponse(
        task_id=task_id,
        status="queued",
        message="Document processing started"
    )

async def process_document_task(task_id: str, request: ProcessingRequest):
    """Background task for document processing"""
    try:
        # Update status to processing
        tasks[task_id]["status"] = "processing"
        tasks[task_id]["progress"] = 10
        
        # Step 1: Extract text from document
        logger.info(f"Extracting text from document {request.document_id}")
        extracted_text = await extract_text_from_document(request.file_path, request.mime_type)
        tasks[task_id]["progress"] = 30
        
        # Step 2: Chunk the text
        logger.info(f"Chunking text for document {request.document_id}")
        chunks = await chunk_text(extracted_text)
        tasks[task_id]["progress"] = 50
        
        # Step 3: Generate embeddings
        logger.info(f"Generating embeddings for document {request.document_id}")
        embeddings = await generate_embeddings(chunks)
        tasks[task_id]["progress"] = 70
        
        # Step 4: Store in vector database
        logger.info(f"Storing embeddings for document {request.document_id}")
        await store_embeddings(request.document_id, chunks, embeddings)
        tasks[task_id]["progress"] = 90
        
        # Step 5: Complete processing
        tasks[task_id]["status"] = "completed"
        tasks[task_id]["progress"] = 100
        tasks[task_id]["result"] = {
            "chunks_count": len(chunks),
            "embeddings_count": len(embeddings),
            "processing_time": (datetime.utcnow() - tasks[task_id]["created_at"]).total_seconds()
        }
        
        logger.info(f"Document {request.document_id} processed successfully")
        
    except Exception as e:
        logger.error(f"Error processing document {request.document_id}: {str(e)}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)

async def extract_text_from_document(file_path: str, mime_type: str) -> str:
    """Extract text from various document formats"""
    # Simulate text extraction
    await asyncio.sleep(1)
    
    if mime_type == "application/pdf":
        # Use PyPDF2 or pdfplumber for PDF extraction
        return "Extracted text from PDF document..."
    elif mime_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
        # Use python-docx for Word documents
        return "Extracted text from Word document..."
    elif mime_type == "text/plain":
        # Read plain text file
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise ValueError(f"Unsupported file type: {mime_type}")

async def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks"""
    # Simulate text chunking
    await asyncio.sleep(0.5)
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
        
        if end >= len(text):
            break
    
    return chunks

async def generate_embeddings(chunks: List[str]) -> List[List[float]]:
    """Generate embeddings for text chunks using OpenAI or local model"""
    # Simulate embedding generation
    await asyncio.sleep(2)
    
    embeddings = []
    for chunk in chunks:
        # Generate random embedding vector (replace with actual embedding model)
        embedding = [0.1] * 1536  # OpenAI ada-002 embedding dimension
        embeddings.append(embedding)
    
    return embeddings

async def store_embeddings(document_id: str, chunks: List[str], embeddings: List[List[float]]):
    """Store embeddings in vector database (Pinecone, Weaviate, etc.)"""
    # Simulate storing embeddings
    await asyncio.sleep(1)
    logger.info(f"Stored {len(embeddings)} embeddings for document {document_id}")

@app.get("/task-status/{task_id}", response_model=ProcessingStatus)
async def get_task_status(task_id: str):
    """Get processing task status"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    return ProcessingStatus(
        task_id=task_id,
        status=task["status"],
        progress=task["progress"],
        result=task["result"],
        error=task["error"]
    )

@app.post("/search")
async def search_documents(query: str, user_id: str, limit: int = 10):
    """Search documents using semantic similarity"""
    # Simulate search
    await asyncio.sleep(0.5)
    
    # Generate query embedding
    query_embedding = [0.1] * 1536
    
    # Simulate similarity search
    results = [
        {
            "document_id": "doc_1",
            "title": "Sample Document 1",
            "similarity_score": 0.95,
            "chunk_text": "Relevant text chunk..."
        },
        {
            "document_id": "doc_2", 
            "title": "Sample Document 2",
            "similarity_score": 0.87,
            "chunk_text": "Another relevant chunk..."
        }
    ]
    
    return {"query": query, "results": results[:limit]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
