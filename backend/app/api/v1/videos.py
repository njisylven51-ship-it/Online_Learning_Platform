from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import select

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_approved_teacher_or_admin, require_roles
from app.integrations.cloudinary import signed_delivery_url
from app.models.video import Video, VideoProgress
from app.schemas.video import VideoProgressUpdate
from app.services.cloudinary_service import upload_signature
from app.services.video_service import confirm_upload, manage_video, playback, update_video_progress

router = APIRouter(prefix="/videos", tags=["videos"])


class UploadConfirm(BaseModel):
    lesson_id: UUID
    public_id: str = Field(min_length=1, max_length=500)


@router.post("/upload-signature", dependencies=[Depends(require_approved_teacher_or_admin)])
def signature(user: CurrentUser) -> dict[str, object]:
    return upload_signature("video", str(user.id))


@router.post("/confirm", dependencies=[Depends(require_approved_teacher_or_admin)])
def confirm(payload: UploadConfirm, user: CurrentUser, session: SessionDep) -> Video:
    return confirm_upload(session, payload.lesson_id, user, payload.public_id)


@router.get("/{video_id}/playback")
def playback_url(video_id: UUID, user: CurrentUser, session: SessionDep) -> dict[str, object]:
    video = playback(session, video_id, user)
    url = signed_delivery_url(video.public_id, video.format, "video")
    return {"video_id": video.id, "playback_url": url, "expires_in_seconds": 300, "duration_seconds": video.duration_seconds, "format": video.format}


@router.put("/{video_id}/progress", dependencies=[Depends(require_roles("student"))])
def progress(video_id: UUID, payload: VideoProgressUpdate, user: CurrentUser, session: SessionDep) -> dict[str, object]:
    video = playback(session, video_id, user)
    saved = update_video_progress(session, video, user, payload.position_seconds, int(video.duration_seconds))
    return {"position_seconds": saved.position_seconds, "watched_seconds": saved.watched_seconds, "completed": saved.completed}


@router.get("/{video_id}/progress", dependencies=[Depends(require_roles("student"))])
def resume(video_id: UUID, user: CurrentUser, session: SessionDep) -> dict[str, object]:
    playback(session, video_id, user)
    progress = session.exec(select(VideoProgress).where(VideoProgress.video_id == video_id, VideoProgress.student_id == user.id)).first()
    return {"position_seconds": progress.position_seconds if progress else 0, "watched_seconds": progress.watched_seconds if progress else 0, "completed": progress.completed if progress else False}


@router.post("/{video_id}/retry", dependencies=[Depends(require_approved_teacher_or_admin)])
def retry(video_id: UUID, user: CurrentUser, session: SessionDep) -> Video:
    return manage_video(session, video_id, user, "retry")


@router.delete("/{video_id}", status_code=204, dependencies=[Depends(require_approved_teacher_or_admin)])
def delete(video_id: UUID, user: CurrentUser, session: SessionDep) -> None:
    manage_video(session, video_id, user, "delete")
