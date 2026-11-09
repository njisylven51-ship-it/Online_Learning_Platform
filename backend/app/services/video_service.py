from uuid import UUID
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlmodel import Session, select

from app.integrations.cloudinary import delete_resource, get_resource
from app.services.cloudinary_service import validate_public_id_scope, verify_asset_location
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.video import Video, VideoProgress
from app.models.user import User
from app.services.course_service import ensure_course_owner, ensure_lesson_access


def confirm_upload(session: Session, lesson_id: UUID, user: User, public_id: str) -> Video:
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    module = session.get(Module, lesson.module_id)
    ensure_course_owner(session, module.course_id, user)
    from app.core.config import settings
    validate_public_id_scope("video", str(user.id), public_id)
    asset = get_resource(public_id, "video")
    canonical_public_id = str(asset.get("public_id", public_id))
    verify_asset_location("video", str(user.id), canonical_public_id, asset)
    fmt = str(asset.get("format", "")).lower()
    if fmt not in {"mp4", "webm", "mov", "m4v"}:
        raise HTTPException(status_code=422, detail="Unsupported video format")
    size = int(asset.get("bytes", 0))
    if size > settings.cloudinary_max_video_size:
        delete_resource(canonical_public_id, "video")
        raise HTTPException(status_code=413, detail="Video exceeds the configured size limit")
    video = Video(lesson_id=lesson_id, uploaded_by=user.id, public_id=canonical_public_id, secure_url=asset["secure_url"], format=fmt, size_bytes=size, duration_seconds=float(asset.get("duration", 0)), status="ready")
    session.add(video)
    session.commit()
    session.refresh(video)
    return video


def playback(session: Session, video_id: UUID, user: User) -> Video:
    video = session.get(Video, video_id)
    if not video or video.status != "ready":
        raise HTTPException(status_code=404, detail="Ready video not found")
    ensure_lesson_access(session, video.lesson_id, user)
    return video


def update_video_progress(session: Session, video: Video, user: User, position: int, duration: int) -> VideoProgress:
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can update playback progress")
    # The authoritative duration comes from the Cloudinary asset metadata, never the client.
    duration = int(video.duration_seconds)
    if duration <= 0:
        raise HTTPException(status_code=409, detail="Video duration is not available yet")
    if position > duration + 5:
        raise HTTPException(status_code=422, detail="Playback position exceeds video duration")
    now = datetime.now(timezone.utc)
    progress = session.exec(select(VideoProgress).where(VideoProgress.video_id == video.id, VideoProgress.student_id == user.id)).first()
    if progress is None:
        initial_position = min(position, duration)
        progress = VideoProgress(video_id=video.id, student_id=user.id, position_seconds=initial_position, furthest_position_seconds=initial_position, updated_at=now)
    else:
        previous_update = progress.updated_at
        if previous_update.tzinfo is None:
            previous_update = previous_update.replace(tzinfo=timezone.utc)
        elapsed = max(0.0, (now - previous_update).total_seconds())
        bounded_position = min(position, duration)
        forward_delta = max(0, bounded_position - progress.furthest_position_seconds)
        # Count playback time only when position advances at a plausible real-time rate.
        progress.watched_seconds += int(min(forward_delta, elapsed + 1))
        progress.position_seconds = bounded_position
        progress.furthest_position_seconds = max(progress.furthest_position_seconds, bounded_position)
        progress.updated_at = now
    progress.completed = progress.watched_seconds >= duration * 0.9
    session.add(progress)
    session.commit()
    session.refresh(progress)
    return progress


def manage_video(session: Session, video_id: UUID, user: User, action: str) -> Video:
    video = session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    lesson = session.get(Lesson, video.lesson_id)
    module = session.get(Module, lesson.module_id)
    ensure_course_owner(session, module.course_id, user)
    if action == "delete":
        delete_resource(video.public_id, "video")
        video.status = "deleted"
    elif action == "retry":
        asset = get_resource(video.public_id, "video")
        if int(asset.get("bytes", 0)) > 0 and str(asset.get("format", "")).lower() in {"mp4", "webm", "mov", "m4v"}:
            video.status = "ready"
            video.size_bytes = int(asset["bytes"])
            video.duration_seconds = float(asset.get("duration", video.duration_seconds))
        else:
            raise HTTPException(status_code=409, detail="Video is not ready for playback")
    session.add(video)
    session.commit()
    session.refresh(video)
    return video
