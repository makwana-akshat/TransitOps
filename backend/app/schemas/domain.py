from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# RBAC Schemas
class PermissionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    module: Optional[str] = None

    class Config:
        from_attributes = True

class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    action: str
    entity: str
    entity_id: Optional[UUID] = None
    ip_address: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    employee_code: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    role_id: int

class UserResponse(UserBase):
    id: UUID
    clerk_id: str
    role_id: Optional[int]
    status: str
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    # We don't nest role and permissions directly here, we will format it in the API router
    # to match exactly { "user": UserResponse, "role": "Admin", "permissions": ["*"] }

    class Config:
        from_attributes = True

# Auth Response Wrapper (Matches Frontend Expectations)
class AuthMeResponse(BaseModel):
    user: UserResponse
    role: Optional[str]
    permissions: List[str]

# Vehicle Schemas
class VehicleBase(BaseModel):
    make: str
    model: str
    year: int
    license_plate: str

class VehicleCreate(VehicleBase):
    vin: Optional[str] = None

class VehicleResponse(VehicleBase):
    id: UUID
    status: str
    
    class Config:
        from_attributes = True
