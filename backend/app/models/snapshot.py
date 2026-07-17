from datetime import date
from sqlalchemy import String, Float, Date, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin, TimestampMixin

class DailySnapshot(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "daily_snapshots"

    date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    metric_name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    value: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    __table_args__ = (
        UniqueConstraint('date', 'metric_name', name='uq_daily_snapshot_date_metric'),
    )
