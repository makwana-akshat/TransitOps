from typing import TYPE_CHECKING
from datetime import datetime
import uuid
from sqlalchemy import String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.enums.fleet import MaintenanceStatus, MaintenanceType, MaintenancePriority

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.vehicle import Vehicle

class MaintenanceRecord(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "maintenance_records"

    vehicle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="RESTRICT"), index=True, nullable=False)
    
    maintenance_type: Mapped[MaintenanceType] = mapped_column(Enum(MaintenanceType, name="maintenance_type_enum"), nullable=False)
    priority: Mapped[MaintenancePriority] = mapped_column(Enum(MaintenancePriority, name="maintenance_priority_enum"), default=MaintenancePriority.MEDIUM, nullable=False)
    
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    workshop_name: Mapped[str | None] = mapped_column(String, nullable=True)
    mechanic_name: Mapped[str | None] = mapped_column(String, nullable=True)
    invoice_number: Mapped[str | None] = mapped_column(String, nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    estimated_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    actual_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expected_completion: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    next_service_due: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    status: Mapped[MaintenanceStatus] = mapped_column(Enum(MaintenanceStatus, name="maintenancestatus"), default=MaintenanceStatus.OPEN, index=True, nullable=False)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="maintenance_records")
    creator: Mapped["User"] = relationship("User", back_populates="maintenance_records")
