from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.history import HistoryItem
from app.schemas.history import HistoryCreate, HistoryUpdate
from app.repositories.history import HistoryRepository

class HistoryService:
    def __init__(self, db: Session):
        self._repo = HistoryRepository(db)

    def get(self, history_id: int) -> Optional[HistoryItem]:
        return self._repo.get(history_id)

    def list(self, skip: int = 0, limit: int = 100) -> List[HistoryItem]:
        return self._repo.get_all(skip=skip, limit=limit)

    def create(self, data: HistoryCreate) -> HistoryItem:
        return self._repo.create(data)

    def update(self, history_id: int, data: HistoryUpdate) -> Optional[HistoryItem]:
        return self._repo.update(history_id, data)

    def delete(self, history_id: int) -> bool:
        return self._repo.delete(history_id)

    def search(self, query: str) -> List[HistoryItem]:
        return self._repo.search(query)

    def get_favourites(self) -> List[HistoryItem]:
        return self._repo.get_favourites()
