from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.domain import Role
from app.schemas.domain import RoleResponse

router = APIRouter()

@router.get("/", response_model=List[RoleResponse])
def get_roles(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    List all available roles in the system.
    """
    roles = db.query(Role).all()
    return roles
