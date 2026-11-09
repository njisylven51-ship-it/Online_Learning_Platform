from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class PaymentInitiate(BaseModel):
    course_id: UUID
    provider: str = Field(pattern=r"^(mtn|orange)$")
    phone_number: str = Field(pattern=r"^[0-9]{9}$", description="9-digit Cameroon test phone number")


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    provider_reference: str
    amount_xaf: int
    currency: str
    status: str
    is_simulated: bool
