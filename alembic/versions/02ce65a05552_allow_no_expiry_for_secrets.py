"""allow no expiry for secrets

Revision ID: 02ce65a05552
Revises: 2559a1758490
Create Date: 2026-07-07 07:05:33.174632

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '02ce65a05552'
down_revision: Union[str, Sequence[str], None] = '2559a1758490'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add columns as nullable first
    op.add_column(
        "owners",
        sa.Column("email", sa.String(), nullable=True),
    )

    op.add_column(
        "owners",
        sa.Column("password_hash", sa.String(), nullable=True),
    )

    # 2. Give existing test owners temporary values
    op.execute("""
        UPDATE owners
        SET email = 'legacy-' || id::text || '@invalid.local',
            password_hash = 'LEGACY_ACCOUNT_NO_LOGIN'
        WHERE email IS NULL
    """)

    # 3. Now make the columns required
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

    # 4. Email must be unique
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