from typing import TYPE_CHECKING
from datetime import datetime, timezone
import uuid
from sqlalchemy import String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, TimestampMixin
from app.enums.fleet import ExpenseType, FuelType, PaymentMethod

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.vehicle import Vehicle
    from app.models.trip import Trip

class FuelLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "fuel_logs"

    vehicle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="RESTRICT"), index=True, nullable=False)
    trip_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("trips.id", ondelete="SET NULL"), index=True, nullable=True)
    
    fuel_type: Mapped[FuelType] = mapped_column(Enum(FuelType, name="fuel_type_enum"), nullable=False)
    liters: Mapped[float] = mapped_column(Float, nullable=False)
    price_per_liter: Mapped[float] = mapped_column(Float, nullable=False)
    total_cost: Mapped[float] = mapped_column(Float, nullable=False)
    
    fuel_station: Mapped[str | None] = mapped_column(String, nullable=True)
    odometer: Mapped[float | None] = mapped_column(Float, nullable=True)
    filled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    invoice_number: Mapped[str | None] = mapped_column(String, nullable=True)
    payment_method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod, name="payment_method_enum"), nullable=False)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="fuel_logs")
    trip: Mapped["Trip | None"] = relationship("Trip", back_populates="fuel_logs")
    creator: Mapped["User"] = relationship("User", back_populates="fuel_logs", foreign_keys=[created_by])
    updater: Mapped["User"] = relationship("User", foreign_keys=[updated_by])

class Expense(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "expenses"

    vehicle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="RESTRICT"), index=True, nullable=False)
    trip_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("trips.id", ondelete="SET NULL"), index=True, nullable=True)
    
    expense_type: Mapped[ExpenseType] = mapped_column(Enum(ExpenseType, name="expensetype"), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    
    expense_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    vendor: Mapped[str | None] = mapped_column(String, nullable=True)
    invoice_number: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    payment_method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod, name="payment_method_enum"), nullable=False)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="expenses")
    trip: Mapped["Trip | None"] = relationship("Trip", back_populates="expenses")
    creator: Mapped["User"] = relationship("User", back_populates="expenses", foreign_keys=[created_by])
    updater: Mapped["User"] = relationship("User", foreign_keys=[updated_by])
