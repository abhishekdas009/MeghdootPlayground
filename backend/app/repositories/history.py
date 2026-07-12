from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.history import HistoryItem
from app.schemas.history import HistoryCreate, HistoryUpdate
from app.repositories.base import BaseRepository

class HistoryRepository(BaseRepository[HistoryItem, HistoryCreate, HistoryUpdate]):
    def __init__(self, db: Session):
        super().__init__(db)

    def get(self, id: int) -> Optional[HistoryItem]:
        return self._db.query(HistoryItem).filter(HistoryItem.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[HistoryItem]:
        return self._db.query(HistoryItem).order_by(HistoryItem.created_at.desc()).offset(skip).limit(limit).all()

    def search(self, query: str) -> List[HistoryItem]:
        return self._db.query(HistoryItem).filter(
            or_(
                HistoryItem.title.ilike(f"%{query}%"),
                HistoryItem.action.ilike(f"%{query}%"),
                HistoryItem.detail.ilike(f"%{query}%"),
            )
        ).order_by(HistoryItem.created_at.desc()).all()

    def get_favourites(self) -> List[HistoryItem]:
        return self._db.query(HistoryItem).filter(HistoryItem.favourite == True).order_by(HistoryItem.created_at.desc()).all()

    def create(self, obj_in: HistoryCreate) -> HistoryItem:
        db_obj = HistoryItem(**obj_in.model_dump())
        self._db.add(db_obj)
        self._db.commit()
        self._db.refresh(db_obj)
        return db_obj

    def update(self, id: int, obj_in: HistoryUpdate) -> Optional[HistoryItem]:
        db_obj = self.get(id)
        if not db_obj:
            return None
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        self._db.commit()
        self._db.refresh(db_obj)
        return db_obj

    def delete(self, id: int) -> bool:
        db_obj = self.get(id)
        if not db_obj:
            return False
        self._db.delete(db_obj)
        self._db.commit()
        return True
