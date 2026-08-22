"""Generic base repository with common CRUD operations.

Provides a reusable async repository pattern that all domain-specific
repositories should extend. Implements common database operations
with proper session management, typing, and error handling.
"""

from __future__ import annotations

import uuid
from typing import Any, Generic, TypeVar

from sqlalchemy import Select, asc, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base
from app.db.utils.filters import FilterCondition
from app.db.utils.pagination import PaginatedResult, PaginationParams
from app.db.utils.query_builder import QueryBuilder
from app.db.utils.sorting import SortParams

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Abstract base repository providing standard data access methods.

    Usage::

        class AdminUserRepository(BaseRepository[AdminUser]):
            def __init__(self, session: AsyncSession) -> None:
                super().__init__(session, AdminUser)
    """

    def __init__(self, session: AsyncSession, model: type[ModelType]) -> None:
        """Initialize the repository with a database session and model class.

        Args:
            session: The async database session for all operations.
            model: The SQLAlchemy model class this repository manages.
        """
        self.session = session
        self.model = model

    async def get_by_id(self, entity_id: uuid.UUID) -> ModelType | None:
        """Retrieve a record by its UUID primary key.

        Args:
            entity_id: The UUID of the record to retrieve.

        Returns:
            The model instance if found, None otherwise.
        """
        return await self.session.get(self.model, entity_id)

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: list[FilterCondition] | None = None,
        order_by: str | None = None,
    ) -> list[ModelType]:
        """Retrieve all records with optional filtering, ordering, and limits.

        Args:
            skip: Number of records to skip (offset).
            limit: Maximum number of records to return.
            filters: Optional list of filter conditions to apply.
            order_by: Optional model field name to sort by. Prefix with "-"
                for descending order.

        Returns:
            A list of model instances.
        """
        query: Select = select(self.model)

        if filters:
            builder = QueryBuilder(self.model).with_filters(filters)
            query = builder._build()  # type: ignore[protected-access]
            query = query.offset(skip).limit(limit)
        else:
            query = query.offset(skip).limit(limit)

        if order_by is not None:
            descending = order_by.startswith("-")
            field_name = order_by[1:] if descending else order_by
            column = getattr(self.model, field_name, None)
            if column is None:
                raise ValueError(
                    f"Model {self.model.__name__} has no field '{field_name}'"
                )
            query = query.order_by(desc(column) if descending else asc(column))

        result = await self.session.execute(query)
        return list(result.scalars().unique().all())

    async def create(self, **kwargs: Any) -> ModelType:
        """Create and persist a new record.

        Args:
            **kwargs: Field values for the new record.

        Returns:
            The newly created model instance.
        """
        entity = self.model(**kwargs)
        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return entity

    async def update(
        self,
        entity: ModelType,
        **kwargs: Any,
    ) -> ModelType:
        """Update an existing record with the provided field values.

        Args:
            entity: The model instance to update.
            **kwargs: Field values to update on the record.

        Returns:
            The updated model instance.
        """
        for key, value in kwargs.items():
            setattr(entity, key, value)

        await self.session.flush()
        await self.session.refresh(entity)
        return entity

    async def delete(self, entity: ModelType) -> None:
        """Permanently delete a record from the database.

        For soft-deletable models, use ``soft_delete`` instead
        to maintain data integrity.

        Args:
            entity: The model instance to delete.
        """
        await self.session.delete(entity)
        await self.session.flush()

    async def exists(self, **filters: Any) -> bool:
        """Check if a record matching the given filters exists.

        Args:
            **filters: Column-value pairs to filter by.

        Returns:
            True if at least one matching record exists, False otherwise.
        """
        query: Select = select(self.model).filter_by(**filters).limit(1)
        result = await self.session.execute(query)
        return result.scalar_one_or_none() is not None

    async def paginate(
        self,
        page_params: PaginationParams,
        filters: list[FilterCondition] | None = None,
        sort_params: SortParams | None = None,
    ) -> PaginatedResult[ModelType]:
        """Retrieve a paginated, filtered, and sorted list of records.

        Args:
            page_params: Pagination parameters (page, page_size).
            filters: Optional list of filter conditions.
            sort_params: Optional sorting parameters.

        Returns:
            A PaginatedResult containing the records and metadata.
        """
        builder = (
            QueryBuilder(self.model)
            .with_filters(filters or [])
            .with_pagination(page_params)
        )

        if sort_params is not None:
            builder = builder.with_sorting(sort_params)

        return await builder.execute(self.session)  # type: ignore[return-value]

    async def find_by_field(
        self,
        field: str,
        value: Any,
        unique: bool = False,
    ) -> ModelType | list[ModelType] | None:
        """Find records by an exact field match.

        Args:
            field: The field name to search on.
            value: The value to match.
            unique: If True, returns a single record or None.
                If False, returns a list of matching records.

        Returns:
            A single model instance, a list, or None.
        """
        column = getattr(self.model, field, None)
        if column is None:
            raise ValueError(f"Model {self.model.__name__} has no field '{field}'")

        query: Select = select(self.model).where(column == value)

        if unique:
            query = query.limit(1)
            result = await self.session.execute(query)
            return result.scalar_one_or_none()

        result = await self.session.execute(query)
        return list(result.scalars().unique().all())
