import pytest
from unittest.mock import AsyncMock
from app.services.dashboard_service import DashboardService

@pytest.fixture
def mock_db_session():
    return AsyncMock()

@pytest.fixture
def dashboard_service(mock_db_session):
    service = DashboardService(mock_db_session)
    service.repo = AsyncMock()
    return service

@pytest.mark.asyncio
async def test_get_overview_calculates_utilization(dashboard_service):
    dashboard_service.repo.get_overview.return_value = {
        "activeVehicles": 100,
        "availableVehicles": 50,
        "vehiclesInMaintenance": 20,
        "retiredVehicles": 10,
        "onTripVehicles": 30,
        "activeTrips": 25,
        "completedTripsToday": 5,
        "pendingTrips": 10,
        "driversOnDuty": 30,
        "availableDrivers": 40,
        "suspendedDrivers": 5,
        "totalFuelCost": 15000.5,
        "totalMaintenanceCost": 2000.0,
        "totalOperationalCost": 17000.5
    }
    
    result = await dashboard_service.get_overview()
    
    assert result.fleetUtilization == 30.0
    assert result.activeVehicles == 100
    assert result.totalFuelCost == 15000.5

@pytest.mark.asyncio
async def test_caching_works(dashboard_service):
    dashboard_service.repo.get_trip_status_chart.return_value = [{"status": "COMPLETED", "count": 10}]
    
    res1 = await dashboard_service.get_trip_status_chart()
    dashboard_service.repo.get_trip_status_chart.assert_called_once()
    
    res2 = await dashboard_service.get_trip_status_chart()
    assert dashboard_service.repo.get_trip_status_chart.call_count == 1
    assert res1[0].status == res2[0].status
