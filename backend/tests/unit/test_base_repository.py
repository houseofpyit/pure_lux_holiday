from __future__ import annotations

import pytest

from app.db.repositories.base_repository import BaseRepository
from app.models.testimonials import Testimonial


class _Scalars:
    def unique(self):
        return self

    def all(self):
        return []


class _Result:
    def scalars(self):
        return _Scalars()


class _Session:
    def __init__(self) -> None:
        self.statement = None

    async def execute(self, statement):
        self.statement = statement
        return _Result()


@pytest.mark.asyncio
async def test_get_all_applies_order_by_field() -> None:
    session = _Session()
    repo = BaseRepository(session, Testimonial)

    assert await repo.get_all(order_by="display_order") == []

    sql = str(session.statement.compile(compile_kwargs={"literal_binds": True}))
    assert "ORDER BY testimonials.display_order ASC" in sql


@pytest.mark.asyncio
async def test_get_all_rejects_unknown_order_by_field() -> None:
    repo = BaseRepository(_Session(), Testimonial)

    with pytest.raises(ValueError, match="has no field 'missing_field'"):
        await repo.get_all(order_by="missing_field")
