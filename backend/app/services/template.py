from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateUpdate
from app.repositories.template import TemplateRepository

class TemplateService:
    def __init__(self, db: Session):
        self._repo = TemplateRepository(db)

    def get(self, template_id: int) -> Optional[Template]:
        return self._repo.get(template_id)

    def list(self, skip: int = 0, limit: int = 100) -> List[Template]:
        return self._repo.get_all(skip=skip, limit=limit)

    def create(self, data: TemplateCreate) -> Template:
        return self._repo.create(data)

    def update(self, template_id: int, data: TemplateUpdate) -> Optional[Template]:
        return self._repo.update(template_id, data)

    def delete(self, template_id: int) -> bool:
        return self._repo.delete(template_id)

    def search(self, query: str) -> List[Template]:
        return self._repo.search(query)

    def get_favourites(self) -> List[Template]:
        return self._repo.get_favourites()

    def get_by_category(self, category: str) -> List[Template]:
        return self._repo.get_by_category(category)
