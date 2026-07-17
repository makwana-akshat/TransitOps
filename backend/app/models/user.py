import enum
import uuid
from typing import TYPE_CHECKING
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.vehicle import Vehicle
    from app.models.driver import Driver
    from app.models.trip import Trip
    from app.models.maintenance import MaintenanceRecord
    from app.models.expense import FuelLog, Expense

class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    FLEET_MANAGER = "FLEET_MANAGER"
    SAFETY_OFFICER = "SAFETY_OFFICER"
    DRIVER = "DRIVER"
    FINANCIAL_ANALYST = "FINANCIAL_ANALYST"

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.FLEET_MANAGER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    vehicles: Mapped[list["Vehicle"]] = relationship("Vehicle", back_populates="creator", foreign_keys="[Vehicle.created_by]")
    drivers: Mapped[list["Driver"]] = relationship("Driver", back_populates="creator", foreign_keys="[Driver.created_by]")
    trips: Mapped[list["Trip"]] = relationship("Trip", back_populates="creator", foreign_keys="[Trip.created_by]")
    maintenance_records: Mapped[list["MaintenanceRecord"]] = relationship("MaintenanceRecord", back_populates="creator", foreign_keys="[MaintenanceRecord.created_by]")
    fuel_logs: Mapped[list["FuelLog"]] = relationship("FuelLog", back_populates="creator", foreign_keys="[FuelLog.created_by]")
    expenses: Mapped[list["Expense"]] = relationship("Expense", back_populates="creator", foreign_keys="[Expense.created_by]")
