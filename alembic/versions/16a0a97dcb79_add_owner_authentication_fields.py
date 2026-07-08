"""add owner authentication fields

Revision ID: 16a0a97dcb79
Revises: 02ce65a05552
Create Date: 2026-07-07 08:52:39.196868
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "16a0a97dcb79"
down_revision: Union[str, Sequence[str], None] = "02ce65a05552"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "owners",
        sa.Column("email", sa.String(), nullable=True),
    )

    op.add_column(
        "owners",
        sa.Column("password_hash", sa.String(), nullable=True),
    )

    op.execute("""
        UPDATE owners
        SET email = 'legacy-' || id::text || '@invalid.local',
            password_hash = 'LEGACY_ACCOUNT_NO_LOGIN'
        WHERE email IS NULL
    """)

    op.alter_column(
        "owners",
        "email",
        nullable=False,
    )

    op.alter_column(
        "owners",
        "password_hash",
        nullable=False,
    )

    op.create_index(
        op.f("ix_owners_email"),
        "owners",
        ["email"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_owners_email"),
        table_name="owners",
    )

    op.drop_column(
        "owners",
        "password_hash",
    )

    op.drop_column(
        "owners",
        "email",
    )