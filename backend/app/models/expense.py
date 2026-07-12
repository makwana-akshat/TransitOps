from typing import TYPE_CHECKING
from datetime import datetime, timezone
import uuid
from sqlalchemy import String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin
from app.enums.fleet import ExpenseType

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.vehicle import Vehicle
    from app.models.trip import Trip

class FuelLog(Base, UUIDMixin):
    __tablename__ = "fuel_logs"

    vehicle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="RESTRICT"), index=True, nullable=False)
    trip_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("trips.id", ondelete="SET NULL"), index=True, nullable=True)
    
    liters: Mapped[float | None] = mapped_column(Float, nullable=True)
    price_per_liter: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    fuel_station: Mapped[str | None] = mapped_column(String, nullable=True)
    odometer: Mapped[float | None] = mapped_column(Float, nullable=True)
    filled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="fuel_logs")
    trip: Mapped["Trip | None"] = relationship("Trip", back_populates="fuel_logs")
    creator: Mapped["User"] = relationship("User", back_populates="fuel_logs")

class Expense(Base, UUIDMixin):
    __tablename__ = "expenses"

    vehicle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="RESTRICT"), index=True, nullable=False)
    trip_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("trips.id", ondelete="SET NULL"), index=True, nullable=True)
    
    expense_type: Mapped[ExpenseType] = mapped_column(Enum(ExpenseType), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    expense_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="expenses")
    trip: Mapped["Trip | None"] = relationship("Trip", back_populates="expenses")
    creator: Mapped["User"] = relationship("User", back_populates="expenses")
