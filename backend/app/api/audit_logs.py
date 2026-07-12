from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.domain import AuditLog
from app.schemas.domain import AuditLogResponse

router = APIRouter()

@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["Admin"]))
):
    """
    List all audit logs. Only accessible by Admins.
    """
    # Order by newest first
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    return logs
