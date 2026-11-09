from sqlmodel import Session, select

from app.core.database import engine
from app.core.security import hash_password, verify_password
from app.models.instructor import Instructor
from app.models.user import User


def _register_student(client, email="student@example.com"):
    return client.post("/api/v1/auth/register", json={
        "email": email,
        "full_name": "Student Account",
        "password": "correct-horse-battery",
        "role": "administrator",
    })


def _register_teacher(client, email="teacher@example.com"):
    return client.post("/api/v1/auth/register/teacher", json={
        "email": email,
        "full_name": "Teacher Account",
        "password": "correct-horse-battery",
        "bio": "Computer science educator with classroom experience.",
        "qualifications": "BSc Computer Science",
        "role": "administrator",
    })


def _token(client, email):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": "correct-horse-battery"})
    assert response.status_code == 200
    return response.json()["access_token"]


def _create_admin():
    with Session(engine) as session:
        admin = User(email="admin@example.com", full_name="Platform Admin", password_hash=hash_password("correct-horse-battery"), role="administrator")
        session.add(admin)
        session.commit()
        session.refresh(admin)
        return admin.id


def test_student_registration_is_student_only_and_duplicate_email_is_rejected(client):
    response = _register_student(client)
    assert response.status_code == 201
    assert response.json()["role"] == "student"
    assert "password_hash" not in response.json()
    assert _register_student(client).status_code == 409


def test_teacher_registration_creates_pending_profile_with_hashed_password(client, monkeypatch):
    monkeypatch.setattr("app.services.notification_service.send_email", lambda *args, **kwargs: True)
    response = _register_teacher(client)
    assert response.status_code == 201
    body = response.json()
    assert body["user"]["role"] == "teacher"
    assert body["instructor_status"] == "pending"
    assert "administrator approval" in body["message"]
    assert "password_hash" not in body["user"]

    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == "teacher@example.com")).one()
        instructor = session.exec(select(Instructor).where(Instructor.user_id == user.id)).one()
        assert instructor.status == "pending"
        assert instructor.bio.startswith("Computer science educator")
        assert instructor.qualifications == "BSc Computer Science"
        assert user.password_hash != "correct-horse-battery"
        assert verify_password("correct-horse-battery", user.password_hash)
        assert len(session.exec(select(Instructor).where(Instructor.user_id == user.id)).all()) == 1

    assert _register_teacher(client).status_code == 409
    assert _register_student(client, "teacher@example.com").status_code == 409


def test_pending_teacher_can_login_and_sees_pending_state_but_cannot_author(client):
    _register_teacher(client)
    token = _token(client, "teacher@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["role"] == "teacher"
    assert me.json()["instructor_status"] == "pending"
    assert client.post("/api/v1/courses", headers=headers, json={"title": "Intro CS", "slug": "intro-cs"}).status_code == 403
    assert client.post("/api/v1/videos/upload-signature", headers=headers).status_code == 403
    assert client.post("/api/v1/resources/upload-signature?kind=document", headers=headers).status_code == 403
    course_id = "00000000-0000-0000-0000-000000000020"
    module_id = "00000000-0000-0000-0000-000000000021"
    lesson_id = "00000000-0000-0000-0000-000000000022"
    submission_id = "00000000-0000-0000-0000-000000000023"
    assert client.post(f"/api/v1/courses/{course_id}/modules", headers=headers, json={"title": "Module"}).status_code == 403
    assert client.post(f"/api/v1/modules/{module_id}/lessons", headers=headers, json={"title": "Lesson"}).status_code == 403
    assignment_body = {"title": "Exercise", "instructions": "Submit your solution."}
    assert client.post(f"/api/v1/assignments/lessons/{lesson_id}", headers=headers, json=assignment_body).status_code == 403
    assert client.post(f"/api/v1/assignments/submissions/{submission_id}/grade", headers=headers, json={"score": 5}).status_code == 403
    quiz_body = {"title": "Sample quiz", "questions": [{"prompt": "Pick one", "choices": ["A", "B"], "correct_answers": [0]}]}
    assert client.post(f"/api/v1/quizzes/lessons/{lesson_id}", headers=headers, json=quiz_body).status_code == 403
    assert client.get("/api/v1/teacher/dashboard", headers=headers).status_code == 403


def test_admin_can_approve_teacher_and_approved_teacher_can_create_course(client, monkeypatch):
    monkeypatch.setattr("app.services.notification_service.send_email", lambda *args, **kwargs: True)
    registration = _register_teacher(client)
    instructor_id = registration.json()["instructor_id"]
    admin_id = _create_admin()
    admin_token = _token(client, "admin@example.com")
    teacher_token = _token(client, "teacher@example.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    pending = client.get("/api/v1/instructors/applications", headers=headers)
    assert pending.status_code == 200
    assert pending.json()[0]["email"] == "teacher@example.com"
    assert pending.json()[0]["bio"].startswith("Computer science educator")

    review = client.post(f"/api/v1/instructors/applications/{instructor_id}/review?approved=true", headers=headers)
    assert review.status_code == 200
    assert review.json()["status"] == "approved"
    with Session(engine) as session:
        teacher = session.exec(select(User).where(User.email == "teacher@example.com")).one()
        instructor = session.get(Instructor, instructor_id)
        assert teacher.role == "teacher"
        assert instructor.reviewed_by == admin_id
        assert instructor.reviewed_at is not None

    teacher_headers = {"Authorization": f"Bearer {teacher_token}"}
    me = client.get("/api/v1/auth/me", headers=teacher_headers).json()
    assert me["instructor_status"] == "approved"
    created = client.post("/api/v1/courses", headers=teacher_headers, json={"title": "Intro CS", "slug": "intro-cs"})
    assert created.status_code == 201


def test_rejected_teacher_can_login_but_cannot_upload_and_admin_can_list_history(client, monkeypatch):
    monkeypatch.setattr("app.services.notification_service.send_email", lambda *args, **kwargs: True)
    registration = _register_teacher(client)
    instructor_id = registration.json()["instructor_id"]
    _create_admin()
    admin_headers = {"Authorization": f"Bearer {_token(client, 'admin@example.com')}"}
    rejected = client.post(
        f"/api/v1/instructors/applications/{instructor_id}/review?approved=false&reason=Please%20provide%20more%20experience",
        headers=admin_headers,
    )
    assert rejected.status_code == 200
    assert rejected.json()["status"] == "rejected"
    assert rejected.json()["review_reason"] == "Please provide more experience"

    token = _token(client, "teacher@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/api/v1/auth/me", headers=headers).json()["instructor_status"] == "rejected"
    assert client.post("/api/v1/resources/upload-signature?kind=document", headers=headers).status_code == 403
    history = client.get("/api/v1/instructors/registrations?status_filter=rejected", headers=admin_headers)
    assert history.status_code == 200
    assert history.json()[0]["review_reason"] == "Please provide more experience"


def test_non_admin_cannot_review_and_admin_can_create_course_without_instructor_profile(client):
    registration = _register_teacher(client)
    instructor_id = registration.json()["instructor_id"]
    student_response = _register_student(client)
    assert student_response.status_code == 201
    student_headers = {"Authorization": f"Bearer {_token(client, 'student@example.com')}"}
    assert client.post(f"/api/v1/instructors/applications/{instructor_id}/review?approved=true", headers=student_headers).status_code == 403

    _create_admin()
    admin_headers = {"Authorization": f"Bearer {_token(client, 'admin@example.com')}"}
    created = client.post("/api/v1/courses", headers=admin_headers, json={"title": "Admin Course", "slug": "admin-course"})
    assert created.status_code == 201


def test_teacher_cannot_modify_another_teachers_course(client):
    _register_teacher(client, "owner@example.com")
    _register_teacher(client, "other@example.com")
    for email in ("owner@example.com", "other@example.com"):
        with Session(engine) as session:
            user = session.exec(select(User).where(User.email == email)).one()
            instructor = session.exec(select(Instructor).where(Instructor.user_id == user.id)).one()
            instructor.status = "approved"
            session.add(instructor)
            session.commit()

    owner_token = _token(client, "owner@example.com")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    course = client.post("/api/v1/courses", headers=owner_headers, json={"title": "Owned Course", "slug": "owned-course"})
    assert course.status_code == 201
    other_headers = {"Authorization": f"Bearer {_token(client, 'other@example.com')}"}
    update = client.patch(f"/api/v1/courses/{course.json()['id']}", headers=other_headers, json={"title": "Stolen Course", "slug": "owned-course"})
    assert update.status_code == 403
    self_review = client.post("/api/v1/instructors/applications/00000000-0000-0000-0000-000000000001/review?approved=true", headers=owner_headers)
    assert self_review.status_code == 403


def test_inactive_teacher_cannot_login(client):
    _register_teacher(client)
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == "teacher@example.com")).one()
        user.is_active = False
        session.add(user)
        session.commit()
    response = client.post("/api/v1/auth/login", json={"email": "teacher@example.com", "password": "correct-horse-battery"})
    assert response.status_code == 401
