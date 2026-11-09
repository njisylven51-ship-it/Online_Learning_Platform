from datetime import timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_roles
from app.models.certificate import Certificate
from app.models.course import Course
from app.models.user import User
from app.services.certificate_service import issue_certificate
from app.services.notification_service import notify_user
from app.utils.pdf_generator import certificate_pdf

router = APIRouter(prefix="/certificates", tags=["certificates"])


@router.post("/courses/{course_id}", dependencies=[Depends(require_roles("student"))])
def issue(course_id: UUID, user: CurrentUser, session: SessionDep) -> Certificate:
    certificate = issue_certificate(session, user, course_id)
    notify_user(session, user, "Certificate available", f"Your certificate is ready. Verification code: {certificate.certificate_code}", email_subject="Your course certificate is ready")
    return certificate


@router.get("/verify/{code}")
def verify(code: str, session: SessionDep) -> dict[str, object]:
    certificate = session.exec(select(Certificate).where(Certificate.certificate_code == code)).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    user = session.get(User, certificate.student_id)
    course = session.get(Course, certificate.course_id)
    return {"valid": not certificate.revoked, "student_name": user.full_name, "course_title": course.title, "issued_at": certificate.issued_at}


@router.get("/{certificate_id}/pdf")
def download(certificate_id: UUID, user: CurrentUser, session: SessionDep) -> Response:
    certificate = session.get(Certificate, certificate_id)
    if not certificate or certificate.student_id != user.id and user.role != "administrator":
        raise HTTPException(status_code=404, detail="Certificate not found")
    if certificate.revoked:
        raise HTTPException(status_code=410, detail="Certificate revoked")
    student = session.get(User, certificate.student_id)
    course = session.get(Course, certificate.course_id)
    issued = certificate.issued_at.astimezone(timezone.utc).date().isoformat()
    content = certificate_pdf(student.full_name, course.title, certificate.certificate_code, issued)
    return Response(content=content, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="certificate-{certificate.certificate_code}.pdf"'})


@router.post("/{certificate_id}/revoke", dependencies=[Depends(require_roles("administrator"))])
def revoke(certificate_id: UUID, session: SessionDep) -> dict[str, str]:
    certificate = session.get(Certificate, certificate_id)
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    certificate.revoked = True
    session.add(certificate)
    session.commit()
    return {"status": "revoked"}
