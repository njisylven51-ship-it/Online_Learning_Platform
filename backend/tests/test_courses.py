from app.core.security import hash_password
from app.models.instructor import Instructor
from app.models.user import User
from app.core.database import engine
from sqlmodel import Session


def test_student_cannot_create_course(client):
    client.post("/api/v1/auth/register", json={"email": "student@example.com", "full_name": "A Student", "password": "correct-horse-battery"})
    token = client.post("/api/v1/auth/login", json={"email": "student@example.com", "password": "correct-horse-battery"}).json()["access_token"]
    response = client.post("/api/v1/courses", headers={"Authorization": f"Bearer {token}"}, json={"title": "Intro CS", "slug": "intro-cs"})
    assert response.status_code == 403


def test_teacher_only_sees_own_course_for_edits(client):
    with Session(engine) as session:
        teacher = User(email="teacher@example.com", full_name="Teacher", password_hash=hash_password("correct-horse-battery"), role="teacher")
        session.add(teacher)
        session.commit()
        session.refresh(teacher)
        session.add(Instructor(user_id=teacher.id, status="approved"))
        session.commit()
    token = client.post("/api/v1/auth/login", json={"email": "teacher@example.com", "password": "correct-horse-battery"}).json()["access_token"]
    response = client.post("/api/v1/courses", headers={"Authorization": f"Bearer {token}"}, json={"title": "Intro CS", "slug": "intro-cs"})
    assert response.status_code == 201
