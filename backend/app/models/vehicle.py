from typing import TYPE_CHECKING
from datetime import datetime, date
import uuid
from sqlalchemy import String, Integer, Float, Date, Enum, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.enums.fleet import VehicleStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.trip import Trip
    from app.models.maintenance import MaintenanceRecord
    from app.models.expense import FuelLog, Expense

class Vehicle(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "vehicles"

    registration_number: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    vehicle_name: Mapped[str | None] = mapped_column(String, nullable=True)
    model: Mapped[str | None] = mapped_column(String, nullable=True)
    manufacturer: Mapped[str | None] = mapped_column(String, nullable=True)
    vehicle_type: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[VehicleStatus] = mapped_column(Enum(VehicleStatus), default=VehicleStatus.AVAILABLE, index=True, nullable=False)
    capacity_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_odometer: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    acquisition_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    purchase_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    region: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    color: Mapped[str | None] = mapped_column(String, nullable=True)
    engine_number: Mapped[str | None] = mapped_column(String, nullable=True)
    chassis_number: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    __table_args__ = (
        CheckConstraint('capacity_kg > 0', name='check_capacity_kg_positive'),
        CheckConstraint('acquisition_cost >= 0', name='check_acquisition_cost_positive'),
    )

    # Relationships
    creator: Mapped["User"] = relationship("User", back_populates="vehicles")
    trips: Mapped[list["Trip"]] = relationship("Trip", back_populates="vehicle", cascade="all, delete-orphan")
    fuel_logs: Mapped[list["FuelLog"]] = relationship("FuelLog", back_populates="vehicle", cascade="all, delete-orphan")
    expenses: Mapped[list["Expense"]] = relationship("Expense", back_populates="vehicle", cascade="all, delete-orphan")
    maintenance_records: Mapped[list["MaintenanceRecord"]] = relationship("MaintenanceRecord", back_populates="vehicle", cascade="all, delete-orphan")
