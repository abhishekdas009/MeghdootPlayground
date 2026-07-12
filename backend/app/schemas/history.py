from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class HistoryBase(BaseModel):
    action: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=255)
    detail: Optional[str] = None
    item_type: str = Field(..., min_length=1, max_length=50)
    favourite: bool = False

class HistoryCreate(HistoryBase):
    pass

class HistoryUpdate(BaseModel):
    action: Optional[str] = Field(None, min_length=1, max_length=100)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    detail: Optional[str] = None
    item_type: Optional[str] = Field(None, min_length=1, max_length=50)
    favourite: Optional[bool] = None

class HistoryResponse(HistoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
