from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import logging
import os
import tempfile
from datetime import datetime
import uuid
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LexiScan PDF Generator",
    description="PDF generation and reporting service",
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
class ReportRequest(BaseModel):
    report_type: str
    user_id: str
    document_ids: List[str]
    template_data: Dict[str, Any]
    format: str = "pdf"

class ReportResponse(BaseModel):
    task_id: str
    status: str
    message: str

class ReportStatus(BaseModel):
    task_id: str
    status: str
    progress: int
    file_path: Optional[str] = None
    error: Optional[str] = None

# In-memory task storage (replace with Redis in production)
tasks = {}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/generate-report", response_model=ReportResponse)
async def generate_report(
    request: ReportRequest,
    background_tasks: BackgroundTasks
):
    """Start report generation task"""
    task_id = str(uuid.uuid4())
    
    # Initialize task status
    tasks[task_id] = {
        "status": "queued",
        "progress": 0,
        "user_id": request.user_id,
        "report_type": request.report_type,
        "created_at": datetime.utcnow(),
        "file_path": None,
        "error": None
    }
    
    # Add background task
    background_tasks.add_task(generate_report_task, task_id, request)
    
    return ReportResponse(
        task_id=task_id,
        status="queued",
        message="Report generation started"
    )

async def generate_report_task(task_id: str, request: ReportRequest):
    """Background task for report generation"""
    try:
        # Update status to processing
        tasks[task_id]["status"] = "processing"
        tasks[task_id]["progress"] = 10
        
        # Step 1: Gather data
        logger.info(f"Gathering data for report {task_id}")
        report_data = await gather_report_data(request.document_ids, request.template_data)
        tasks[task_id]["progress"] = 30
        
        # Step 2: Generate report
        logger.info(f"Generating {request.report_type} report for task {task_id}")
        file_path = await generate_pdf_report(
            request.report_type,
            report_data,
            request.template_data
        )
        tasks[task_id]["progress"] = 80
        
        # Step 3: Complete generation
        tasks[task_id]["status"] = "completed"
        tasks[task_id]["progress"] = 100
        tasks[task_id]["file_path"] = file_path
        
        logger.info(f"Report {task_id} generated successfully")
        
    except Exception as e:
        logger.error(f"Error generating report {task_id}: {str(e)}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)

async def gather_report_data(document_ids: List[str], template_data: Dict[str, Any]) -> Dict[str, Any]:
    """Gather data for report generation"""
    # Simulate data gathering
    await asyncio.sleep(1)
    
    return {
        "documents": [
            {
                "id": doc_id,
                "title": f"Document {doc_id}",
                "score": 85,
                "review_count": 3,
                "upload_date": "2024-01-15"
            }
            for doc_id in document_ids
        ],
        "summary": {
            "total_documents": len(document_ids),
            "average_score": 85,
            "total_reviews": len(document_ids) * 3
        },
        "template_data": template_data
    }

async def generate_pdf_report(report_type: str, data: Dict[str, Any], template_data: Dict[str, Any]) -> str:
    """Generate PDF report"""
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    temp_file.close()
    
    # Create PDF document
    doc = SimpleDocTemplate(temp_file.name, pagesize=A4)
    story = []
    
    # Get styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        textColor=colors.darkblue
    )
    
    # Add title
    title = Paragraph(f"{report_type.title()} Report", title_style)
    story.append(title)
    story.append(Spacer(1, 20))
    
    # Add summary section
    story.append(Paragraph("Summary", heading_style))
    summary_data = data.get("summary", {})
    summary_text = f"""
    Total Documents: {summary_data.get('total_documents', 0)}<br/>
    Average Score: {summary_data.get('average_score', 0)}%<br/>
    Total Reviews: {summary_data.get('total_reviews', 0)}<br/>
    """
    story.append(Paragraph(summary_text, styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Add documents table
    story.append(Paragraph("Document Details", heading_style))
    
    table_data = [['Document ID', 'Title', 'Score', 'Reviews', 'Upload Date']]
    for doc in data.get("documents", []):
        table_data.append([
            doc.get("id", ""),
            doc.get("title", ""),
            f"{doc.get('score', 0)}%",
            str(doc.get("review_count", 0)),
            doc.get("upload_date", "")
        ])
    
    table = Table(table_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(table)
    story.append(Spacer(1, 20))
    
    # Add footer
    footer_text = f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    story.append(Paragraph(footer_text, styles['Normal']))
    
    # Build PDF
    doc.build(story)
    
    return temp_file.name

@app.get("/task-status/{task_id}", response_model=ReportStatus)
async def get_task_status(task_id: str):
    """Get report generation task status"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    return ReportStatus(
        task_id=task_id,
        status=task["status"],
        progress=task["progress"],
        file_path=task["file_path"],
        error=task["error"]
    )

@app.get("/download-report/{task_id}")
async def download_report(task_id: str):
    """Download generated report"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    if task["status"] != "completed" or not task["file_path"]:
        raise HTTPException(status_code=400, detail="Report not ready")
    
    if not os.path.exists(task["file_path"]):
        raise HTTPException(status_code=404, detail="Report file not found")
    
    return FileResponse(
        task["file_path"],
        media_type='application/pdf',
        filename=f"report_{task_id}.pdf"
    )

@app.post("/generate-summary")
async def generate_summary(document_ids: List[str], user_id: str):
    """Generate document summary"""
    # Simulate summary generation
    await asyncio.sleep(1)
    
    summary = {
        "total_documents": len(document_ids),
        "key_themes": ["AI", "Machine Learning", "Document Processing"],
        "sentiment": "positive",
        "recommendations": [
            "Consider implementing automated review processes",
            "Focus on improving document quality scores",
            "Expand AI capabilities for better analysis"
        ]
    }
    
    return {"summary": summary}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
