from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.user import UserResponse
from app.dependencies.auth import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """
    Returns the currently authenticated user's profile.
    Automatically synchronizes the user from Clerk on first login.
    """
    return current_user
