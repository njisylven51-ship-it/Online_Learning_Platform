import pytest
from uuid import UUID
from sqlmodel import Session, select

from app.core.database import engine
from app.core.security import hash_password
from app.models.course import Course
from app.models.enrolment import Enrolment
from app.models.user import User


def setup_paid_course(client, email: str, slug: str) -> tuple[dict[str, str], str]:
    client.post("/api/v1/auth/register", json={"email": email, "full_name": "Payment Student", "password": "correct-horse-battery"})
    with Session(engine) as session:
        teacher = User(email=f"teacher-{slug}@example.com", full_name="Teacher", password_hash=hash_password("correct-horse-battery"), role="teacher")
        session.add(teacher)
        session.commit()
        session.refresh(teacher)
        course = Course(instructor_id=teacher.id, title="Test course", slug=slug, status="published", price_xaf=2500)
        session.add(course)
        session.commit()
        session.refresh(course)
        course_id = str(course.id)
    token = client.post("/api/v1/auth/login", json={"email": email, "password": "correct-horse-battery"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, course_id


@pytest.mark.parametrize("phone", ["678241562", "678241563", "678241564", "678241565"])
@pytest.mark.parametrize("provider", ["mtn", "orange"])
def test_each_fixed_test_number_verifies_and_enrols_once(client, phone, provider):
    headers, course_id = setup_paid_course(client, f"{provider}-{phone}@example.com", f"payment-{provider}-{phone}")
    initiated = client.post("/api/v1/payments", headers=headers, json={"course_id": course_id, "provider": provider, "phone_number": phone})
    assert initiated.status_code == 201
    payment = initiated.json()
    assert payment["status"] == "pending"
    assert payment["is_simulated"] is True
    assert "phone_number" not in payment

    verified = client.post(f"/api/v1/payments/{payment['id']}/verify", headers=headers)
    duplicate = client.post(f"/api/v1/payments/{payment['id']}/verify", headers=headers)
    assert verified.status_code == 200
    assert verified.json()["status"] == "succeeded"
    assert duplicate.status_code == 200
    assert duplicate.json()["status"] == "succeeded"
    with Session(engine) as session:
        enrolments = session.exec(select(Enrolment).where(Enrolment.course_id == UUID(course_id))).all()
        assert len(enrolments) == 1


def test_unlisted_number_fails_without_enrolment(client):
    headers, course_id = setup_paid_course(client, "invalid-payment@example.com", "invalid-payment")
    initiated = client.post("/api/v1/payments", headers=headers, json={"course_id": course_id, "provider": "orange", "phone_number": "678241566"})
    assert initiated.status_code == 201
    result = client.post(f"/api/v1/payments/{initiated.json()['id']}/verify", headers=headers)
    assert result.status_code == 200
    assert result.json()["status"] == "failed"
    with Session(engine) as session:
        assert not session.exec(select(Enrolment).where(Enrolment.course_id == UUID(course_id))).first()


def test_tampered_payment_amount_cannot_activate_course(client):
    from app.models.payment import Payment

    headers, course_id = setup_paid_course(client, "tampered-payment@example.com", "tampered-payment")
    initiated = client.post("/api/v1/payments", headers=headers, json={"course_id": course_id, "provider": "mtn", "phone_number": "678241562"})
    payment_id = UUID(initiated.json()["id"])
    with Session(engine) as session:
        payment = session.get(Payment, payment_id)
        payment.amount_xaf = 1
        session.add(payment)
        session.commit()
    result = client.post(f"/api/v1/payments/{payment_id}/verify", headers=headers)
    assert result.status_code == 200
    assert result.json()["status"] == "failed"
    with Session(engine) as session:
        assert not session.exec(select(Enrolment).where(Enrolment.course_id == UUID(course_id))).first()
