from uuid import UUID

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.quiz import Question, Quiz, QuizAttempt
from app.models.lesson import Lesson
from app.models.user import User


def grade_quiz(session: Session, quiz_id: UUID, student: User, answers: dict[UUID, list[int]]) -> QuizAttempt:
    quiz = session.get(Quiz, quiz_id)
    if not quiz or not quiz.is_published:
        raise HTTPException(status_code=404, detail="Quiz not found")
    lesson = session.get(Lesson, quiz.lesson_id)
    from app.services.course_service import ensure_lesson_access
    ensure_lesson_access(session, lesson.id, student)
    attempts = session.exec(select(QuizAttempt).where(QuizAttempt.quiz_id == quiz.id, QuizAttempt.student_id == student.id)).all()
    if len(attempts) >= quiz.max_attempts:
        raise HTTPException(status_code=409, detail="Maximum quiz attempts reached")
    questions = session.exec(select(Question).where(Question.quiz_id == quiz.id)).all()
    if not questions:
        raise HTTPException(status_code=409, detail="Quiz has no questions")
    total = sum(question.points for question in questions)
    earned = 0.0
    normalized: dict[str, list[int]] = {}
    for question in questions:
        selected = sorted(set(answers.get(question.id, [])))
        normalized[str(question.id)] = selected
        if any(index < 0 or index >= len(question.choices) for index in selected):
            raise HTTPException(status_code=422, detail="Answer choice is out of range")
        if selected == sorted(question.correct_answers):
            earned += question.points
    result = QuizAttempt(quiz_id=quiz.id, student_id=student.id, answers=normalized, score=round(earned / total * 100, 2), passed=earned / total * 100 >= quiz.passing_score)
    session.add(result)
    session.commit()
    session.refresh(result)
    return result
