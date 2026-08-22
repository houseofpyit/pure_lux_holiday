"""Database connection and migration verification tests.

These tests verify that the database layer is properly configured,
connections can be established, sessions can be created, and
Alembic migrations are in sync with the model definitions.
"""

from __future__ import annotations

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base


@pytest.mark.asyncio
async def test_database_connection(db_connection_check: bool) -> None:
    """Verify that the database connection is functional.

    This test ensures the test engine can connect to the
    database and execute a simple query.
    """
    assert db_connection_check is True, (
        "Database connection failed. Ensure DATABASE_URL is "
        "correct and the database server is running."
    )


@pytest.mark.asyncio
async def test_session_creation(test_session: AsyncSession) -> None:
    """Verify that an async session can be created and used."""
    result = await test_session.execute(text("SELECT 1"))
    value = result.scalar_one()
    assert value == 1, "Session query did not return expected value"


@pytest.mark.asyncio
async def test_model_metadata_registered() -> None:
    """Verify that all model tables are registered in metadata.

    Ensures that Alembic can detect all defined models for
    autogenerate support.
    """
    table_names = Base.metadata.tables.keys()
    table_list = list(table_names)

    assert "admin_users" in table_list, (
        "AdminUser model not registered in Base.metadata"
    )
    assert "media" in table_list, (
        "Media model not registered in Base.metadata"
    )


@pytest.mark.asyncio
async def test_table_creation(test_session: AsyncSession) -> None:
    """Verify that tables can be created in the test database.

    Checks that the schema matches the model definitions by
    querying the information schema.
    """
    result = await test_session.execute(
        text(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = 'public' "
            "ORDER BY table_name"
        )
    )
    tables = [row[0] for row in result.fetchall()]

    assert "admin_users" in tables, "admin_users table not found"
    assert "media" in tables, "media table not found"


@pytest.mark.asyncio
async def test_admin_users_columns(test_session: AsyncSession) -> None:
    """Verify that admin_users table has the expected columns."""
    result = await test_session.execute(
        text(
            "SELECT column_name, data_type, is_nullable "
            "FROM information_schema.columns "
            "WHERE table_name = 'admin_users' "
            "ORDER BY ordinal_position"
        )
    )
    columns = {row[0]: {"type": row[1], "nullable": row[2]} for row in result.fetchall()}

    expected_columns = {
        "id", "name", "email", "password_hash", "role",
        "is_active", "last_login", "created_at", "updated_at",
    }

    actual_columns = set(columns.keys())
    missing = expected_columns - actual_columns
    assert not missing, f"Missing columns in admin_users: {missing}"


@pytest.mark.asyncio
async def test_media_columns(test_session: AsyncSession) -> None:
    """Verify that media table has the expected columns."""
    result = await test_session.execute(
        text(
            "SELECT column_name, data_type, is_nullable "
            "FROM information_schema.columns "
            "WHERE table_name = 'media' "
            "ORDER BY ordinal_position"
        )
    )
    columns = {row[0]: {"type": row[1], "nullable": row[2]} for row in result.fetchall()}

    expected_columns = {
        "id", "filename", "original_name", "file_url", "mime_type",
        "extension", "size", "folder", "alt_text", "media_type",
        "width", "height", "duration", "created_at", "updated_at",
    }

    actual_columns = set(columns.keys())
    missing = expected_columns - actual_columns
    assert not missing, f"Missing columns in media: {missing}"


@pytest.mark.asyncio
async def test_email_unique_constraint(test_session: AsyncSession) -> None:
    """Verify that the email column has a unique constraint."""
    result = await test_session.execute(
        text(
            "SELECT COUNT(*) FROM information_schema.table_constraints tc "
            "JOIN information_schema.constraint_column_usage ccu "
            "ON tc.constraint_name = ccu.constraint_name "
            "WHERE tc.table_name = 'admin_users' "
            "AND tc.constraint_type = 'UNIQUE' "
            "AND ccu.column_name = 'email'"
        )
    )
    count = result.scalar_one()
    assert count > 0, "Email column should have a UNIQUE constraint"