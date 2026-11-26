from pydantic import BaseModel
from typing import Optional, List, Generic, TypeVar

T = TypeVar("T")


class HealthResponse(BaseModel):
    status: str
    app_name: str
    env: str
    version: str = "1.0.0"


class MessageResponse(BaseModel):
    message: str


class Paginated(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int