from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateUpdate
from app.repositories.base import BaseRepository

class TemplateRepository(BaseRepository[Template, TemplateCreate, TemplateUpdate]):
    def __init__(self, db: Session):
        super().__init__(db)

    def get(self, id: int) -> Optional[Template]:
        return self._db.query(Template).filter(Template.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Template]:
        return self._db.query(Template).offset(skip).limit(limit).all()

    def get_by_category(self, category: str) -> List[Template]:
        return self._db.query(Template).filter(Template.category == category).all()

    def search(self, query: str) -> List[Template]:
        return self._db.query(Template).filter(
            or_(
                Template.name.ilike(f"%{query}%"),
                Template.category.ilike(f"%{query}%"),
                Template.description.ilike(f"%{query}%"),
            )
        ).all()

    def get_favourites(self) -> List[Template]:
        return self._db.query(Template).filter(Template.favourite == True).all()

    def create(self, obj_in: TemplateCreate) -> Template:
        db_obj = Template(**obj_in.model_dump())
        self._db.add(db_obj)
        self._db.commit()
        self._db.refresh(db_obj)
        return db_obj

    def update(self, id: int, obj_in: TemplateUpdate) -> Optional[Template]:
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
