from uuid import UUID

import pytest
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import engine
from app.core.security import hash_password
from app.models.course import Course
from app.models.course_thumbnail import CourseThumbnail
from app.models.instructor import Instructor
from app.models.user import User


def make_user(email: str, role: str = "teacher", approved: bool = True) -> User:
    with Session(engine) as session:
        user = User(
            email=email,
            full_name=email.split("@")[0],
            password_hash=hash_password("correct-horse-battery"),
            role=role,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        if role == "teacher":
            session.add(Instructor(user_id=user.id, status="approved" if approved else "pending"))
            session.commit()
        session.expunge(user)
        return user


def make_course(owner_id: UUID, *, status: str = "draft", slug: str = "thumbnail-course") -> Course:
    with Session(engine) as session:
        course = Course(
            instructor_id=owner_id,
            title="Thumbnail course",
            slug=slug,
            status=status,
        )
        session.add(course)
        session.commit()
        session.refresh(course)
        session.expunge(course)
        return course


def auth_header(client, email: str) -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "correct-horse-battery"},
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def cloudinary_asset(public_id: str, *, fmt: str = "png", size: int = 2048, folder: str | None = None) -> dict:
    return {
        "public_id": public_id,
        "resource_type": "image",
        "format": fmt,
        "bytes": size,
        "asset_folder": folder or f"learning-platform/courses/{public_id.split('/')[-2]}",
        "secure_url": "https://cloudinary.example/unused",
    }


def fixed_public_id(owner_id: UUID, name: str) -> str:
    return f"learning-platform/courses/{owner_id}/{name}"


def test_course_thumbnail_table_is_registered_without_course_columns():
    from sqlmodel import SQLModel

    assert "course_thumbnail" in SQLModel.metadata.tables
    assert "thumbnail" not in Course.__table__.columns
    assert "thumbnail_url" not in Course.__table__.columns


def test_signature_requires_approved_teacher_or_admin(client, monkeypatch):
    from app.api.v1 import courses as courses_api

    student = make_user("thumbnail-student@example.com", role="student")
    monkeypatch.setattr(courses_api, "upload_signature", lambda purpose, owner: {"purpose": purpose, "owner": owner})
    response = client.post("/api/v1/courses/upload-signature", headers=auth_header(client, student.email))
    assert response.status_code == 403

    pending = make_user("thumbnail-pending@example.com", approved=False)
    response = client.post("/api/v1/courses/upload-signature", headers=auth_header(client, pending.email))
    assert response.status_code == 403

    approved = make_user("thumbnail-approved@example.com")
    response = client.post("/api/v1/courses/upload-signature", headers=auth_header(client, approved.email))
    assert response.status_code == 200
    assert response.json() == {"purpose": "course_thumbnail", "owner": str(approved.id)}

    admin = make_user("thumbnail-signature-admin@example.com", role="administrator")
    response = client.post("/api/v1/courses/upload-signature", headers=auth_header(client, admin.email))
    assert response.status_code == 200
    assert response.json() == {"purpose": "course_thumbnail", "owner": str(admin.id)}


def test_confirm_rejects_non_owner(client, monkeypatch):
    from app.services import course_service

    owner = make_user("thumbnail-owner@example.com")
    other = make_user("thumbnail-other@example.com")
    course = make_course(owner.id)
    monkeypatch.setattr(course_service, "get_resource", lambda *args: pytest.fail("provider lookup should not run"))
    response = client.put(
        f"/api/v1/courses/{course.id}/thumbnail",
        headers=auth_header(client, other.email),
        json={"public_id": fixed_public_id(other.id, "asset")},
    )
    assert response.status_code == 403


@pytest.mark.parametrize(
    ("fmt", "size", "public_id", "expected_status"),
    [
        ("gif", 2048, "valid", 415),
        ("png", 10 * 1024 * 1024 + 1, "valid", 413),
        ("png", 2048, "wrong-scope", 403),
    ],
)
def test_confirm_rejects_invalid_thumbnail_assets(client, monkeypatch, fmt, size, public_id, expected_status):
    from app.services import course_service

    owner = make_user(f"thumbnail-invalid-{fmt}-{size}-{public_id}@example.com")
    course = make_course(owner.id, slug=f"thumbnail-invalid-{fmt}-{size}-{public_id}")
    asset_id = fixed_public_id(owner.id, "asset") if public_id == "valid" else f"learning-platform/resources/images/{owner.id}/asset"
    monkeypatch.setattr(course_service, "get_resource", lambda *_: cloudinary_asset(asset_id, fmt=fmt, size=size))
    response = client.put(
        f"/api/v1/courses/{course.id}/thumbnail",
        headers=auth_header(client, owner.email),
        json={"public_id": asset_id},
    )
    assert response.status_code == expected_status


def test_confirm_replaces_thumbnail_and_preserves_course_status(client, monkeypatch):
    from app.services import course_service

    owner = make_user("thumbnail-replace@example.com")
    course = make_course(owner.id, status="published")
    old_id = fixed_public_id(owner.id, "old")
    new_id = fixed_public_id(owner.id, "new")
    with Session(engine) as session:
        session.add(CourseThumbnail(course_id=course.id, public_id=old_id, format="jpg", bytes=100))
        session.commit()

    deleted = []
    monkeypatch.setattr(course_service, "get_resource", lambda *_: cloudinary_asset(new_id))
    monkeypatch.setattr(course_service, "delete_resource", lambda asset_id, resource_type: deleted.append((asset_id, resource_type)))
    monkeypatch.setattr(course_service, "signed_delivery_url", lambda asset_id, fmt, kind, expires_in_seconds: f"signed:{asset_id}")
    response = client.put(
        f"/api/v1/courses/{course.id}/thumbnail",
        headers=auth_header(client, owner.email),
        json={"public_id": new_id},
    )
    assert response.status_code == 200
    assert response.json() == {"thumbnail_url": f"signed:{new_id}"}
    assert deleted == [(old_id, "image")]
    with Session(engine) as session:
        current_course = session.get(Course, course.id)
        thumbnail = session.exec(select(CourseThumbnail).where(CourseThumbnail.course_id == course.id)).one()
        assert current_course.status == "published"
        assert thumbnail.public_id == new_id


def test_dynamic_folder_assets_are_verified(client, monkeypatch):
    from app.services import course_service

    owner = make_user("thumbnail-dynamic@example.com")
    course = make_course(owner.id)
    public_id = f"asset-ids/courses/{owner.id}/asset-1"
    monkeypatch.setattr(settings, "cloudinary_folder_mode", "dynamic")
    monkeypatch.setattr(
        course_service,
        "get_resource",
        lambda *_: cloudinary_asset(public_id, folder=f"learning-platform/courses/{owner.id}"),
    )
    monkeypatch.setattr(course_service, "signed_delivery_url", lambda *args, **kwargs: "signed:thumbnail")
    response = client.put(
        f"/api/v1/courses/{course.id}/thumbnail",
        headers=auth_header(client, owner.email),
        json={"public_id": public_id},
    )
    assert response.status_code == 200
    monkeypatch.setattr(settings, "cloudinary_folder_mode", "fixed")


def test_delete_requires_owner_and_removes_provider_asset_and_row(client, monkeypatch):
    from app.services import course_service

    owner = make_user("thumbnail-delete-owner@example.com")
    other = make_user("thumbnail-delete-other@example.com")
    course = make_course(owner.id)
    asset_id = fixed_public_id(owner.id, "delete-me")
    with Session(engine) as session:
        session.add(CourseThumbnail(course_id=course.id, public_id=asset_id, format="png", bytes=100))
        session.commit()
    deleted = []
    monkeypatch.setattr(course_service, "delete_resource", lambda public_id, kind: deleted.append((public_id, kind)))

    denied = client.delete(
        f"/api/v1/courses/{course.id}/thumbnail",
        headers=auth_header(client, other.email),
    )
    assert denied.status_code == 403
    accepted = client.delete(
        f"/api/v1/courses/{course.id}/thumbnail",
        headers=auth_header(client, owner.email),
    )
    assert accepted.status_code == 204
    assert deleted == [(asset_id, "image")]
    with Session(engine) as session:
        assert session.exec(select(CourseThumbnail).where(CourseThumbnail.course_id == course.id)).first() is None


def test_course_detail_includes_signed_thumbnail_url(client, monkeypatch):
    from app.services import course_service

    owner = make_user("thumbnail-read@example.com")
    course = make_course(owner.id, status="published")
    asset_id = fixed_public_id(owner.id, "published")
    with Session(engine) as session:
        session.add(CourseThumbnail(course_id=course.id, public_id=asset_id, format="webp", bytes=512))
        session.commit()
    signed = []

    def sign(public_id, fmt, resource_type, expires_in_seconds):
        signed.append((public_id, fmt, resource_type, expires_in_seconds))
        return "https://delivery.example/signed-thumbnail"

    monkeypatch.setattr(course_service, "signed_delivery_url", sign)
    detail = client.get(f"/api/v1/courses/{course.id}")
    assert detail.status_code == 200
    assert detail.json()["thumbnail_url"] == "https://delivery.example/signed-thumbnail"
    assert signed == [(asset_id, "webp", "image", 300)]


def test_course_list_and_mine_include_thumbnail_url(client, monkeypatch):
    from app.services import course_service

    owner = make_user("thumbnail-list-owner@example.com")
    course = make_course(owner.id, status="published", slug="thumbnail-list-course")
    asset_id = fixed_public_id(owner.id, "list")
    with Session(engine) as session:
        session.add(CourseThumbnail(course_id=course.id, public_id=asset_id, format="png", bytes=512))
        session.commit()
    monkeypatch.setattr(course_service, "signed_delivery_url", lambda *args, **kwargs: "https://delivery.example/list")

    public_list = client.get("/api/v1/courses")
    assert public_list.status_code == 200
    assert next(item for item in public_list.json() if item["id"] == str(course.id))["thumbnail_url"] == "https://delivery.example/list"

    mine = client.get("/api/v1/courses/mine", headers=auth_header(client, owner.email))
    assert mine.status_code == 200
    assert next(item for item in mine.json() if item["id"] == str(course.id))["thumbnail_url"] == "https://delivery.example/list"


def test_draft_course_thumbnail_is_hidden_from_non_owner(client, monkeypatch):
    from app.services import course_service

    owner = make_user("thumbnail-draft-owner@example.com")
    other = make_user("thumbnail-draft-other@example.com")
    course = make_course(owner.id, slug="thumbnail-draft-private")
    with Session(engine) as session:
        session.add(CourseThumbnail(course_id=course.id, public_id=fixed_public_id(owner.id, "draft"), format="png", bytes=512))
        session.commit()
    monkeypatch.setattr(course_service, "signed_delivery_url", lambda *args, **kwargs: "should-not-be-issued")
    response = client.get(
        f"/api/v1/courses/{course.id}/thumbnail",
        headers=auth_header(client, other.email),
    )
    assert response.status_code == 404


def test_admin_courses_response_includes_thumbnail_url(client, monkeypatch):
    from app.models.user import User
    from app.services import course_service

    admin = make_user("thumbnail-admin@example.com", role="administrator")
    teacher = make_user("thumbnail-admin-course@example.com")
    course = make_course(teacher.id, status="draft", slug="thumbnail-admin-course")
    asset_id = fixed_public_id(teacher.id, "admin-list")
    with Session(engine) as session:
        session.add(CourseThumbnail(course_id=course.id, public_id=asset_id, format="png", bytes=512))
        session.commit()
    monkeypatch.setattr(course_service, "signed_delivery_url", lambda *args, **kwargs: "https://delivery.example/admin")
    response = client.get("/api/v1/admin/courses", headers=auth_header(client, admin.email))
    assert response.status_code == 200
    assert next(item for item in response.json() if item["id"] == str(course.id))["thumbnail_url"] == "https://delivery.example/admin"
