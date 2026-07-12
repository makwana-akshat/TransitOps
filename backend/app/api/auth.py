from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, verify_clerk_token
from app.core.database import get_db
from app.models.domain import AuditLog
from datetime import datetime
import json
from pydantic import BaseModel

router = APIRouter()

import logging

logger = logging.getLogger(__name__)

class SyncUserRequest(BaseModel):
    email: str
    full_name: str = ""
    avatar_url: str = ""

@router.post("/sync-user")
def sync_user(
    request: SyncUserRequest,
    clerk_id: str = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """
    Synchronizes the Clerk user with the Supabase database.
    This acts as a fallback or primary sync mechanism for local development
    where webhooks might not be active.
    """
    from app.models.domain import User, Role
    from fastapi import HTTPException
    
    try:
        # 1. Check if user is already linked
        existing_user = db.query(User).filter(User.clerk_id == clerk_id).first()
        if existing_user:
            logger.info(f"Existing user found for clerk_id: {clerk_id}")
            return {"status": "already_linked", "user_id": str(existing_user.id)}
            
        # 2. Check if admin created a pending user with this email
        pending_user = db.query(User).filter(User.email == request.email).first()
        if pending_user:
            if pending_user.clerk_id and pending_user.clerk_id != clerk_id:
                logger.error(f"Duplicate email conflict for: {request.email}")
                raise HTTPException(status_code=409, detail="Duplicate email: Email already linked to another account")
                
            pending_user.clerk_id = clerk_id
            pending_user.status = "Active"
            if not pending_user.avatar_url and request.avatar_url:
                pending_user.avatar_url = request.avatar_url
            db.commit()
            logger.info(f"New user synchronized (linked existing email): {request.email}")
            return {"status": "linked_existing", "user_id": str(pending_user.id)}
            
        # 3. Fallback: Auto-create user
        driver_role = db.query(Role).filter(Role.name == "Driver").first()
        
        new_user = User(
            clerk_id=clerk_id,
            email=request.email,
            full_name=request.full_name,
            avatar_url=request.avatar_url,
            role_id=driver_role.id if driver_role else None,
            status="Active"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"New user synchronized (created): {request.email}")
        return {"status": "created_new", "user_id": str(new_user.id)}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Synchronization failed: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Synchronization failed due to database error")

@router.get("/me")
def get_me(request: Request, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns the authenticated user profile, role, and permissions.
    Also creates an audit log for the login event.
    """
    user_model = current_user["user"]
    
    # Create audit log for login
    ip_addr = request.client.host if request.client else "unknown"
    log = AuditLog(
        user_id=user_model.id,
        action="Login",
        entity="User",
        entity_id=user_model.id,
        ip_address=ip_addr,
        device=request.headers.get("User-Agent", "unknown"),
        metadata_json=json.dumps({"method": "GET /api/auth/me"})
    )
    db.add(log)
    
    # Update last login timestamp
    user_model.last_login = datetime.utcnow()
    db.commit()
    
    return {
        "user": {
            "id": str(user_model.id),
            "clerk_id": user_model.clerk_id,
            "email": user_model.email,
            "full_name": user_model.full_name,
            "avatar_url": user_model.avatar_url,
            "status": user_model.status,
            "department": user_model.department,
            "employee_code": user_model.employee_code
        },
        "role": current_user["role"],
        "permissions": current_user["permissions"]
    }
