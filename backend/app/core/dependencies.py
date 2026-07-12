import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.domain import User

security = HTTPBearer()

def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Decodes the Clerk JWT to extract the clerk_id (sub).
    In production, this should verify against the Clerk JWKS endpoint.
    """
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    try:
        # Decode without verification for development.
        # production: jwt.decode(token, jwks_key, algorithms=["RS256"], audience=...)
        payload = jwt.decode(token, options={"verify_signature": False})
        clerk_id = payload.get("sub")
        if not clerk_id:
            raise ValueError("No sub in token")
        return clerk_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"Could not validate credentials: {str(e)}"
        )

def get_current_user(clerk_id: str = Depends(verify_clerk_token), db: Session = Depends(get_db)):
    """
    Lookup user in Supabase via SQLAlchemy using the clerk_id.
    """
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not found in database.")
        
    role_name = user.role.name if user.role else None
    
    permissions = []
    if user.role and user.role.permissions:
        permissions = [p.name for p in user.role.permissions]
        
    return {
        "user": user,
        "role": role_name,
        "permissions": permissions
    }

def require_role(allowed_roles: list[str]):
    def role_checker(current_user_dict: dict = Depends(get_current_user)):
        user_role = current_user_dict.get("role")
        if user_role not in allowed_roles and "Admin" not in allowed_roles:
            if user_role not in allowed_roles:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: Insufficient role")
        return current_user_dict
    return role_checker

def require_permission(required_permission: str):
    def permission_checker(current_user_dict: dict = Depends(get_current_user)):
        permissions = current_user_dict.get("permissions", [])
        if required_permission not in permissions and "*" not in permissions:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Forbidden: Missing {required_permission}")
        return current_user_dict
    return permission_checker
