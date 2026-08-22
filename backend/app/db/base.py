"""SQLAlchemy declarative base and metadata configuration.

All database models should inherit from ``Base`` to ensure
consistent table metadata and type annotations across the
application.
"""

from __future__ import annotations

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

# Naming convention for constraints and indexes
# Ensures consistent naming across all migrations
convention: dict[str, str] = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=convention)


class Base(DeclarativeBase):
    """Declarative base class for all ORM models.

    Provides shared configuration including:
    - Naming convention for constraints and indexes
    - Type annotation support for mapped columns
    """

    metadata = metadata

    def __repr__(self) -> str:
        """Return a readable string representation of the model instance."""
        columns = ", ".join(
            f"{c.name}={getattr(self, c.name)!r}"
            for c in self.__table__.columns  # type: ignore[union-attr]
        )
        return f"{self.__class__.__name__}({columns})"