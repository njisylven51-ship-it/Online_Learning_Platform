from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from uuid import UUID

from app.core.dependencies import CurrentUser, SessionDep
from app.core.permissions import require_approved_teacher_or_admin
from app.core.config import settings
from app.integrations.cloudinary import delete_resource, get_resource, signed_delivery_url
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.resource import Resource
from app.services.cloudinary_service import upload_signature, validate_public_id_scope, verify_asset_location
from app.services.course_service import ensure_course_owner, ensure_lesson_access

router = APIRouter(prefix="/resources", tags=["resources"])


class ResourceConfirmation(BaseModel):
    lesson_id: UUID
    title: str
    public_id: str
    resource_type: str


@router.post("/upload-signature", dependencies=[Depends(require_approved_teacher_or_admin)])
def signature(kind: str, user: CurrentUser) -> dict[str, object]:
    if kind not in ("image", "document"):
        raise HTTPException(status_code=422, detail="Unsupported resource type")
    purpose = "resource_image" if kind == "image" else "resource_document"
    return upload_signature(purpose, str(user.id))


@router.post("/confirm", dependencies=[Depends(require_approved_teacher_or_admin)])
def confirm(payload: ResourceConfirmation, user: CurrentUser, session: SessionDep) -> Resource:
    lesson = session.get(Lesson, payload.lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    module = session.get(Module, lesson.module_id)
    ensure_course_owner(session, module.course_id, user)
    kind = "image" if payload.resource_type == "image" else "raw" if payload.resource_type == "document" else None
    if not kind:
        raise HTTPException(status_code=422, detail="Unsupported resource type")
    purpose = "resource_image" if payload.resource_type == "image" else "resource_document"
    validate_public_id_scope(purpose, str(user.id), payload.public_id)
    asset = get_resource(payload.public_id, kind)
    canonical_public_id = str(asset.get("public_id", payload.public_id))
    verify_asset_location(purpose, str(user.id), canonical_public_id, asset)
    size_bytes = int(asset.get("bytes", 0))
    limit = settings.cloudinary_max_image_size if kind == "image" else settings.cloudinary_max_document_size
    if size_bytes > limit:
        delete_resource(canonical_public_id, kind)
        raise HTTPException(status_code=413, detail="Resource exceeds the configured size limit")
    fmt = str(asset.get("format", "")).lower()
    expected_formats = {"image": {"jpg", "jpeg", "png", "webp"}, "document": {"pdf", ""}}
    if fmt not in expected_formats[payload.resource_type]:
        delete_resource(canonical_public_id, kind)
        raise HTTPException(status_code=415, detail="Uploaded resource type is not allowed")
    mime_type = "application/pdf" if fmt == "pdf" else f"image/{'jpeg' if fmt in ('jpg', 'jpeg') else fmt}"
    resource = Resource(lesson_id=lesson.id, uploaded_by=user.id, title=payload.title, resource_type=payload.resource_type, storage_public_id=canonical_public_id, secure_url=asset["secure_url"], mime_type=mime_type, size_bytes=size_bytes, status="ready")
    session.add(resource)
    session.commit()
    session.refresh(resource)
    return resource


@router.get("/lessons/{lesson_id}")
def list_lesson_resources(lesson_id: UUID, user: CurrentUser, session: SessionDep) -> list[Resource]:
    ensure_lesson_access(session, lesson_id, user)
    from sqlmodel import select
    items = session.exec(select(Resource).where(Resource.lesson_id == lesson_id, Resource.status == "ready")).all()
    return [{"id": item.id, "title": item.title, "resource_type": item.resource_type, "mime_type": item.mime_type, "size_bytes": item.size_bytes, "download_url": signed_delivery_url(item.storage_public_id, "pdf" if item.mime_type == "application/pdf" else "jpg" if item.mime_type == "image/jpeg" else item.mime_type.split("/")[-1], "image" if item.resource_type == "image" else "raw"), "expires_in_seconds": 300} for item in items]
