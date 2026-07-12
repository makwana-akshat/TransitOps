from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.domain import User
from app.schemas.domain import UserResponse, UserCreate

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["Admin"]))
):
    """
    List all active users.
    """
    users = db.query(User).filter(User.deleted_at == None).all()
    return users

@router.post("/", response_model=UserResponse)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["Admin"]))
):
    """
    Create a new user. In a full implementation, this would also trigger a Clerk invitation.
    For this module, it sets up the DB record pending Clerk linking.
    """
    # Check if email exists
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Placeholder clerk_id until they accept invite (or generate one)
    import uuid
    new_user = User(
        clerk_id=f"pending_{uuid.uuid4()}",
        email=user_in.email,
        full_name=user_in.full_name,
        phone=user_in.phone,
        department=user_in.department,
        role_id=user_in.role_id,
        status="Pending"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["Admin"]))
):
    """
    Update user profile or role.
    """
    user = db.query(User).filter(User.id == user_id, User.deleted_at == None).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.email = user_in.email
    user.full_name = user_in.full_name
    user.phone = user_in.phone
    user.department = user_in.department
    user.role_id = user_in.role_id
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def soft_delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["Admin"]))
):
    """
    Soft delete a user.
    """
    from datetime import datetime
    import pytz
    
    user = db.query(User).filter(User.id == user_id, User.deleted_at == None).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.deleted_at = datetime.now(pytz.utc)
    user.status = "Inactive"
    db.commit()
    return {"message": "User deleted successfully"}
