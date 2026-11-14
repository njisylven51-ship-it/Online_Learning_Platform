import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib import colors

def certificate_pdf(student_name: str, course_title: str, certificate_code: str, issued_date: str) -> bytes:
    """
    Generates a professional PDF certificate using ReportLab.
    Returns the PDF content as bytes.
    """
    buffer = io.BytesIO()
    
    # Use Landscape Letter (11 x 8.5 inches)
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)

    # --- 1. Borders ---
    # Outer Forest Green Border
    c.setStrokeColor(colors.HexColor("#1f3d33"))
    c.setLineWidth(12)
    c.rect(30, 30, width - 60, height - 60)

    # Inner Lime Green Border
    c.setStrokeColor(colors.HexColor("#3ead2d"))
    c.setLineWidth(2)
    c.rect(48, 48, width - 96, height - 96)

    # --- 2. Header ---
    c.setFillColor(colors.HexColor("#1f3d33"))
    c.setFont("Helvetica-Bold", 42)
    c.drawCentredString(width / 2, height - 130, "CERTIFICATE OF COMPLETION")

    c.setFillColor(colors.HexColor("#555555"))
    c.setFont("Helvetica", 16)
    c.drawCentredString(width / 2, height - 175, "This is to proudly certify that")

    # --- 3. Student Name ---
    c.setFillColor(colors.HexColor("#1f3d33"))
    # Use a nice serif/italic font for the name
    c.setFont("Times-BoldItalic", 44)
    c.drawCentredString(width / 2, height - 250, student_name)

    # --- 4. Course Details ---
    c.setFillColor(colors.HexColor("#555555"))
    c.setFont("Helvetica", 16)
    c.drawCentredString(width / 2, height - 300, "has successfully completed the course")

    c.setFillColor(colors.HexColor("#3ead2d"))
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 360, course_title)

    # --- 5. Footer Details (Date & Code) ---
    c.setFillColor(colors.HexColor("#555555"))
    c.setFont("Helvetica", 12)
    
    # Date (Bottom Left)
    c.drawString(100, 100, f"Issue Date: {issued_date}")
    
    # Verification Code (Bottom Right)
    c.drawRightString(width - 100, 100, f"Verification Code: {certificate_code}")

    # --- 6. Decorative Seal (Center Bottom) ---
    # Draw an outer circle
    c.setStrokeColor(colors.HexColor("#1f3d33"))
    c.setFillColor(colors.HexColor("#f0f5f2")) # Very light green tint
    c.setLineWidth(2)
    c.circle(width / 2, 110, 45, stroke=1, fill=1)
    
    # Draw an inner ring
    c.setStrokeColor(colors.HexColor("#3ead2d"))
    c.setLineWidth(1)
    c.circle(width / 2, 110, 38, stroke=1, fill=0)

    # Seal Text
    c.setFillColor(colors.HexColor("#1f3d33"))
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(width / 2, 113, "OFFICIALLY")
    c.drawCentredString(width / 2, 101, "VERIFIED")

    # Finalize the PDF
    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer.getvalue()