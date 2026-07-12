from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class HistoryItem(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    detail = Column(Text, nullable=True)
    item_type = Column(String(50), nullable=False, index=True)
    favourite = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
