import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.report_service import ReportService
import io
import uuid

@pytest.fixture
def mock_db_session():
    return AsyncMock()

@pytest.fixture
def report_service(mock_db_session):
    service = ReportService(mock_db_session)
    service.repo = AsyncMock()
    return service

@pytest.mark.asyncio
async def test_get_vehicle_roi(report_service):
    # ROI = ((Revenue - (Maint + Fuel + Other)) / Acq) * 100
    report_service.repo.get_vehicle_roi.return_value = [
        MagicMock(
            id=uuid.uuid4(),
            registration_number="ABC-123",
            acquisition_cost=100000.0,
            revenue=50000.0,
            total_maintenance_cost=5000.0,
            total_fuel_cost=10000.0,
            total_other_expenses=5000.0
        )
    ]
    
    res = await report_service.get_vehicle_roi()
    
    assert len(res) == 1
    assert res[0].roi_percentage == 30.0

@pytest.mark.asyncio
async def test_get_fuel_efficiency(report_service):
    # km_per_liter = distance / fuel_consumed
    report_service.repo.get_fuel_efficiency.return_value = [
        MagicMock(
            id=uuid.uuid4(),
            registration_number="XYZ-999",
            distance=1000.0,
            fuel_consumed=100.0
        )
    ]
    
    res = await report_service.get_fuel_efficiency()
    
    assert len(res) == 1
    assert res[0].km_per_liter == 10.0

@pytest.mark.asyncio
async def test_export_report_csv(report_service):
    report_service.get_fleet_utilization = AsyncMock(return_value=[
        {"vehicle_id": uuid.uuid4(), "registration_number": "R-1", "total_trips": 5, "distance_travelled": 100.0, "idle_time_hours": 0.0, "utilization_percentage": 100.0}
    ])
    
    buffer, media_type, filename = await report_service.export_report("fleet-utilization", "csv")
    
    assert media_type == "text/csv"
    assert filename == "fleet-utilization.csv"
    assert isinstance(buffer, io.BytesIO)
    content = buffer.getvalue().decode('utf-8')
    assert "registration_number" in content
    assert "R-1" in content
