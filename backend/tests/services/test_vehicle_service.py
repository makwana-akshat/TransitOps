import pytest
import uuid
from unittest.mock import AsyncMock
from fastapi import HTTPException

from app.services.vehicle_service import VehicleService
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleStatusUpdate
from app.enums.fleet import VehicleStatus
from app.models.vehicle import Vehicle
from app.models.user import User

@pytest.fixture
def mock_db():
    return AsyncMock()

@pytest.fixture
def service(mock_db):
    srv = VehicleService(mock_db)
    srv.repo = AsyncMock()
    # Mocking internal get_vehicle_by_id to avoid calling repo in tests unless specifically needed
    srv.get_vehicle_by_id = AsyncMock()
    return srv

@pytest.mark.asyncio
async def test_create_duplicate_registration(service):
    # Setup
    service.repo.get_by_registration.return_value = Vehicle(id=uuid.uuid4())
    current_user = User(id=uuid.uuid4())
    vehicle_in = VehicleCreate(registration_number="AB123", vehicle_name="Test Truck")
    
    # Assert
    with pytest.raises(HTTPException) as exc:
        await service.create_vehicle(vehicle_in, current_user)
    
    assert exc.value.status_code == 409
    assert "already exists" in exc.value.detail

@pytest.mark.asyncio
async def test_update_odometer_regression(service):
    # Setup
    vehicle_id = uuid.uuid4()
    v = Vehicle(id=vehicle_id, current_odometer=50000, status=VehicleStatus.AVAILABLE)
    service.get_vehicle_by_id.return_value = v
    
    update_in = VehicleUpdate(current_odometer=40000)  # Attempting to decrease
    
    # Assert
    with pytest.raises(HTTPException) as exc:
        await service.update_vehicle(vehicle_id, update_in)
        
    assert exc.value.status_code == 400
    assert "cannot decrease" in exc.value.detail

@pytest.mark.asyncio
async def test_status_transition_retired_to_available(service):
    # Setup
    vehicle_id = uuid.uuid4()
    v = Vehicle(id=vehicle_id, status=VehicleStatus.RETIRED)
    service.get_vehicle_by_id.return_value = v
    
    status_in = VehicleStatusUpdate(status=VehicleStatus.AVAILABLE)
    
    # Assert
    with pytest.raises(HTTPException) as exc:
        await service.update_status(vehicle_id, status_in)
        
    assert exc.value.status_code == 400
    assert "cannot become available" in exc.value.detail

@pytest.mark.asyncio
async def test_edit_retired_vehicle_fails(service):
    # Setup
    vehicle_id = uuid.uuid4()
    v = Vehicle(id=vehicle_id, status=VehicleStatus.RETIRED)
    service.get_vehicle_by_id.return_value = v
    
    # Attempting to change model (not allowed)
    update_in = VehicleUpdate(model="New Model")
    
    with pytest.raises(HTTPException) as exc:
        await service.update_vehicle(vehicle_id, update_in)
        
    assert exc.value.status_code == 400
    assert "except for notes" in exc.value.detail

@pytest.mark.asyncio
async def test_edit_retired_vehicle_notes_succeeds(service):
    # Setup
    vehicle_id = uuid.uuid4()
    v = Vehicle(id=vehicle_id, status=VehicleStatus.RETIRED)
    service.get_vehicle_by_id.return_value = v
    
    # Returning a mock from the repo update call
    service.repo.update.return_value = v
    
    # Attempting to change only notes
    update_in = VehicleUpdate(notes="Sold for scrap")
    
    result = await service.update_vehicle(vehicle_id, update_in)
    assert result == v
