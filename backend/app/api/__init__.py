from fastapi import APIRouter
from app.api import templates, history, excel

api_router = APIRouter()
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(excel.router, prefix="/excel", tags=["excel"])
