from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateResponse
from app.services.template import TemplateService
from app.dependencies import get_template_service

router = APIRouter()

@router.get("/", response_model=List[TemplateResponse])
def list_templates(
    skip: int = 0,
    limit: int = 100,
    service: TemplateService = Depends(get_template_service),
):
    return service.list(skip=skip, limit=limit)

@router.get("/search", response_model=List[TemplateResponse])
def search_templates(
    q: str = Query(..., min_length=1),
    service: TemplateService = Depends(get_template_service),
):
    return service.search(q)

@router.get("/favourites", response_model=List[TemplateResponse])
def list_favourites(
    service: TemplateService = Depends(get_template_service),
):
    return service.get_favourites()

@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(
    template_id: int,
    service: TemplateService = Depends(get_template_service),
):
    template = service.get(template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return template

@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    data: TemplateCreate,
    service: TemplateService = Depends(get_template_service),
):
    return service.create(data)

@router.put("/{template_id}", response_model=TemplateResponse)
def update_template(
    template_id: int,
    data: TemplateUpdate,
    service: TemplateService = Depends(get_template_service),
):
    template = service.update(template_id, data)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    service: TemplateService = Depends(get_template_service),
):
    deleted = service.delete(template_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return None
