"""add category column

Revision ID: 0002_add_category
Revises: 0001_initial_schema
Create Date: 2026-06-20 05:01:38.292948

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0002_add_category'
down_revision: Union[str, None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'fact_long',
        sa.Column('category', sa.String(length=96), nullable=True),
        schema='clean',
    )
    op.create_index(
        'ix_fact_long_category', 'fact_long',
        ['source_table', 'category'], unique=False, schema='clean',
    )


def downgrade() -> None:
    op.drop_index('ix_fact_long_category', table_name='fact_long', schema='clean')
    op.drop_column('fact_long', 'category', schema='clean')
