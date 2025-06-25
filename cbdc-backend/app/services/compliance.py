from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import os
from app.models.transaction import Transaction

def generate_aml_report(transaction: Transaction) -> str:
    """
    Generates a PDF AML report for a given transaction.
    
    Returns the file path of the generated report.
    """
    # Create a reports directory if it doesn't exist
    reports_dir = "temp_reports"
    if not os.path.exists(reports_dir):
        os.makedirs(reports_dir)
        
    file_path = os.path.join(reports_dir, f"report_{transaction.tx_id}.pdf")
    
    doc = SimpleDocTemplate(file_path)
    styles = getSampleStyleSheet()
    
    story = []
    
    # Title
    story.append(Paragraph(f"AML Compliance Report", styles['h1']))
    story.append(Paragraph(f"<br/>Transaction ID: {transaction.tx_id}", styles['Normal']))
    
    # Transaction Details
    story.append(Paragraph("<br/><br/><b>Transaction Details:</b>", styles['h3']))
    story.append(Paragraph(f"Sender: {transaction.sender}", styles['Normal']))
    story.append(Paragraph(f"Receiver: {transaction.receiver}", styles['Normal']))
    story.append(Paragraph(f"Amount: {transaction.amount}", styles['Normal']))
    story.append(Paragraph(f"Timestamp: {transaction.timestamp.isoformat()}", styles['Normal']))
    
    # Placeholder for AML check results
    story.append(Paragraph("<br/><br/><b>AML Check (Placeholder):</b>", styles['h3']))
    story.append(Paragraph("No risks detected based on placeholder analysis.", styles['Normal']))
    
    doc.build(story)
    
    return file_path 