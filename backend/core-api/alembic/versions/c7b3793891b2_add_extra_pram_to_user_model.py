"""add extra pram to user model

Revision ID: c7b3793891b2
Revises: 95878e6cadb7
Create Date: 2024-10-22 12:45:16.149433

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c7b3793891b2'
down_revision: Union[str, None] = '95878e6cadb7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('gmail_expiration_date', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'gmail_expiration_date')
    # ### end Alembic commands ###
