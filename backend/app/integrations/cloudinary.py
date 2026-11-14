from typing import Any
import re

import cloudinary
import cloudinary.api
import cloudinary.uploader
from fastapi import HTTPException

from app.core.config import settings


def is_configured() -> bool:
    return all((settings.cloudinary_cloud_name, settings.cloudinary_api_key, settings.cloudinary_api_secret))


def configure() -> None:
    if not is_configured():
        raise HTTPException(status_code=503, detail="Cloudinary storage is not configured")
    cloudinary.config(cloud_name=settings.cloudinary_cloud_name, api_key=settings.cloudinary_api_key, api_secret=settings.cloudinary_api_secret, secure=True)


def _folder_path(value: str, *, allow_empty: bool = False) -> str:
    value = value.strip()
    if not value and allow_empty:
        return ""
    if value.startswith("/") or value.endswith("/") or "\\" in value:
        raise HTTPException(status_code=422, detail="Invalid Cloudinary folder path")
    parts = value.split("/")
    if not value or any(not re.fullmatch(r"[A-Za-z0-9_-]+", part) for part in parts):
        raise HTTPException(status_code=422, detail="Invalid Cloudinary folder path")
    return "/".join(parts)


def create_upload_signature(subfolder: str, resource_type: str) -> dict[str, Any]:
    configure()
    if resource_type not in {"image", "video", "raw"}:
        raise HTTPException(status_code=422, detail="Unsupported Cloudinary resource type")
    root = _folder_path(settings.cloudinary_upload_folder)
    leaf = _folder_path(subfolder, allow_empty=True)
    destination = "/".join(part for part in (root, leaf) if part)
    params: dict[str, Any] = {"timestamp": int(__import__("time").time()), "type": "authenticated"}
    if settings.cloudinary_folder_mode.lower() == "dynamic":
        params.update({"asset_folder": destination, "public_id_prefix": f"asset-ids/{leaf}" if leaf else "asset-ids"})
    else:
        params["folder"] = destination
    signature = cloudinary.utils.api_sign_request(params, settings.cloudinary_api_secret)
    
    return {
        **params, 
        "resource_type": resource_type, 
        "signature": signature, 
        "api_key": settings.cloudinary_api_key, 
        "cloud_name": settings.cloudinary_cloud_name,
        "upload_url": f"https://api.cloudinary.com/v1_1/{settings.cloudinary_cloud_name}/{resource_type}/upload" # Added for clarity
    }


def get_resource(public_id: str, resource_type: str) -> dict[str, Any]:
    configure()
    try:
        return cloudinary.api.resource(public_id, resource_type=resource_type, type="authenticated")
    except Exception as exc:
        raise HTTPException(status_code=422, detail="Uploaded Cloudinary asset could not be verified") from exc


def delete_resource(public_id: str, resource_type: str) -> None:
    configure()
    try:
        cloudinary.uploader.destroy(public_id, resource_type=resource_type, type="authenticated", invalidate=True)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Cloudinary could not delete the asset") from exc


def signed_delivery_url(public_id: str, file_format: str, resource_type: str, expires_in_seconds: int = 300) -> str:
    configure()
    import time
    try:
        return cloudinary.utils.private_download_url(public_id, file_format, resource_type=resource_type, type="authenticated", expires_at=int(time.time()) + expires_in_seconds)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Could not create a protected delivery URL") from exc