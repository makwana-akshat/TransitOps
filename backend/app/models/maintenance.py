from typing import TYPE_CHECKING
from datetime import datetime
import uuid
from sqlalchemy import String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.enums.fleet import MaintenanceStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.vehicle import Vehicle

class MaintenanceRecord(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "maintenance_records"

    vehicle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="RESTRICT"), index=True, nullable=False)
    
    maintenance_type: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    workshop_name: Mapped[str | None] = mapped_column(String, nullable=True)
    
    start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    status: Mapped[MaintenanceStatus] = mapped_column(Enum(MaintenanceStatus), default=MaintenanceStatus.OPEN, index=True, nullable=False)
    next_service_due: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="maintenance_records")
    creator: Mapped["User"] = relationship("User", back_populates="maintenance_records")
