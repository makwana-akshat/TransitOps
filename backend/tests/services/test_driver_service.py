import pytest
import uuid
from unittest.mock import AsyncMock
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone

from app.services.driver_service import DriverService
from app.schemas.driver import DriverCreate, DriverStatusUpdate
from app.enums.fleet import DriverStatus
from app.models.driver import Driver
from app.models.user import User, Role

@pytest.fixture
def mock_db():
    return AsyncMock()

@pytest.fixture
def service(mock_db):
    srv = DriverService(mock_db)
    srv.repo = AsyncMock()
    srv.get_driver_by_id = AsyncMock()
    return srv

@pytest.mark.asyncio
async def test_create_duplicate_employee_code(service):
    service.repo.get_by_employee_code.return_value = Driver(id=uuid.uuid4())
    service.repo.get_by_license_number.return_value = None
    service.repo.get_by_email.return_value = None
    
    current_user = User(id=uuid.uuid4(), role=Role.FLEET_MANAGER)
    driver_in = DriverCreate(
        employee_code="E001",
        full_name="John Doe",
        email="test@test.com",
        phone="12345",
        license_number="L123"
    )
    
    with pytest.raises(HTTPException) as exc:
        await service.create_driver(driver_in, current_user)
        
    assert exc.value.status_code == 409
    assert "Employee code already exists" in exc.value.detail

@pytest.mark.asyncio
async def test_expired_license_cannot_be_available(service):
    driver_id = uuid.uuid4()
    past_date = (datetime.now(timezone.utc) - timedelta(days=10)).date()
    
    d = Driver(id=driver_id, status=DriverStatus.SUSPENDED, license_expiry=past_date)
    service.get_driver_by_id.return_value = d
    
    current_user = User(id=uuid.uuid4(), role=Role.ADMIN)
    status_in = DriverStatusUpdate(status=DriverStatus.AVAILABLE)
    
    with pytest.raises(HTTPException) as exc:
        await service.update_status(driver_id, status_in, current_user)
        
    assert exc.value.status_code == 400
    assert "expired licenses cannot be set to Available" in exc.value.detail

@pytest.mark.asyncio
async def test_suspended_requires_admin_to_become_available(service):
    driver_id = uuid.uuid4()
    future_date = (datetime.now(timezone.utc) + timedelta(days=10)).date()
    
    d = Driver(id=driver_id, status=DriverStatus.SUSPENDED, license_expiry=future_date)
    service.get_driver_by_id.return_value = d
    
    current_user = User(id=uuid.uuid4(), role=Role.FLEET_MANAGER)
    status_in = DriverStatusUpdate(status=DriverStatus.AVAILABLE)
    
    with pytest.raises(HTTPException) as exc:
        await service.update_status(driver_id, status_in, current_user)
        
    assert exc.value.status_code == 403
    assert "require administrator action" in exc.value.detail

@pytest.mark.asyncio
async def test_cannot_delete_on_trip(service):
    driver_id = uuid.uuid4()
    d = Driver(id=driver_id, status=DriverStatus.ON_TRIP)
    service.get_driver_by_id.return_value = d
    
    with pytest.raises(HTTPException) as exc:
        await service.delete_driver(driver_id)
        
    assert exc.value.status_code == 400
    assert "active trip" in exc.value.detail
