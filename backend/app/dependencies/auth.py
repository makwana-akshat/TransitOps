from typing import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import verify_clerk_token
from app.db.session import get_db
from app.models.user import User, Role

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Validates the Clerk JWT, synchronizes the user into the database, and returns the User model.
    """
    token = credentials.credentials
    payload = verify_clerk_token(token)
    
    clerk_user_id = payload.get("sub")
    # Note: Clerk standard tokens often have a primary email if configured, or you can pass it via session claims.
    # We will assume email and name are available in the payload, or fallback.
    # Often in Clerk, you need to add email and full_name to JWT templates.
    email = payload.get("email", "")
    full_name = payload.get("full_name", "")
    
    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing subject")
        
    if not email:
        email = f"{clerk_user_id}@placeholder.clerk.com"
        
    result = await db.execute(select(User).where(User.clerk_user_id == clerk_user_id))
    user = result.scalars().first()
    
    if user:
        # Check if email or name changed
        changed = False
        if user.email != email and email:
            # Need to ensure email is not taken by someone else? Clerk guarantees it, but we can catch IntegrityError if needed.
            user.email = email
            changed = True
        if user.full_name != full_name and full_name:
            user.full_name = full_name
            changed = True
            
        if changed:
            await db.commit()
            await db.refresh(user)
    else:
        # New user sync
        user = User(
            clerk_user_id=clerk_user_id,
            email=email,
            full_name=full_name,
            role=Role.FLEET_MANAGER, # Default role as per requirements
            is_active=True
        )
        db.add(user)
        try:
            await db.commit()
            await db.refresh(user)
        except Exception:
            await db.rollback()
            # If concurrent request already inserted the user, we can fetch it again
            result = await db.execute(select(User).where(User.clerk_user_id == clerk_user_id))
            user = result.scalars().first()
            if not user:
                raise HTTPException(status_code=500, detail="Failed to synchronize user")
            
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    return current_user


def require_role(required_roles: list[Role]) -> Callable:
    async def role_dependency(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in required_roles:
            raise HTTPException(status_code=403, detail="Permission denied")
        return current_user
    return role_dependency

require_admin = require_role([Role.ADMIN])
require_fleet_manager = require_role([Role.ADMIN, Role.FLEET_MANAGER])
require_safety_officer = require_role([Role.ADMIN, Role.SAFETY_OFFICER])
require_financial_analyst = require_role([Role.ADMIN, Role.FINANCIAL_ANALYST])
# Drivers only access their own info, but sometimes might need endpoint access
require_driver = require_role([Role.ADMIN, Role.FLEET_MANAGER, Role.DRIVER])
