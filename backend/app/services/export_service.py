import io
import pandas as pd
from typing import List, Dict, Any
from reportlab.lib.pagesizes import landscape, letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

class ExportService:
    
    @staticmethod
    def generate_csv(data: List[Dict[str, Any]]) -> io.BytesIO:
        df = pd.DataFrame(data)
        buffer = io.BytesIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        return buffer

    @staticmethod
    def generate_excel(data: List[Dict[str, Any]]) -> io.BytesIO:
        df = pd.DataFrame(data)
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        buffer.seek(0)
        return buffer

    @staticmethod
    def generate_pdf(data: List[Dict[str, Any]], title: str = "Report") -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        elements = []
        
        styles = getSampleStyleSheet()
        elements.append(Paragraph(title, styles['Title']))
        
        if not data:
            elements.append(Paragraph("No data found.", styles['Normal']))
            doc.build(elements)
            buffer.seek(0)
            return buffer
            
        headers = list(data[0].keys())
        table_data = [[h.replace("_", " ").title() for h in headers]]
        
        for row in data:
            table_data.append([str(row.get(h, "")) for h in headers])
            
        t = Table(table_data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,0), 10),
            ('BACKGROUND', (0,1), (-1,-1), colors.whitesmoke),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black)
        ]))
        
        elements.append(t)
        doc.build(elements)
        buffer.seek(0)
        return buffer
