from app.core.config import settings
from app.integrations.cloudinary import create_upload_signature

UPLOAD_PURPOSES: dict[str, tuple[str, str]] = {
    "video": ("videos", "video"),
    "resource_image": ("resources/images", "image"),
    "resource_document": ("resources/documents", "raw"),
    "assignment": ("resources/assignments", "raw"),
    "course_thumbnail": ("courses", "image"),
    "profile_picture": ("profiles", "image"),
    "lesson_image": ("lessons", "image"),
}


def upload_folder(purpose: str, owner_id: str) -> str:
    try:
        subfolder, _ = UPLOAD_PURPOSES[purpose]
    except KeyError:
        raise ValueError("Unsupported upload purpose") from None
    return f"{settings.cloudinary_upload_folder.strip('/')}/{subfolder}/{owner_id}"


def expected_public_id_prefix(purpose: str, owner_id: str) -> str:
    if settings.cloudinary_folder_mode.lower() == "dynamic":
        subfolder, _ = UPLOAD_PURPOSES[purpose]
        return f"asset-ids/{subfolder}/{owner_id}/"
    return f"{upload_folder(purpose, owner_id)}/"


def validate_public_id_scope(purpose: str, owner_id: str, public_id: str) -> None:
    if not public_id.startswith(expected_public_id_prefix(purpose, owner_id)):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Uploaded asset does not belong to this user or purpose")


def verify_asset_location(purpose: str, owner_id: str, public_id: str, asset: dict[str, object]) -> None:
    expected_folder = upload_folder(purpose, owner_id)
    validate_public_id_scope(purpose, owner_id, public_id)
    if settings.cloudinary_folder_mode.lower() == "dynamic":
        if str(asset.get("asset_folder", "")).strip("/") != expected_folder:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Uploaded asset is not in its assigned Cloudinary folder")


def upload_signature(purpose: str, owner_id: str) -> dict[str, object]:
    try:
        subfolder, resource_type = UPLOAD_PURPOSES[purpose]
    except KeyError:
        raise ValueError("Unsupported upload purpose") from None
    return create_upload_signature(f"{subfolder}/{owner_id}", resource_type)
