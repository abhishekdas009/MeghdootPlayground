from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional
from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")

class BaseRepository(ABC, Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, db: Session):
        self._db = db

    @abstractmethod
    def get(self, id: int) -> Optional[ModelType]:
        raise NotImplementedError

    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        raise NotImplementedError

    @abstractmethod
    def create(self, obj_in: CreateSchemaType) -> ModelType:
        raise NotImplementedError

    @abstractmethod
    def update(self, id: int, obj_in: UpdateSchemaType) -> Optional[ModelType]:
        raise NotImplementedError

    @abstractmethod
    def delete(self, id: int) -> bool:
        raise NotImplementedError
