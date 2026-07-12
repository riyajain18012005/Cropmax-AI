import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf():
    pdf_filename = "W6_AuthFlowScreenshots_TBI-26101097.pdf"
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
    story.append(Paragraph("Authentication System Verification Report", title_style))
    story.append(Paragraph("Secure JWT Credentials, Route Guards, Mock OAuth & Rate Limiting Verification", subtitle_style))
    story.append(Spacer(1, 20))

    # Metadata Table
    meta_data = [
        [Paragraph("Project Name:", meta_style), Paragraph("CropMax AI", body_style)],
        [Paragraph("Intern ID:", meta_style), Paragraph("TBI-26101097", body_style)],
        [Paragraph("Author:", meta_style), Paragraph("Intern Developer", body_style)],
        [Paragraph("Task Scope:", meta_style), Paragraph("User Registration, JWT Login, Passport.js Custom OAuth, Route Guards, Express Rate Limiter, Postman Collection", body_style)],
        [Paragraph("Report Date:", meta_style), Paragraph("July 12, 2026", body_style)],
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
            "title": "1. Attempting to Access Protected Route (Redirection)",
            "desc": "<b>Verification Test:</b> A guest user attempts to navigate directly to the dashboard page <code>/dashboard</code> without a valid authentication token. The frontend route guard (<code>ProtectedRoute.jsx</code>) detects the absence of the session token and immediately redirects the user to the <code>/login</code> page to prevent access.",
            "img": "screenshots/protected_redirect.png"
        },
        {
            "title": "2. User Registration and Success Response",
            "desc": "<b>Verification Test:</b> The user navigates to <code>/register</code>, fills in their details (Name, Email, Password, Role) and submits. The Express backend validates the inputs using <b>Zod</b>, hashes the password using <b>bcrypt</b> (10 salt rounds), stores the user record in MySQL via <b>Prisma</b>, and generates a signed JWT. The user is redirected directly to the dashboard.",
            "img": "screenshots/register_success.png"
        },
        {
            "title": "3. User Login and Success Response",
            "desc": "<b>Verification Test:</b> The user logs out, returns to <code>/login</code>, enters the registered credentials, and submits. The backend compares the hashed password, issues a signed JWT, and returns it. The token is successfully stored in the browser's <code>localStorage</code>, and the dashboard loads showing 'Hi, Test Farmer' in the navbar.",
            "img": "screenshots/login_success.png"
        },
        {
            "title": "4. OAuth Consent Screen Flow (GitHub/Google)",
            "desc": "<b>Verification Test:</b> The user clicks 'Sign in with GitHub' on the login screen. Since real credentials are not present in development, the system falls back to a custom-designed simulated OAuth Consent Screen. The screen requests read permissions for profile and email details.",
            "img": "screenshots/oauth_consent.png"
        },
        {
            "title": "5. Successful OAuth Redirection and Logged-In State",
            "desc": "<b>Verification Test:</b> Upon clicking 'Authorize' on the simulated consent screen, the user is redirected back to the callback URL (<code>/auth/callback</code>), which stores the signed JWT and logs in the user. The browser redirect completes, landing the user back on the dashboard as 'Jane GitHub Farmer'.",
            "img": "screenshots/oauth_success.png"
        },
        {
            "title": "6. Rate Limiting (429 Too Many Attempts Error)",
            "desc": "<b>Verification Test:</b> The user attempts to spam click the 'Sign In' button with incorrect credentials 6 times. The backend rate limiter (<code>express-rate-limit</code>) triggers, returning a <code>429 Too Many Requests</code> response. The login screen displays a clear red alert instructing the user to wait.",
            "img": "screenshots/rate_limit_error.png"
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
