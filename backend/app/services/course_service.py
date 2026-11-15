from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.course import Course
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.user import User
from app.models.instructor import Instructor
from app.models.course_thumbnail import CourseThumbnail
from app.core.config import settings
from app.integrations.cloudinary import delete_resource, get_resource, signed_delivery_url
from app.services.cloudinary_service import UPLOAD_PURPOSES, verify_asset_location


def get_course(session: Session, course_id: UUID) -> Course:
    course = session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


def ensure_course_owner(session: Session, course_id: UUID, user: User) -> Course:
    course = get_course(session, course_id)
    if user.role == "administrator":
        return course
    if user.role != "teacher" or course.instructor_id != user.id:
        raise HTTPException(status_code=403, detail="You do not own this course")
    instructor = session.exec(select(Instructor).where(Instructor.user_id == user.id)).first()
    if not instructor or instructor.status != "approved":
        raise HTTPException(status_code=403, detail="Instructor approval is required for this action")
    return course


def ensure_lesson_access(session: Session, lesson_id: UUID, user: User) -> tuple[Lesson, Course]:
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    module = session.get(Module, lesson.module_id)
    course = get_course(session, module.course_id)
    if user.role == "administrator":
        return lesson, course
    if user.role == "teacher" and course.instructor_id == user.id:
        instructor = session.exec(select(Instructor).where(Instructor.user_id == user.id)).first()
        if instructor and instructor.status == "approved":
            return lesson, course
    from app.models.enrolment import Enrolment

    if lesson.is_preview and course.status == "published":
        return lesson, course
    enrolment = session.exec(select(Enrolment).where(Enrolment.student_id == user.id, Enrolment.course_id == course.id, Enrolment.status == "active")).first()
    if not enrolment:
        raise HTTPException(status_code=403, detail="Active course enrolment required")
    return lesson, course


def create_course(session: Session, owner: User, **values: object) -> Course:
    if session.exec(select(Course).where(Course.slug == values.get("slug"))).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Course slug is already in use")
    category_id = values.get("category_id")
    if category_id is not None:
        from app.models.category import Category
        if not session.get(Category, category_id):
            raise HTTPException(status_code=404, detail="Course category not found")
    course = Course(instructor_id=owner.id, **values)
    session.add(course)
    session.commit()
    session.refresh(course)
    return course


def update_course(session: Session, course: Course, updates: dict[str, object]) -> Course:
    if updates.get("slug") != course.slug and session.exec(select(Course).where(Course.slug == updates.get("slug"))).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Course slug is already in use")
    category_id = updates.get("category_id")
    if category_id is not None:
        from app.models.category import Category
        if not session.get(Category, category_id):
            raise HTTPException(status_code=404, detail="Course category not found")
    if course.status == "published":
        course.status = "draft"
    for key, value in updates.items():
        setattr(course, key, value)
    session.add(course)
    session.commit()
    session.refresh(course)
    return course


def confirm_course_thumbnail(session: Session, course: Course, public_id: str) -> CourseThumbnail:
    asset = get_resource(public_id, "image")
    canonical_public_id = str(asset.get("public_id", public_id))
    if asset.get("resource_type") != "image":
        raise HTTPException(status_code=415, detail="Course thumbnail must be an image")

    purpose_subfolder, _ = UPLOAD_PURPOSES["course_thumbnail"]
    if settings.cloudinary_folder_mode.lower() == "dynamic":
        expected_base = f"asset-ids/{purpose_subfolder}/"
    else:
        expected_base = f"{settings.cloudinary_upload_folder.strip('/')}/{purpose_subfolder}/"
    if not canonical_public_id.startswith(expected_base):
        raise HTTPException(status_code=403, detail="Uploaded asset does not belong to the course thumbnail purpose")
    owner_and_asset = canonical_public_id[len(expected_base):].split("/", 1)
    if len(owner_and_asset) != 2 or not all(owner_and_asset):
        raise HTTPException(status_code=403, detail="Uploaded asset is outside its assigned course thumbnail folder")
    uploader_id = owner_and_asset[0]
    verify_asset_location("course_thumbnail", uploader_id, canonical_public_id, asset)

    image_format = str(asset.get("format", "")).lower()
    if image_format not in {"jpg", "jpeg", "png", "webp"}:
        raise HTTPException(status_code=415, detail="Course thumbnail format is not allowed")
    size_bytes = int(asset.get("bytes", 0))
    if size_bytes <= 0 or size_bytes > settings.cloudinary_max_image_size:
        raise HTTPException(status_code=413, detail="Course thumbnail exceeds the configured size limit")

    thumbnail = session.exec(select(CourseThumbnail).where(CourseThumbnail.course_id == course.id)).first()
    if thumbnail:
        if thumbnail.public_id != canonical_public_id:
            delete_resource(thumbnail.public_id, "image")
        thumbnail.public_id = canonical_public_id
        thumbnail.format = image_format
        thumbnail.bytes = size_bytes
        thumbnail.status = "ready"
    else:
        thumbnail = CourseThumbnail(
            course_id=course.id,
            public_id=canonical_public_id,
            format=image_format,
            bytes=size_bytes,
        )
    course.thumbnail = thumbnail
    session.add(thumbnail)
    session.commit()
    session.refresh(thumbnail)
    return thumbnail


def remove_course_thumbnail(session: Session, course: Course) -> None:
    thumbnail = session.exec(select(CourseThumbnail).where(CourseThumbnail.course_id == course.id)).first()
    if thumbnail:
        delete_resource(thumbnail.public_id, "image")
        session.delete(thumbnail)
        session.commit()


def thumbnail_url_for(course: Course) -> str | None:
    thumbnail = course.thumbnail
    if not thumbnail:
        return None
    return signed_delivery_url(thumbnail.public_id, thumbnail.format, "image", expires_in_seconds=300)
