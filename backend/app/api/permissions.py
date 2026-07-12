from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.domain import Permission
from app.schemas.domain import PermissionResponse

router = APIRouter()

@router.get("/", response_model=List[PermissionResponse])
def get_permissions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    List all available permissions in the system.
    """
    permissions = db.query(Permission).all()
    return permissions
