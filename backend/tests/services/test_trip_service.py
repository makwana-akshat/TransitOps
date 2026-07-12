import pytest
import uuid
from unittest.mock import AsyncMock
from fastapi import HTTPException
from datetime import datetime, timezone, timedelta

from app.services.trip_service import TripService
from app.schemas.trip import TripCreate, TripUpdate, TripCompleteUpdate
from app.enums.fleet import TripStatus, VehicleStatus, DriverStatus
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.user import User

@pytest.fixture
def mock_db():
    # Mocking sqlalchemy AsyncSession which has begin_nested
    mock = AsyncMock()
    mock_transaction = AsyncMock()
    mock.begin_nested.return_value.__aenter__.return_value = mock_transaction
    return mock

@pytest.fixture
def service(mock_db):
    srv = TripService(mock_db)
    srv.repo = AsyncMock()
    srv.vehicle_repo = AsyncMock()
    srv.driver_repo = AsyncMock()
    srv.get_trip_by_id = AsyncMock()
    return srv

@pytest.mark.asyncio
async def test_create_trip_vehicle_unavailable(service):
    # Setup
    v = Vehicle(id=uuid.uuid4(), status=VehicleStatus.IN_SHOP, capacity_kg=1000)
    service.vehicle_repo.get_by_id.return_value = v
    service.driver_repo.get_by_id.return_value = Driver(id=uuid.uuid4(), status=DriverStatus.AVAILABLE)
    
    current_user = User(id=uuid.uuid4())
    trip_in = TripCreate(
        vehicle_id=v.id,
        driver_id=uuid.uuid4(),
        source="A",
        destination="B",
        cargo_description="Boxes",
        cargo_weight=500,
        planned_distance=100,
        planned_start=datetime.now(timezone.utc),
        planned_end=datetime.now(timezone.utc) + timedelta(days=1)
    )
    
    with pytest.raises(HTTPException) as exc:
        await service.create_trip(trip_in, current_user)
    
    assert exc.value.status_code == 409
    assert "Vehicle is not available" in exc.value.detail

@pytest.mark.asyncio
async def test_dispatch_trip_success(service):
    # Setup
    trip_id = uuid.uuid4()
    t = Trip(id=trip_id, status=TripStatus.DRAFT, vehicle_id=uuid.uuid4(), driver_id=uuid.uuid4())
    service.get_trip_by_id.return_value = t
    
    v = Vehicle(id=t.vehicle_id, status=VehicleStatus.AVAILABLE)
    service.vehicle_repo.get_by_id.return_value = v
    
    d = Driver(id=t.driver_id, status=DriverStatus.AVAILABLE)
    service.driver_repo.get_by_id.return_value = d
    
    current_user = User(id=uuid.uuid4())
    
    # Execute
    result = await service.dispatch_trip(trip_id, current_user)
    
    # Assert
    assert result.status == TripStatus.DISPATCHED
    assert v.status == VehicleStatus.ON_TRIP
    assert d.status == DriverStatus.ON_TRIP
    assert service.db.add.call_count == 3
    service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_complete_trip_invalid_odometer(service):
    trip_id = uuid.uuid4()
    t = Trip(id=trip_id, status=TripStatus.DISPATCHED, vehicle_id=uuid.uuid4(), driver_id=uuid.uuid4())
    service.get_trip_by_id.return_value = t
    
    v = Vehicle(id=t.vehicle_id, current_odometer=10000)
    service.vehicle_repo.get_by_id.return_value = v
    service.driver_repo.get_by_id.return_value = Driver(id=t.driver_id)
    
    current_user = User(id=uuid.uuid4())
    
    complete_in = TripCompleteUpdate(
        actual_distance=100,
        final_odometer=9000,
        fuel_consumed=10,
        trip_revenue=500
    )
    
    with pytest.raises(HTTPException) as exc:
        await service.complete_trip(trip_id, complete_in, current_user)
        
    assert exc.value.status_code == 400
    assert "greater than current odometer" in exc.value.detail

@pytest.mark.asyncio
async def test_cancel_trip_releases_resources(service):
    trip_id = uuid.uuid4()
    t = Trip(id=trip_id, status=TripStatus.DISPATCHED, vehicle_id=uuid.uuid4(), driver_id=uuid.uuid4())
    service.get_trip_by_id.return_value = t
    
    v = Vehicle(id=t.vehicle_id, status=VehicleStatus.ON_TRIP)
    service.vehicle_repo.get_by_id.return_value = v
    
    d = Driver(id=t.driver_id, status=DriverStatus.ON_TRIP)
    service.driver_repo.get_by_id.return_value = d
    
    current_user = User(id=uuid.uuid4())
    
    result = await service.cancel_trip(trip_id, current_user)
    
    assert result.status == TripStatus.CANCELLED
    assert v.status == VehicleStatus.AVAILABLE
    assert d.status == DriverStatus.AVAILABLE
