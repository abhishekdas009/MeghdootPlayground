from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    category: str = Field(..., min_length=1, max_length=100)
    soql: str = Field(..., min_length=1)
    favourite: bool = False

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    soql: Optional[str] = Field(None, min_length=1)
    favourite: Optional[bool] = None

class TemplateResponse(TemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
