from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Cameroon CS Learning Platform API"
    app_env: str = "development"
    payment_mode: str = "mock"
    debug: bool = False
    cors_origins: str = "http://localhost:5173"
    secret_key: str = "change-this-development-secret-before-deployment"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/learning_platform"
    access_token_expire_minutes: int = 60
    password_reset_expire_minutes: int = 30
    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_api_secret: str | None = None
    cloudinary_upload_folder: str = "learning-platform"
    cloudinary_folder_mode: str = "fixed"
    cloudinary_max_image_size: int = 10 * 1024 * 1024
    cloudinary_max_document_size: int = 20 * 1024 * 1024
    cloudinary_max_video_size: int = 500 * 1024 * 1024
    resend_api_key: str | None = None
    email_from: str = "Learning Platform <noreply@example.com>"
    mtn_api_base_url: str | None = None
    mtn_api_key: str | None = None
    mtn_subscription_key: str | None = None
    orange_api_base_url: str | None = None
    orange_client_id: str | None = None
    orange_client_secret: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.cloudinary_folder_mode.lower() not in {"fixed", "dynamic"}:
            raise ValueError("CLOUDINARY_FOLDER_MODE must be 'fixed' or 'dynamic'")
        if self.app_env.lower() in {"production", "prod"} and (len(self.secret_key) < 32 or self.secret_key == "change-this-development-secret-before-deployment"):
            raise ValueError("Set a unique SECRET_KEY with at least 32 characters in production")
        if self.app_env.lower() in {"production", "prod"} and self.payment_mode.lower() == "mock":
            raise ValueError("PAYMENT_MODE=mock is forbidden in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
