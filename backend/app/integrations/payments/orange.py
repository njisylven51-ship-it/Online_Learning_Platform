from fastapi import HTTPException

from app.core.config import settings


class OrangeProvider:
    """Orange Money adapter boundary; merchant callback contract is deployment-specific."""

    def initiate(self, reference: str, amount_xaf: int, phone_number: str):
        if not (settings.orange_api_base_url and settings.orange_client_id and settings.orange_client_secret):
            raise HTTPException(status_code=503, detail="Orange Money credentials are not configured")
        raise HTTPException(status_code=501, detail="Configure the approved Orange Money payment adapter")

    def verify_callback(self, payload: dict[str, object], signature: str | None):
        raise HTTPException(status_code=501, detail="Orange callback verification is not configured")
