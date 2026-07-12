from typing import TYPE_CHECKING
from datetime import datetime, date
import uuid
from sqlalchemy import String, Integer, Float, Date, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.enums.fleet import DriverStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.trip import Trip

class Driver(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "drivers"

    employee_code: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    license_number: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    license_category: Mapped[str | None] = mapped_column(String, nullable=True)
    license_expiry: Mapped[date | None] = mapped_column(Date, nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    joining_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(String, nullable=True)
    safety_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[DriverStatus] = mapped_column(Enum(DriverStatus), default=DriverStatus.AVAILABLE, index=True, nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)

    # Relationships
    creator: Mapped["User"] = relationship("User", back_populates="drivers")
    trips: Mapped[list["Trip"]] = relationship("Trip", back_populates="driver", cascade="all, delete-orphan")
