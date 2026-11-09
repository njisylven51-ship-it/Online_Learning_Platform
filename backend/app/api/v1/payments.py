from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_roles
from app.models.payment import Payment
from app.schemas.payment import PaymentInitiate, PaymentRead
from app.services.payment_service import create_payment, verify_test_payment

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles("student"))])
def initiate(payload: PaymentInitiate, user: CurrentUser, session: SessionDep) -> dict[str, object]:
    payment = create_payment(session, user, payload.course_id, payload.provider, payload.phone_number)
    return {"id": payment.id, "provider_reference": payment.provider_reference, "amount_xaf": payment.amount_xaf, "currency": payment.currency, "status": payment.status, "is_simulated": payment.is_simulated}


@router.get("/me", response_model=list[PaymentRead], dependencies=[Depends(require_roles("student"))])
def my_payments(user: CurrentUser, session: SessionDep) -> list[Payment]:
    return list(session.exec(select(Payment).where(Payment.student_id == user.id).order_by(Payment.created_at.desc())).all())


@router.post("/{payment_id}/verify", response_model=PaymentRead, dependencies=[Depends(require_roles("student"))])
def verify_test(payment_id: UUID, user: CurrentUser, session: SessionDep) -> Payment:
    return verify_test_payment(session, user, payment_id)


@router.post("/{payment_id}/callback/{provider}")
def provider_callback(payment_id: UUID, provider: str, session: SessionDep) -> dict[str, str]:
    raise HTTPException(status_code=501, detail=f"{provider} callback verification is not configured; payment remains pending")
