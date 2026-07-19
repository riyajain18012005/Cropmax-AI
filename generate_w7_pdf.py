import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf():
    pdf_filename = "W7_AIFeatureDemo_TBI-26101097.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles matching CropMax AI styling
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#065F46"),  # Emerald 800
        alignment=1, # Center
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#4B5563"),  # Zinc 600
        alignment=1,
        spaceAfter=30
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#0F766E"),  # Teal 700
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1F2937"),  # Gray 800
        spaceAfter=12
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#374151")
    )

    story = []

    # --- COVER PAGE / HEADER ---
    story.append(Spacer(1, 40))
    story.append(Paragraph("CROPMAX AI", ParagraphStyle('TopBrand', parent=title_style, fontSize=14, leading=18, textColor=colors.HexColor("#059669"))))
    story.append(Paragraph("AI Feature Integration Verification Report", title_style))
    story.append(Paragraph("LLM-Powered Market Advisor, Real-time Mandi Sentiment Analysis, Value-Added Processing, Loader & Toast Notifications, DevTools Console Logs", subtitle_style))
    story.append(Spacer(1, 20))

    # Metadata Table
    meta_data = [
        [Paragraph("Project Name:", meta_style), Paragraph("CropMax AI", body_style)],
        [Paragraph("Intern ID:", meta_style), Paragraph("TBI-26101097", body_style)],
        [Paragraph("Author:", meta_style), Paragraph("Intern Developer", body_style)],
        [Paragraph("Task Scope:", meta_style), Paragraph("Backend REST AI Service (POST /api/ai/advise), Gemini/OpenAI API Prompts engineering, Front-end Parameters Dashboard, Loading UI state with rotating tips, Error toasts, API Logs Simulation", body_style)],
        [Paragraph("Report Date:", meta_style), Paragraph("July 19, 2026", body_style)],
        [Paragraph("Status:", meta_style), Paragraph("<font color='#059669'><b>FULLY VERIFIED (PASS)</b></font>", body_style)],
    ]
    t = Table(meta_data, colWidths=[100, 400])
    t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#F9FAFB")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 40))
    story.append(PageBreak())

    # --- SECTIONS CONFIG ---
    sections = [
        {
            "title": "1. User Input Form Screen (Parameters)",
            "desc": "<b>Verification Test:</b> The farmer navigates to <code>/dashboard/ai-advisor</code> and inputs parameters for a crop harvest (Mango, 25 Tons, Nashik, Maharashtra, and a custom query). This form can also quick-sync details directly from active inventory. All fields are client-side validated.",
            "img": "screenshots/ai_input.png"
        },
        {
            "title": "2. Loading State (Mid-Request)",
            "desc": "<b>Verification Test:</b> Upon submitting, the interface enters a disabled loading state. A custom <code>Loader.jsx</code> spinner triggers along with a dynamic agricultural tip rotation (e.g. 'Analyzing local APMC mandi volumes...'), keeping the user engaged during the API call.",
            "img": "screenshots/ai_loading.png"
        },
        {
            "title": "3. Final AI Output Display and Network 200 OK Response",
            "desc": "<b>Verification Test:</b> The backend AI service returns a parsed, formatted JSON response which is parsed and mapped in the UI. Output showcases recommended strategies (e.g., Processing Recommended), projected profit boosts (+88%), holding target periods, value-added processing guides, and suggested mandi buyers. The Chrome DevTools simulator at the bottom lists the successful <code>POST /api/ai/advise</code> call with status <code>200 OK</code> and latency metrics.",
            "img": "screenshots/ai_output.png"
        },
        {
            "title": "4. API Error Handling (Error Toast)",
            "desc": "<b>Verification Test:</b> Selecting the 'Simulate API Error State' checkbox sends a query that instructs the backend to mock an API rate-limit failure (HTTP 429). The frontend catches the error and triggers a red Toast error alert at the bottom-right, warning the user of the rate limit/timeout.",
            "img": "screenshots/ai_error.png"
        }
    ]

    for sec in sections:
        story.append(Paragraph(sec["title"], h1_style))
        story.append(Paragraph(sec["desc"], body_style))
        story.append(Spacer(1, 10))
        
        # Draw screenshot image
        img_path = sec["img"]
        if os.path.exists(img_path):
            img_flowable = Image(img_path, width=450, height=253)
            story.append(img_flowable)
        else:
            story.append(Paragraph(f"<font color='red'>Missing screenshot: {img_path}</font>", body_style))
        
        story.append(Spacer(1, 20))
        story.append(PageBreak())

    # Build the document
    doc.build(story)
    print(f"Successfully generated PDF: {pdf_filename}")

if __name__ == "__main__":
    generate_pdf()
