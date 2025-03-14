"""Reaction params on task for reactions not llm based

Revision ID: 247ffcd7c22f
Revises: a027a9157608
Create Date: 2024-10-14 11:57:57.640362

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '247ffcd7c22f'
down_revision: Union[str, None] = 'a027a9157608'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('task', sa.Column('action_params', postgresql.ARRAY(sa.String()), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('task', 'action_params')
    # ### end Alembic commands ###
