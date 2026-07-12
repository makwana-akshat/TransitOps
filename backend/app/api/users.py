from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserRoleUpdate, UserStatusUpdate
from app.dependencies.auth import get_current_active_user, require_admin
from app.db.session import get_db

router = APIRouter()

@router.patch("/me", response_model=UserResponse)
async def update_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Update own user profile.
    Only allows updating full_name.
    """
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
        await db.commit()
        await db.refresh(current_user)
    return current_user

@router.get("", response_model=list[UserResponse])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Retrieve users. Admin only.
    """
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users

@router.patch("/{id}/role", response_model=UserResponse)
async def update_user_role(
    id: str,
    role_in: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Update a user's role. Admin only.
    """
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.role = role_in.role
    await db.commit()
    await db.refresh(user)
    return user

@router.patch("/{id}/status", response_model=UserResponse)
async def update_user_status(
    id: str,
    status_in: UserStatusUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Update a user's active status. Admin only.
    """
    result = await db.execute(select(User).where(User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = status_in.is_active
    await db.commit()
    await db.refresh(user)
    return user
