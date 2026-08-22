"""Initial database schema

Revision ID: 0001
Revises:
Create Date: 2026-07-21 14:00:00.000000
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial tables: admin_users and media."""

    # --- admin_users table ---
    op.create_table(
        "admin_users",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="editor"),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "last_login",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_admin_users")),
        sa.UniqueConstraint("email", name=op.f("uq_admin_users_email")),
    )
    op.create_index(
        op.f("ix_admin_users_id"), "admin_users", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_admin_users_email"), "admin_users", ["email"], unique=True
    )
    op.create_index(
        op.f("ix_admin_users_role"), "admin_users", ["role"], unique=False
    )

    # --- media table ---
    op.create_table(
        "media",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("original_name", sa.String(255), nullable=False),
        sa.Column("file_url", sa.String(1024), nullable=False),
        sa.Column("mime_type", sa.String(127), nullable=False),
        sa.Column("extension", sa.String(20), nullable=False),
        sa.Column("size", sa.BigInteger(), nullable=False),
        sa.Column("folder", sa.String(255), nullable=True),
        sa.Column("alt_text", sa.Text(), nullable=True),
        sa.Column(
            "media_type",
            sa.String(20),
            nullable=False,
            server_default="image",
        ),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("duration", sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_media")),
    )
    op.create_index(
        op.f("ix_media_id"), "media", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_media_filename"), "media", ["filename"], unique=False
    )
    op.create_index(
        op.f("ix_media_mime_type"), "media", ["mime_type"], unique=False
    )
    op.create_index(
        op.f("ix_media_folder"), "media", ["folder"], unique=False
    )
    op.create_index(
        op.f("ix_media_media_type"), "media", ["media_type"], unique=False
    )


def downgrade() -> None:
    """Drop all tables created in the upgrade."""
    op.drop_table("media")
    op.drop_table("admin_users")