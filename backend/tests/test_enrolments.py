def test_free_enrolment_requires_student_auth(client):
    response = client.post("/api/v1/enrolments/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 401


def test_paid_course_cannot_be_activated_through_free_enrolment(client):
    from sqlmodel import Session
    from app.core.database import engine
    from app.models.course import Course
    from app.models.user import User
    from app.core.security import hash_password

    student = User(email="paid-student@example.com", full_name="Student", password_hash=hash_password("correct-horse-battery"))
    teacher = User(email="teacher@example.com", full_name="Teacher", password_hash=hash_password("correct-horse-battery"), role="teacher")
    with Session(engine) as session:
        session.add(student)
        session.add(teacher)
        session.commit()
        session.refresh(student)
        session.add(Course(instructor_id=teacher.id, title="Paid course", slug="paid-course", status="published", price_xaf=5000))
        session.commit()
        course = session.exec(__import__("sqlmodel").select(Course).where(Course.slug == "paid-course")).first()
    token = client.post("/api/v1/auth/login", json={"email": "paid-student@example.com", "password": "correct-horse-battery"}).json()["access_token"]
    response = client.post(f"/api/v1/enrolments/{course.id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 402
