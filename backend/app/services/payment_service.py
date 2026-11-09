from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.course import Course
from app.models.enrolment import Enrolment
from app.models.payment import Payment
from app.models.user import User
from app.core.config import settings
from app.integrations.payments.mock import MockPaymentProvider
from app.services.notification_service import notify_user


def create_payment(session: Session, student: User, course_id: UUID, provider: str, phone_number: str) -> Payment:
    course = session.get(Course, course_id)
    if not course or course.status != "published":
        raise HTTPException(status_code=404, detail="Published course not found")
    if course.price_xaf <= 0:
        raise HTTPException(status_code=422, detail="Course does not require payment")
    if session.exec(select(Enrolment).where(Enrolment.student_id == student.id, Enrolment.course_id == course.id, Enrolment.status == "active")).first():
        raise HTTPException(status_code=409, detail="Already enrolled")
    reference = str(uuid4())
    if settings.payment_mode.lower() == "mock" and settings.app_env.lower() in {"development", "dev", "test"}:
        intent = MockPaymentProvider().initiate(reference, course.price_xaf, phone_number)
    else:
        from app.integrations.payments.mtn import MTNProvider
        from app.integrations.payments.orange import OrangeProvider
        provider_client = MTNProvider() if provider == "mtn" else OrangeProvider()
        intent = provider_client.initiate(reference, course.price_xaf, phone_number)
    payment = Payment(student_id=student.id, course_id=course.id, provider=provider, phone_number=phone_number, provider_reference=intent.reference, amount_xaf=course.price_xaf, is_simulated=intent.simulated)
    session.add(payment)
    session.commit()
    session.refresh(payment)
    # A real provider initiation remains unavailable until its approved merchant
    # contract is integrated. Only the explicitly simulated test adapter is active now.
    return payment


def verify_test_payment(session: Session, student: User, payment_id: UUID) -> Payment:
    if settings.payment_mode.lower() != "mock" or settings.app_env.lower() not in {"development", "dev", "test"}:
        raise HTTPException(status_code=404, detail="Test payment verification is unavailable")
    payment = session.get(Payment, payment_id)
    if not payment or payment.student_id != student.id:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.status == "succeeded":
        return payment
    if payment.status != "pending" or not payment.is_simulated:
        raise HTTPException(status_code=409, detail="Payment cannot be verified in its current state")
    course = session.get(Course, payment.course_id)
    valid_amount = bool(course and course.status == "published" and payment.currency == "XAF" and payment.amount_xaf == course.price_xaf)
    accepted = valid_amount and MockPaymentProvider().verify(payment.phone_number, payment.amount_xaf, payment.currency)
    if not accepted:
        payment.status = "failed"
        session.add(payment)
        session.commit()
        session.refresh(payment)
        return payment
    payment.status = "succeeded"
    payment.verified_at = datetime.now(timezone.utc)
    enrolment = session.exec(select(Enrolment).where(Enrolment.student_id == student.id, Enrolment.course_id == payment.course_id)).first()
    if enrolment:
        enrolment.status = "active"
        session.add(enrolment)
    else:
        session.add(Enrolment(student_id=student.id, course_id=payment.course_id, status="active"))
    session.add(payment)
    session.commit()
    session.refresh(payment)
    notify_user(session, student, "Payment confirmed", f"Your simulated payment for '{course.title}' was verified and course access is active.", email_subject="Course payment confirmed")
    return payment
