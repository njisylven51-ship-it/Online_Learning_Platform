from fastapi import HTTPException

from app.core.config import settings


class MTNProvider:
    """MTN adapter boundary; merchant API product and callback contract are deployment-specific."""

    def initiate(self, reference: str, amount_xaf: int, phone_number: str):
        if not (settings.mtn_api_base_url and settings.mtn_api_key and settings.mtn_subscription_key):
            raise HTTPException(status_code=503, detail="MTN Mobile Money credentials are not configured")
        raise HTTPException(status_code=501, detail="Configure the approved MTN collection product adapter")

    def verify_callback(self, payload: dict[str, object], signature: str | None):
        raise HTTPException(status_code=501, detail="MTN callback verification is not configured")
