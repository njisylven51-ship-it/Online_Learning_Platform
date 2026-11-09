def test_student_cannot_create_quiz_without_teacher_role(client):
    client.post("/api/v1/auth/register", json={"email": "student@example.com", "full_name": "A Student", "password": "correct-horse-battery"})
    token = client.post("/api/v1/auth/login", json={"email": "student@example.com", "password": "correct-horse-battery"}).json()["access_token"]
    response = client.post("/api/v1/quizzes/lessons/00000000-0000-0000-0000-000000000000", headers={"Authorization": f"Bearer {token}"}, json={"title": "Quiz", "questions": [{"prompt": "Q?", "choices": ["A", "B"], "correct_answers": [0]}]})
    assert response.status_code == 403


def test_quiz_attempt_returns_score_without_revealing_answers(client):
    from sqlmodel import Session
    from app.core.database import engine
    from app.core.security import hash_password
    from app.models.course import Course
    from app.models.enrolment import Enrolment
    from app.models.lesson import Lesson
    from app.models.module import Module
    from app.models.quiz import Question, Quiz
    from app.models.user import User

    student = User(email="quiz-student@example.com", full_name="Student", password_hash=hash_password("correct-horse-battery"))
    teacher = User(email="quiz-teacher@example.com", full_name="Teacher", password_hash=hash_password("correct-horse-battery"), role="teacher")
    with Session(engine) as session:
        session.add(student)
        session.add(teacher)
        session.commit()
        session.refresh(student)
        session.refresh(teacher)
        course = Course(instructor_id=teacher.id, title="Course", slug="quiz-course", status="published")
        session.add(course)
        session.flush()
        module = Module(course_id=course.id, title="Module")
        session.add(module)
        session.flush()
        lesson = Lesson(module_id=module.id, title="Lesson")
        session.add(lesson)
        session.flush()
        quiz = Quiz(lesson_id=lesson.id, title="Quiz", is_published=True, max_attempts=1)
        session.add(quiz)
        session.flush()
        question = Question(quiz_id=quiz.id, prompt="Correct?", choices=["yes", "no"], correct_answers=[0])
        session.add(question)
        session.add(Enrolment(student_id=student.id, course_id=course.id, status="active"))
        session.commit()
        quiz_id, question_id = quiz.id, question.id
    token = client.post("/api/v1/auth/login", json={"email": "quiz-student@example.com", "password": "correct-horse-battery"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    quiz_response = client.get(f"/api/v1/quizzes/{quiz_id}", headers=headers)
    assert quiz_response.status_code == 200
    assert "correct_answers" not in quiz_response.text
    attempt = client.post(f"/api/v1/quizzes/{quiz_id}/attempts", headers=headers, json={"answers": {str(question_id): [0]}})
    assert attempt.status_code == 200
    assert attempt.json()["passed"] is True
    duplicate = client.post(f"/api/v1/quizzes/{quiz_id}/attempts", headers=headers, json={"answers": {str(question_id): [0]}})
    assert duplicate.status_code == 409
