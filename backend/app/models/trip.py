from typing import TYPE_CHECKING
from datetime import datetime
import uuid
from sqlalchemy import String, Float, DateTime, Enum, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.enums.fleet import TripStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.vehicle import Vehicle
    from app.models.driver import Driver
    from app.models.expense import FuelLog, Expense

class Trip(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "trips"

    trip_number: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    
    vehicle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="RESTRICT"), index=True, nullable=False)
    driver_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("drivers.id", ondelete="RESTRICT"), index=True, nullable=False)
    
    source: Mapped[str | None] = mapped_column(String, nullable=True)
    destination: Mapped[str | None] = mapped_column(String, nullable=True)
    cargo_description: Mapped[str | None] = mapped_column(String, nullable=True)
    
    cargo_weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    planned_distance: Mapped[float | None] = mapped_column(Float, nullable=True)
    actual_distance: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    planned_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    planned_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    fuel_consumed: Mapped[float | None] = mapped_column(Float, nullable=True)
    trip_revenue: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    status: Mapped[TripStatus] = mapped_column(Enum(TripStatus), default=TripStatus.DRAFT, index=True, nullable=False)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Cumulative Cost Fields (Updated by services)
    trip_fuel_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    trip_expenses: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    trip_operational_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    __table_args__ = (
        CheckConstraint('cargo_weight >= 0', name='check_cargo_weight_nonnegative'),
        CheckConstraint('planned_distance >= 0', name='check_planned_distance_nonnegative'),
        CheckConstraint('actual_distance >= 0', name='check_actual_distance_nonnegative'),
        CheckConstraint('fuel_consumed >= 0', name='check_fuel_consumed_nonnegative'),
    )

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="trips")
    driver: Mapped["Driver"] = relationship("Driver", back_populates="trips")
    creator: Mapped["User"] = relationship("User", back_populates="trips")
    
    fuel_logs: Mapped[list["FuelLog"]] = relationship("FuelLog", back_populates="trip", cascade="all, delete-orphan")
    expenses: Mapped[list["Expense"]] = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
