from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_approved_teacher_or_admin, require_roles
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.quiz import Question, Quiz
from app.schemas.quiz import QuizAnswer, QuizCreate
from app.services.course_service import ensure_course_owner, ensure_lesson_access
from app.services.quiz_service import grade_quiz

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.post("/lessons/{lesson_id}", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_approved_teacher_or_admin)])
def create_quiz(lesson_id: UUID, payload: QuizCreate, user: CurrentUser, session: SessionDep) -> dict[str, object]:
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    module = session.get(Module, lesson.module_id)
    ensure_course_owner(session, module.course_id, user)
    quiz = Quiz(lesson_id=lesson_id, title=payload.title, passing_score=payload.passing_score, max_attempts=payload.max_attempts)
    session.add(quiz)
    session.flush()
    for question in payload.questions:
        if any(i < 0 or i >= len(question.choices) for i in question.correct_answers):
            raise HTTPException(status_code=422, detail="Correct answer index is out of range")
        if question.question_type not in ("single_choice", "multiple_choice", "true_false"):
            raise HTTPException(status_code=422, detail="Unsupported question type")
        if question.question_type == "single_choice" and (len(set(question.correct_answers)) != 1 or len(question.choices) < 2):
            raise HTTPException(status_code=422, detail="Single-choice questions need exactly one correct option")
        if question.question_type == "multiple_choice" and len(set(question.correct_answers)) < 1:
            raise HTTPException(status_code=422, detail="Multiple-choice questions need at least one correct option")
        if question.question_type == "true_false" and len(question.choices) != 2:
            raise HTTPException(status_code=422, detail="True/False questions need exactly two options")
        session.add(Question(quiz_id=quiz.id, **question.model_dump()))
    session.commit()
    session.refresh(quiz)
    return {"id": quiz.id, "lesson_id": quiz.lesson_id, "title": quiz.title, "passing_score": quiz.passing_score, "max_attempts": quiz.max_attempts, "is_published": quiz.is_published}


@router.get("/lessons/{lesson_id}")
def list_lesson_quizzes(lesson_id: UUID, user: CurrentUser, session: SessionDep) -> list[dict[str, object]]:
    ensure_lesson_access(session, lesson_id, user)
    quizzes = session.exec(select(Quiz).where(Quiz.lesson_id == lesson_id, Quiz.is_published == True)).all()
    return [{"id": quiz.id, "title": quiz.title, "passing_score": quiz.passing_score, "max_attempts": quiz.max_attempts} for quiz in quizzes]


@router.post("/{quiz_id}/publish", dependencies=[Depends(require_approved_teacher_or_admin)])
def publish_quiz(quiz_id: UUID, user: CurrentUser, session: SessionDep) -> dict[str, str]:
    quiz = session.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    lesson = session.get(Lesson, quiz.lesson_id)
    module = session.get(Module, lesson.module_id)
    ensure_course_owner(session, module.course_id, user)
    if not session.exec(select(Question).where(Question.quiz_id == quiz.id)).first():
        raise HTTPException(status_code=409, detail="Add at least one question before publishing")
    quiz.is_published = True
    session.add(quiz)
    session.commit()
    return {"status": "published"}


@router.get("/{quiz_id}")
def get_quiz(quiz_id: UUID, user: CurrentUser, session: SessionDep) -> dict[str, object]:
    quiz = session.get(Quiz, quiz_id)
    if not quiz or not quiz.is_published:
        raise HTTPException(status_code=404, detail="Quiz not found")
    ensure_lesson_access(session, quiz.lesson_id, user)
    questions = session.exec(select(Question).where(Question.quiz_id == quiz.id).order_by(Question.position)).all()
    return {"id": quiz.id, "title": quiz.title, "passing_score": quiz.passing_score, "questions": [{"id": q.id, "prompt": q.prompt, "question_type": q.question_type, "choices": q.choices, "points": q.points} for q in questions]}


@router.post("/{quiz_id}/attempts", dependencies=[Depends(require_roles("student"))])
def submit_attempt(quiz_id: UUID, payload: QuizAnswer, user: CurrentUser, session: SessionDep) -> dict[str, object]:
    result = grade_quiz(session, quiz_id, user, payload.answers)
    return {"id": result.id, "score": result.score, "passed": result.passed, "submitted_at": result.submitted_at}
