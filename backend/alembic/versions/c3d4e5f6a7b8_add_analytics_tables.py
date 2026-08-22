"""add analytics tables

Revision ID: c3d4e5f6a7b8
Revises: b1c2d3e4f5a6
Create Date: 2026-08-19 12:30:00.000000
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b1c2d3e4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "analytics_sessions",
        sa.Column("visitor_id", sa.String(length=64), nullable=False),
        sa.Column("first_seen_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column("referrer", sa.String(length=1024), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_analytics_sessions")),
        sa.UniqueConstraint("visitor_id", name=op.f("uq_analytics_sessions_visitor_id")),
    )
    op.create_index(op.f("ix_analytics_sessions_id"), "analytics_sessions", ["id"], unique=False)
    op.create_index(op.f("ix_analytics_sessions_last_seen_at"), "analytics_sessions", ["last_seen_at"], unique=False)
    op.create_index(op.f("ix_analytics_sessions_visitor_id"), "analytics_sessions", ["visitor_id"], unique=False)

    op.create_table(
        "page_views",
        sa.Column("session_id", sa.UUID(), nullable=False),
        sa.Column("path", sa.String(length=512), nullable=False),
        sa.Column("page_title", sa.String(length=512), nullable=True),
        sa.Column("referrer", sa.String(length=1024), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["analytics_sessions.id"], name=op.f("fk_page_views_session_id_analytics_sessions"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_page_views")),
    )
    op.create_index(op.f("ix_page_views_id"), "page_views", ["id"], unique=False)
    op.create_index(op.f("ix_page_views_path"), "page_views", ["path"], unique=False)
    op.create_index(op.f("ix_page_views_session_id"), "page_views", ["session_id"], unique=False)
    op.create_index(op.f("ix_page_views_created_at"), "page_views", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_page_views_created_at"), table_name="page_views")
    op.drop_index(op.f("ix_page_views_session_id"), table_name="page_views")
    op.drop_index(op.f("ix_page_views_path"), table_name="page_views")
    op.drop_index(op.f("ix_page_views_id"), table_name="page_views")
    op.drop_table("page_views")
    op.drop_index(op.f("ix_analytics_sessions_visitor_id"), table_name="analytics_sessions")
    op.drop_index(op.f("ix_analytics_sessions_last_seen_at"), table_name="analytics_sessions")
    op.drop_index(op.f("ix_analytics_sessions_id"), table_name="analytics_sessions")
    op.drop_table("analytics_sessions")
