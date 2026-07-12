import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import Role


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    role: Role
    is_active: bool


class UserCreate(UserBase):
    clerk_user_id: str


class UserUpdate(BaseModel):
    full_name: str | None = None


class UserRoleUpdate(BaseModel):
    role: Role


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserResponse(UserBase):
    id: uuid.UUID
    clerk_user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
