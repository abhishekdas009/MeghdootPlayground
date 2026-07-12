from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.schemas.history import HistoryCreate, HistoryUpdate, HistoryResponse
from app.services.history import HistoryService
from app.dependencies import get_history_service

router = APIRouter()

@router.get("/", response_model=List[HistoryResponse])
def list_history(
    skip: int = 0,
    limit: int = 100,
    service: HistoryService = Depends(get_history_service),
):
    return service.list(skip=skip, limit=limit)

@router.get("/search", response_model=List[HistoryResponse])
def search_history(
    q: str = Query(..., min_length=1),
    service: HistoryService = Depends(get_history_service),
):
    return service.search(q)

@router.get("/favourites", response_model=List[HistoryResponse])
def list_favourite_history(
    service: HistoryService = Depends(get_history_service),
):
    return service.get_favourites()

@router.get("/{history_id}", response_model=HistoryResponse)
def get_history_item(
    history_id: int,
    service: HistoryService = Depends(get_history_service),
):
    item = service.get(history_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History item not found")
    return item

@router.post("/", response_model=HistoryResponse, status_code=status.HTTP_201_CREATED)
def create_history(
    data: HistoryCreate,
    service: HistoryService = Depends(get_history_service),
):
    return service.create(data)

@router.put("/{history_id}", response_model=HistoryResponse)
def update_history(
    history_id: int,
    data: HistoryUpdate,
    service: HistoryService = Depends(get_history_service),
):
    item = service.update(history_id, data)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History item not found")
    return item

@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history(
    history_id: int,
    service: HistoryService = Depends(get_history_service),
):
    deleted = service.delete(history_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History item not found")
    return None
