"""Add User model

Revision ID: 6a7b8c9d0e1f
Revises: 58957c8c648b
Create Date: 2026-07-12 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '6a7b8c9d0e1f'
down_revision: Union[str, None] = '58957c8c648b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create Role enum
    role_enum = postgresql.ENUM('ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'DRIVER', 'FINANCIAL_ANALYST', name='role', create_type=False)
    role_enum.create(op.get_bind(), checkfirst=True)

    op.create_table('users',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('clerk_user_id', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('full_name', sa.String(), nullable=True),
    sa.Column('role', postgresql.ENUM('ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'DRIVER', 'FINANCIAL_ANALYST', name='role', create_type=False), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_clerk_user_id'), 'users', ['clerk_user_id'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_clerk_user_id'), table_name='users')
    op.drop_table('users')
    role_enum = postgresql.ENUM('ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'DRIVER', 'FINANCIAL_ANALYST', name='role', create_type=False)
    role_enum.drop(op.get_bind(), checkfirst=True)
