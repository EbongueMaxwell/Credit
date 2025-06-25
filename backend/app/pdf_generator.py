from fpdf import FPDF
from datetime import datetime
import os

class PDFGenerator:
    @staticmethod
    def generate_credit_report(data: dict, filename: str = None):
        pdf = FPDF()
        pdf.add_page()
        
        # Set font for the title
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt="Credit Risk Analysis Report", ln=1, align='C')
        
        # Client information section
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, txt="Client Information", ln=1)
        pdf.set_font("Arial", '', 10)
        pdf.cell(200, 6, txt=f"Client Name: {data.get('client_name', 'N/A')}", ln=1)
        pdf.cell(200, 6, txt=f"Analysis Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=1)
        
        # Results section
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, txt="Credit Analysis Results", ln=1)
        pdf.set_font("Arial", '', 10)
        
        # Score and risk
        pdf.cell(200, 6, txt=f"Credit Score: {data.get('creditScore', 'N/A')}", ln=1)
        pdf.cell(200, 6, txt=f"Risk Level: {data.get('riskLevel', 'N/A').title()}", ln=1)
        pdf.cell(200, 6, txt=f"Approval Probability: {data.get('approvalProbability', 'N/A')}", ln=1)
        pdf.cell(200, 6, txt=f"Decision: {data.get('decision', 'N/A').title()}", ln=1)
        
        # Key factors
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, txt="Key Factors", ln=1)
        pdf.set_font("Arial", '', 10)
        
        if 'keyFactors' in data:
            factors = data['keyFactors']
            if factors.get('positive'):
                pdf.cell(200, 6, txt="Positive Factors:", ln=1)
                for factor in factors['positive']:
                    pdf.cell(200, 6, txt=f"- {factor}", ln=1)
            
            if factors.get('negative'):
                pdf.cell(200, 6, txt="Negative Factors:", ln=1)
                for factor in factors['negative']:
                    pdf.cell(200, 6, txt=f"- {factor}", ln=1)
        
        # Generate file path
        if not filename:
            filename = f"credit_report_{data.get('client_name', 'client')}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        
        # Ensure reports directory exists
        os.makedirs("reports", exist_ok=True)
        filepath = os.path.join("reports", filename)
        
        # Output the PDF
        pdf.output(filepath)
        return filepath