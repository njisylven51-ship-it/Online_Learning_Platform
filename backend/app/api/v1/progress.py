from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_roles
from app.schemas.progress import LessonProgressUpdate
from app.services.progress_service import course_progress, update_lesson_progress

router = APIRouter(prefix="/progress", tags=["progress"])


@router.put("/lessons/{lesson_id}", dependencies=[Depends(require_roles("student"))])
def update_lesson(lesson_id: UUID, payload: LessonProgressUpdate, user: CurrentUser, session: SessionDep) -> dict[str, object]:
    progress = update_lesson_progress(session, user, lesson_id, payload.completed, payload.last_position_seconds)
    return {"lesson_id": progress.lesson_id, "completed": progress.completed, "last_position_seconds": progress.last_position_seconds}


@router.get("/courses/{course_id}")
def get_course_progress(course_id: UUID, user: CurrentUser, session: SessionDep) -> dict[str, object]:
    return course_progress(session, user, course_id)
