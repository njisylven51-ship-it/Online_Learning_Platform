from uuid import UUID
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.lesson import Lesson
from app.models.course import Course
from app.models.module import Module
from app.models.progress import Progress
from app.models.user import User
from app.models.quiz import Quiz, QuizAttempt
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.video import Video, VideoProgress
from app.services.course_service import ensure_lesson_access


def update_lesson_progress(
    session: Session,
    student: User,
    lesson_id: UUID,
    completed: bool,
    position: int,
) -> Progress:
    lesson, course = ensure_lesson_access(session, lesson_id, student)

    if student.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Student progress can only be updated by its owner",
        )

    progress = session.exec(
        select(Progress).where(
            Progress.student_id == student.id,
            Progress.lesson_id == lesson.id,
        )
    ).first()
    if progress is None:
        progress = Progress(
            student_id=student.id,
            course_id=course.id,
            lesson_id=lesson.id,
        )

    if completed:
        # --- Video requirement ---
        videos = session.exec(
            select(Video).where(
                Video.lesson_id == lesson.id,
                Video.status == "ready",
            )
        ).all()

        for video in videos:
            vp = session.exec(
                select(VideoProgress).where(
                    VideoProgress.video_id == video.id,
                    VideoProgress.student_id == student.id,
                )
            ).first()
            if not vp or not vp.completed:
                watched = vp.watched_seconds if vp else 0
                required = int(video.duration_seconds * 0.9)
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"Video has not been watched enough. "
                        f"Watched {watched}s of {int(video.duration_seconds)}s "
                        f"(need at least {required}s = 90%)."
                    ),
                )

        # --- Quiz requirement ---
        quizzes = session.exec(
            select(Quiz).where(
                Quiz.lesson_id == lesson.id,
                Quiz.is_published == True,
            )
        ).all()

        for quiz in quizzes:
            passed_attempt = session.exec(
                select(QuizAttempt).where(
                    QuizAttempt.quiz_id == quiz.id,
                    QuizAttempt.student_id == student.id,
                    QuizAttempt.passed == True,
                )
            ).first()
            if not passed_attempt:
                raise HTTPException(
                    status_code=409,
                    detail=f"Pass the quiz '{quiz.title}' before marking this lesson complete.",
                )

        # --- Assignment requirement ---
        assignments = session.exec(
            select(Assignment).where(Assignment.lesson_id == lesson.id)
        ).all()

        for assignment in assignments:
            submission = session.exec(
                select(AssignmentSubmission).where(
                    AssignmentSubmission.assignment_id == assignment.id,
                    AssignmentSubmission.student_id == student.id,
                )
            ).first()
            if not submission:
                raise HTTPException(
                    status_code=409,
                    detail=f"Submit the assignment '{assignment.title}' before marking this lesson complete.",
                )

    progress.completed = completed
    progress.last_position_seconds = position
    progress.updated_at = datetime.now(timezone.utc)
    session.add(progress)
    session.commit()
    session.refresh(progress)
    return progress


def course_progress(
    session: Session,
    student: User,
    course_id: UUID,
) -> dict[str, object]:
    from app.models.enrolment import Enrolment

    enrolled = session.exec(
        select(Enrolment).where(
            Enrolment.student_id == student.id,
            Enrolment.course_id == course_id,
            Enrolment.status == "active",
        )
    ).first()

    if student.role == "teacher":
        course = session.get(Course, course_id)
        if not course or course.instructor_id != student.id:
            raise HTTPException(status_code=403, detail="You do not own this course")

    if not enrolled and student.role == "student":
        raise HTTPException(
            status_code=403,
            detail="Active course enrolment required",
        )

    modules = session.exec(
        select(Module).where(Module.course_id == course_id)
    ).all()
    lessons = [
        lesson
        for module in modules
        for lesson in session.exec(
            select(Lesson).where(Lesson.module_id == module.id)
        ).all()
    ]

    completed = session.exec(
        select(Progress).where(
            Progress.student_id == student.id,
            Progress.course_id == course_id,
            Progress.completed == True,
        )
    ).all()

    count = len(lessons)
    return {
        "course_id": course_id,
        "completed_lessons": len(completed),
        "total_lessons": count,
        "percentage": round(len(completed) / count * 100, 2) if count else 0.0,
    }