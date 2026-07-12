import pytest
import uuid
from unittest.mock import AsyncMock
from fastapi import HTTPException
from datetime import datetime, timezone, timedelta

from app.services.maintenance_service import MaintenanceService
from app.schemas.maintenance import MaintenanceRecordCreate, MaintenanceCompleteUpdate
from app.enums.fleet import MaintenanceStatus, VehicleStatus, MaintenanceType, MaintenancePriority
from app.models.maintenance import MaintenanceRecord
from app.models.vehicle import Vehicle
from app.models.user import User

@pytest.fixture
def mock_db():
    mock = AsyncMock()
    mock_transaction = AsyncMock()
    mock.begin_nested.return_value.__aenter__.return_value = mock_transaction
    return mock

@pytest.fixture
def service(mock_db):
    srv = MaintenanceService(mock_db)
    srv.repo = AsyncMock()
    srv.vehicle_repo = AsyncMock()
    srv.get_by_id = AsyncMock()
    return srv

@pytest.mark.asyncio
async def test_create_maintenance_vehicle_retired(service):
    v = Vehicle(id=uuid.uuid4(), status=VehicleStatus.RETIRED)
    service.vehicle_repo.get_by_id.return_value = v
    
    current_user = User(id=uuid.uuid4())
    record_in = MaintenanceRecordCreate(
        vehicle_id=v.id,
        maintenance_type=MaintenanceType.OIL_CHANGE,
        priority=MaintenancePriority.MEDIUM,
        start_date=datetime.now(timezone.utc)
    )
    
    with pytest.raises(HTTPException) as exc:
        await service.create_maintenance(record_in, current_user)
        
    assert exc.value.status_code == 400
    assert "retired vehicle" in exc.value.detail

@pytest.mark.asyncio
async def test_create_maintenance_vehicle_on_trip(service):
    v = Vehicle(id=uuid.uuid4(), status=VehicleStatus.ON_TRIP)
    service.vehicle_repo.get_by_id.return_value = v
    
    current_user = User(id=uuid.uuid4())
    record_in = MaintenanceRecordCreate(
        vehicle_id=v.id,
        maintenance_type=MaintenanceType.OIL_CHANGE,
        priority=MaintenancePriority.MEDIUM,
        start_date=datetime.now(timezone.utc)
    )
    
    with pytest.raises(HTTPException) as exc:
        await service.create_maintenance(record_in, current_user)
        
    assert exc.value.status_code == 409
    assert "currently on a trip" in exc.value.detail

@pytest.mark.asyncio
async def test_create_maintenance_success_changes_vehicle_status(service):
    v = Vehicle(id=uuid.uuid4(), status=VehicleStatus.AVAILABLE)
    service.vehicle_repo.get_by_id.return_value = v
    service.repo.get_active_for_vehicle.return_value = []
    
    current_user = User(id=uuid.uuid4())
    record_in = MaintenanceRecordCreate(
        vehicle_id=v.id,
        maintenance_type=MaintenanceType.OIL_CHANGE,
        priority=MaintenancePriority.MEDIUM,
        start_date=datetime.now(timezone.utc)
    )
    
    service.repo.create.return_value = MaintenanceRecord(id=uuid.uuid4(), status=MaintenanceStatus.OPEN)
    
    result = await service.create_maintenance(record_in, current_user)
    
    assert v.status == VehicleStatus.IN_SHOP
    assert service.db.add.called
    service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_complete_maintenance_restores_vehicle(service):
    record_id = uuid.uuid4()
    m = MaintenanceRecord(id=record_id, status=MaintenanceStatus.OPEN, vehicle_id=uuid.uuid4())
    service.get_by_id.return_value = m
    
    v = Vehicle(id=m.vehicle_id, status=VehicleStatus.IN_SHOP)
    service.vehicle_repo.get_by_id.return_value = v
    
    current_user = User(id=uuid.uuid4())
    complete_in = MaintenanceCompleteUpdate(actual_cost=500.0)
    
    result = await service.complete_maintenance(record_id, complete_in, current_user)
    
    assert result.status == MaintenanceStatus.COMPLETED
    assert result.actual_cost == 500.0
    assert v.status == VehicleStatus.AVAILABLE
    service.db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_complete_maintenance_does_not_restore_retired_vehicle(service):
    record_id = uuid.uuid4()
    m = MaintenanceRecord(id=record_id, status=MaintenanceStatus.IN_PROGRESS, vehicle_id=uuid.uuid4())
    service.get_by_id.return_value = m
    
    v = Vehicle(id=m.vehicle_id, status=VehicleStatus.RETIRED)
    service.vehicle_repo.get_by_id.return_value = v
    
    current_user = User(id=uuid.uuid4())
    complete_in = MaintenanceCompleteUpdate(actual_cost=500.0)
    
    result = await service.complete_maintenance(record_id, complete_in, current_user)
    
    assert result.status == MaintenanceStatus.COMPLETED
    assert v.status == VehicleStatus.RETIRED
