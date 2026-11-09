from inspect import signature
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.core.config import settings
from app.integrations import cloudinary as cloudinary_integration
from app.services import cloudinary_service


def setup_cloudinary_signature_mocks(monkeypatch):
    monkeypatch.setattr(cloudinary_integration, "configure", lambda: None)
    monkeypatch.setattr(settings, "cloudinary_upload_folder", "learning-platform")
    monkeypatch.setattr(settings, "cloudinary_api_secret", "secret-for-test")
    monkeypatch.setattr(settings, "cloudinary_api_key", "test-key")
    monkeypatch.setattr(settings, "cloudinary_cloud_name", "test-cloud")
    captured = {}

    def sign(params, secret):
        captured["params"] = dict(params)
        captured["secret"] = secret
        return "mock-signature"

    monkeypatch.setattr(cloudinary_integration.cloudinary.utils, "api_sign_request", sign)
    return captured


def test_fixed_mode_signs_root_and_controlled_subfolder(monkeypatch):
    captured = setup_cloudinary_signature_mocks(monkeypatch)
    monkeypatch.setattr(settings, "cloudinary_folder_mode", "fixed")

    result = cloudinary_integration.create_upload_signature("courses", "image")

    assert captured["params"]["folder"] == "learning-platform/courses"
    assert captured["params"]["type"] == "authenticated"
    assert captured["secret"] == "secret-for-test"
    assert result["folder"] == "learning-platform/courses"
    assert result["resource_type"] == "image"
    assert result["signature"] == "mock-signature"
    assert result["api_key"] == "test-key"
    assert "api_secret" not in result


def test_empty_subfolder_targets_root(monkeypatch):
    captured = setup_cloudinary_signature_mocks(monkeypatch)
    monkeypatch.setattr(settings, "cloudinary_folder_mode", "fixed")

    cloudinary_integration.create_upload_signature("", "image")

    assert captured["params"]["folder"] == "learning-platform"


def test_dynamic_mode_signs_asset_folder_and_public_id_prefix(monkeypatch):
    captured = setup_cloudinary_signature_mocks(monkeypatch)
    monkeypatch.setattr(settings, "cloudinary_folder_mode", "dynamic")

    result = cloudinary_integration.create_upload_signature("videos/user-123", "video")

    assert captured["params"]["asset_folder"] == "learning-platform/videos/user-123"
    assert captured["params"]["public_id_prefix"] == "asset-ids/videos/user-123"
    assert captured["params"]["public_id_prefix"] != captured["params"]["asset_folder"]
    assert "folder" not in captured["params"]
    assert result["resource_type"] == "video"


@pytest.mark.parametrize("subfolder", ["../outside", "/absolute", "resources//images", "resources\\images"])
def test_rejects_unsafe_subfolder_paths(monkeypatch, subfolder):
    setup_cloudinary_signature_mocks(monkeypatch)
    with pytest.raises(HTTPException):
        cloudinary_integration.create_upload_signature(subfolder, "image")


@pytest.mark.parametrize(
    ("purpose", "expected_subfolder", "expected_type"),
    [
        ("video", "videos", "video"),
        ("resource_image", "resources/images", "image"),
        ("resource_document", "resources/documents", "raw"),
        ("assignment", "resources/assignments", "raw"),
        ("course_thumbnail", "courses", "image"),
        ("profile_picture", "profiles", "image"),
        ("lesson_image", "lessons", "image"),
    ],
)
def test_backend_maps_upload_purposes_to_owned_subfolders(monkeypatch, purpose, expected_subfolder, expected_type):
    captured = {}

    def create(subfolder, resource_type):
        captured.update(subfolder=subfolder, resource_type=resource_type)
        return {"folder": subfolder, "resource_type": resource_type}

    monkeypatch.setattr(cloudinary_service, "create_upload_signature", create)
    owner_id = str(uuid4())

    cloudinary_service.upload_signature(purpose, owner_id)

    assert captured == {"subfolder": f"{expected_subfolder}/{owner_id}", "resource_type": expected_type}
    assert cloudinary_service.expected_public_id_prefix(purpose, owner_id) == f"learning-platform/{expected_subfolder}/{owner_id}/"


def test_frontend_cannot_choose_cloudinary_folder():
    from app.api.v1.resources import signature as resource_signature

    assert "folder" not in signature(resource_signature).parameters


def test_dynamic_asset_confirmation_checks_media_folder_and_full_public_id(monkeypatch):
    monkeypatch.setattr(settings, "cloudinary_upload_folder", "learning-platform")
    monkeypatch.setattr(settings, "cloudinary_folder_mode", "dynamic")
    owner_id = str(uuid4())
    # Dynamic Folder paths are independent from Cloudinary public IDs.
    public_id = f"asset-ids/videos/{owner_id}/generated-asset-id"
    cloudinary_service.verify_asset_location("video", owner_id, public_id, {"asset_folder": f"learning-platform/videos/{owner_id}"})

    with pytest.raises(HTTPException):
        cloudinary_service.verify_asset_location("video", owner_id, public_id, {"asset_folder": "learning-platform/videos/another-user"})


def test_existing_resource_lookup_and_delete_use_full_public_id(monkeypatch):
    setup_cloudinary_signature_mocks(monkeypatch)
    monkeypatch.setattr(cloudinary_integration, "configure", lambda: None)
    public_id = "learning-platform/resources/images/user-1/lesson-asset-9f3d"
    fetched = {}
    deleted = {}

    def resource(asset_public_id, **kwargs):
        fetched.update(public_id=asset_public_id, **kwargs)
        return {"public_id": asset_public_id, "secure_url": "https://example.test/resource"}

    def destroy(asset_public_id, **kwargs):
        deleted.update(public_id=asset_public_id, **kwargs)
        return {"result": "ok"}

    monkeypatch.setattr(cloudinary_integration.cloudinary.api, "resource", resource)
    monkeypatch.setattr(cloudinary_integration.cloudinary.uploader, "destroy", destroy)

    asset = cloudinary_integration.get_resource(public_id, "image")
    cloudinary_integration.delete_resource(public_id, "image")

    assert asset["public_id"] == public_id
    assert fetched == {"public_id": public_id, "resource_type": "image", "type": "authenticated"}
    assert deleted == {"public_id": public_id, "resource_type": "image", "type": "authenticated", "invalidate": True}
