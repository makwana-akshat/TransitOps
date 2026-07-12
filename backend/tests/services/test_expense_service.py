import pytest
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

from app.services.expense_service import ExpenseService
from app.schemas.expense import FuelLogCreate, ExpenseCreate
from app.enums.fleet import FuelType, PaymentMethod, ExpenseType

@pytest.fixture
def mock_db_session():
    session = AsyncMock()
    mock_txn = AsyncMock()
    mock_txn.__aenter__.return_value = mock_txn
    mock_txn.__aexit__.return_value = None
    session.begin_nested = MagicMock(return_value=mock_txn)
    return session

@pytest.fixture
def expense_service(mock_db_session):
    service = ExpenseService(mock_db_session)
    service.fuel_repo = AsyncMock()
    service.expense_repo = AsyncMock()
    service.vehicle_repo = AsyncMock()
    service.trip_repo = AsyncMock()
    return service

@pytest.mark.asyncio
async def test_create_fuel_log_updates_costs(expense_service):
    user = MagicMock(id=uuid.uuid4())
    vehicle = MagicMock(id=uuid.uuid4(), current_odometer=1000.0, total_fuel_cost=0.0, total_operational_cost=0.0)
    trip = MagicMock(id=uuid.uuid4(), trip_fuel_cost=0.0, trip_operational_cost=0.0)
    
    expense_service.vehicle_repo.get_by_id.return_value = vehicle
    expense_service.trip_repo.get_by_id.return_value = trip
    
    created_fuel_log = MagicMock(
        total_cost=500.0,
        trip_id=trip.id,
        vehicle_id=vehicle.id
    )
    expense_service.fuel_repo.create.return_value = created_fuel_log
    
    log_in = FuelLogCreate(
        vehicle_id=vehicle.id,
        trip_id=trip.id,
        fuel_type=FuelType.DIESEL,
        liters=50,
        price_per_liter=10,
        total_cost=500.0,
        filled_at=datetime.now(timezone.utc),
        payment_method=PaymentMethod.CASH,
        odometer=1050.0
    )
    
    result = await expense_service.create_fuel_log(log_in, user)
    
    assert vehicle.total_fuel_cost == 500.0
    assert vehicle.total_operational_cost == 500.0
    assert vehicle.current_odometer == 1050.0
    assert trip.trip_fuel_cost == 500.0
    assert trip.trip_operational_cost == 500.0
    
@pytest.mark.asyncio
async def test_create_expense_updates_maintenance_cost(expense_service):
    user = MagicMock(id=uuid.uuid4())
    vehicle = MagicMock(id=uuid.uuid4(), total_maintenance_cost=0.0, total_other_expenses=0.0, total_operational_cost=0.0)
    
    expense_service.vehicle_repo.get_by_id.return_value = vehicle
    expense_service.trip_repo.get_by_id.return_value = None
    
    created_expense = MagicMock(
        amount=1000.0,
        expense_type=ExpenseType.MAINTENANCE,
        trip_id=None,
        vehicle_id=vehicle.id
    )
    expense_service.expense_repo.create.return_value = created_expense
    
    expense_in = ExpenseCreate(
        vehicle_id=vehicle.id,
        expense_type=ExpenseType.MAINTENANCE,
        amount=1000.0,
        expense_date=datetime.now(timezone.utc),
        payment_method=PaymentMethod.CARD
    )
    
    result = await expense_service.create_expense(expense_in, user)
    
    assert vehicle.total_maintenance_cost == 1000.0
    assert vehicle.total_other_expenses == 0.0
    assert vehicle.total_operational_cost == 1000.0
