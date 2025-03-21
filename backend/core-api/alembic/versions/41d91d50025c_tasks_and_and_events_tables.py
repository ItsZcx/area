"""Tasks and and events tables

Revision ID: 41d91d50025c
Revises: 5f3f18e10e82
Create Date: 2024-09-30 11:12:01.467258

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '41d91d50025c'
down_revision: Union[str, None] = '5f3f18e10e82'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('last_event',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('trigger', sa.String(), nullable=True),
    sa.Column('action_name', sa.String(), nullable=True),
    sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_last_event_action_name'), 'last_event', ['action_name'], unique=False)
    op.create_index(op.f('ix_last_event_id'), 'last_event', ['id'], unique=False)
    op.create_index(op.f('ix_last_event_timestamp'), 'last_event', ['timestamp'], unique=False)
    op.create_index(op.f('ix_last_event_trigger'), 'last_event', ['trigger'], unique=False)
    op.create_table('task',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('trigger', sa.String(), nullable=True),
    sa.Column('trigger_args', postgresql.ARRAY(sa.String()), nullable=True),
    sa.Column('event_hash', sa.String(), nullable=False),
    sa.Column('action_name', sa.String(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('requires_oauth', sa.Boolean(), nullable=True),
    sa.Column('oauth_token', sa.String(), nullable=True),
    sa.Column('service', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_task_action_name'), 'task', ['action_name'], unique=False)
    op.create_index(op.f('ix_task_event_hash'), 'task', ['event_hash'], unique=False)
    op.create_index(op.f('ix_task_id'), 'task', ['id'], unique=False)
    op.create_index(op.f('ix_task_trigger'), 'task', ['trigger'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_task_trigger'), table_name='task')
    op.drop_index(op.f('ix_task_id'), table_name='task')
    op.drop_index(op.f('ix_task_event_hash'), table_name='task')
    op.drop_index(op.f('ix_task_action_name'), table_name='task')
    op.drop_table('task')
    op.drop_index(op.f('ix_last_event_trigger'), table_name='last_event')
    op.drop_index(op.f('ix_last_event_timestamp'), table_name='last_event')
    op.drop_index(op.f('ix_last_event_id'), table_name='last_event')
    op.drop_index(op.f('ix_last_event_action_name'), table_name='last_event')
    op.drop_table('last_event')
    # ### end Alembic commands ###
