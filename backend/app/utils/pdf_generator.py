from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def certificate_pdf(student_name: str, course_title: str, code: str, issued_date: str) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    pdf.setTitle("Course Certificate")
    pdf.setFont("Helvetica-Bold", 25)
    pdf.drawCentredString(width / 2, height - 150, "Certificate of Completion")
    pdf.setFont("Helvetica", 14)
    pdf.drawCentredString(width / 2, height - 220, "This certifies that")
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawCentredString(width / 2, height - 265, student_name)
    pdf.setFont("Helvetica", 14)
    pdf.drawCentredString(width / 2, height - 320, "has successfully completed")
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawCentredString(width / 2, height - 360, course_title[:70])
    pdf.setFont("Helvetica", 10)
    pdf.drawCentredString(width / 2, 90, f"Certificate ID: {code}  |  Issued: {issued_date}")
    pdf.save()
    return buffer.getvalue()
