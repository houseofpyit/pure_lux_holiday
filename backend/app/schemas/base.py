"""Shared Pydantic base models for all schemas.

Pydantic v2 does not automatically coerce ``uuid.UUID`` objects to
``str`` even when ``from_attributes=True`` is set.  Every ORM response
schema that contains ``id: str`` or any other ``str``-annotated FK field
must inherit from ``UUIDAsStrMixin`` so the coercion happens uniformly.
"""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, field_validator


class UUIDAsStrMixin(BaseModel):
    """Coerce ``uuid.UUID`` objects to ``str`` for all str-annotated fields.

    Inherit from this class in every response schema that is populated
    via ``model_validate`` from a SQLAlchemy ORM object.
    """

    @field_validator("*", mode="before")
    @classmethod
    def _coerce_uuid_to_str(cls, v: Any) -> Any:
        if isinstance(v, uuid.UUID):
            return str(v)
        return v
