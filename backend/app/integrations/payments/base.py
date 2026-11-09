from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class PaymentIntent:
    reference: str
    checkout_url: str | None
    simulated: bool


class PaymentProvider(Protocol):
    def initiate(self, reference: str, amount_xaf: int, phone_number: str) -> PaymentIntent: ...
    def verify_callback(self, payload: dict[str, object], signature: str | None) -> tuple[str, int, str]: ...
