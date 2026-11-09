def test_playback_requires_authentication(client):
    response = client.get("/api/v1/videos/00000000-0000-0000-0000-000000000000/playback")
    assert response.status_code == 401


def test_enrolled_student_cannot_play_processing_video(client):
    from sqlmodel import Session
    from app.core.database import engine
    from app.core.security import hash_password
    from app.models.course import Course
    from app.models.enrolment import Enrolment
    from app.models.lesson import Lesson
    from app.models.module import Module
    from app.models.user import User
    from app.models.video import Video

    student = User(email="video-student@example.com", full_name="Student", password_hash=hash_password("correct-horse-battery"))
    teacher = User(email="video-teacher@example.com", full_name="Teacher", password_hash=hash_password("correct-horse-battery"), role="teacher")
    with Session(engine) as session:
        session.add(student)
        session.add(teacher)
        session.commit()
        session.refresh(student)
        session.refresh(teacher)
        course = Course(instructor_id=teacher.id, title="Course", slug="video-course", status="published")
        session.add(course)
        session.flush()
        module = Module(course_id=course.id, title="Module")
        session.add(module)
        session.flush()
        lesson = Lesson(module_id=module.id, title="Lesson")
        session.add(lesson)
        session.flush()
        video = Video(lesson_id=lesson.id, uploaded_by=teacher.id, public_id="private/test", secure_url="https://example.invalid", format="mp4", size_bytes=10, status="processing")
        session.add(video)
        session.add(Enrolment(student_id=student.id, course_id=course.id, status="active"))
        session.commit()
        video_id = video.id
    token = client.post("/api/v1/auth/login", json={"email": "video-student@example.com", "password": "correct-horse-battery"}).json()["access_token"]
    response = client.get(f"/api/v1/videos/{video_id}/playback", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
