from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.template import TemplateService
from app.services.history import HistoryService

def get_template_service(db: Session = Depends(get_db)) -> TemplateService:
    return TemplateService(db)

def get_history_service(db: Session = Depends(get_db)) -> HistoryService:
    return HistoryService(db)
