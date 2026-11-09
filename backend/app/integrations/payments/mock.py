"""Deterministic test-only Mobile Money provider; never contacts a telco."""
from fastapi import HTTPException

from app.integrations.payments.base import PaymentIntent

TEST_PAYMENT_NUMBERS = frozenset({
    "678241562",  # Number supplied by the platform owner for testing.
    "678241563",
    "678241564",
    "678241565",
})


class MockPaymentProvider:
    def initiate(self, reference: str, amount_xaf: int, phone_number: str) -> PaymentIntent:
        if amount_xaf <= 0:
            raise HTTPException(status_code=422, detail="Payment amount must be positive")
        return PaymentIntent(reference=reference, checkout_url=None, simulated=True)

    def verify(self, phone_number: str, amount_xaf: int, currency: str) -> bool:
        return phone_number in TEST_PAYMENT_NUMBERS and amount_xaf > 0 and currency == "XAF"

    def verify_callback(self, payload: dict[str, object], signature: str | None) -> tuple[str, int, str]:
        raise HTTPException(status_code=501, detail="Mock verification is initiated by the authenticated test endpoint")
