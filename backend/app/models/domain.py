import uuid
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Date, JSON, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

# Association Table for Role and Permissions
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id', ondelete="CASCADE"), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id', ondelete="CASCADE"), primary_key=True)
)

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    module = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles", lazy="joined")

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(200))
    phone = Column(String(50))
    avatar_url = Column(Text)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"))
    employee_code = Column(String(100), unique=True)
    department = Column(String(100))
    status = Column(String(50), default="Pending", index=True)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))
    
    role = relationship("Role", back_populates="users", lazy="joined")

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    license_plate = Column(String(50), unique=True, nullable=False)
    vin = Column(String(100), unique=True)
    status = Column(String(50), default="Available")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Driver(Base):
    __tablename__ = "drivers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    license_number = Column(String(100), unique=True, nullable=False)
    license_expiry = Column(Date, nullable=False)
    status = Column(String(50), default="Available")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    action = Column(String(255), nullable=False)
    entity = Column(String(100), nullable=False)
    entity_id = Column(UUID(as_uuid=True))
    metadata_json = Column("metadata", JSON)
    ip_address = Column(String(45))
    device = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
