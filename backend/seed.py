import asyncio
import random
import uuid
from datetime import datetime, timedelta, date, timezone
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, func

from app.db.session import AsyncSessionLocal
from app.models.snapshot import DailySnapshot
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.maintenance import MaintenanceRecord
from app.models.expense import FuelLog, Expense
from app.enums.fleet import VehicleStatus, DriverStatus, TripStatus, FuelType, PaymentMethod

fake = Faker()

async def clear_mock_data(db: AsyncSession):
    await db.execute(delete(DailySnapshot))
    await db.execute(delete(Expense))
    await db.execute(delete(FuelLog))
    await db.execute(delete(MaintenanceRecord))
    await db.execute(delete(Trip))
    await db.execute(delete(Vehicle))
    await db.execute(delete(Driver))
    await db.commit()
    print("Cleared old mock data")

async def seed_data(db: AsyncSession):
    # Seed 50 Vehicles
    vehicles = []
    for _ in range(50):
        # Weighted status distribution
        status = random.choices(
            [VehicleStatus.AVAILABLE, VehicleStatus.ON_TRIP, VehicleStatus.IN_SHOP, VehicleStatus.RETIRED],
            weights=[60, 30, 8, 2], k=1
        )[0]
        
        v = Vehicle(
            id=uuid.uuid4(),
            registration_number=fake.unique.license_plate(),
            vehicle_name=f"{fake.company()} Truck",
            model=fake.word().capitalize(),
            manufacturer=fake.company(),
            status=status,
            capacity_kg=random.uniform(1000, 5000),
            current_odometer=random.uniform(1000, 100000),
            year=random.randint(2015, 2026),
            acquisition_cost=random.uniform(20000, 80000)
        )
        vehicles.append(v)
    db.add_all(vehicles)

    # Seed 40 Drivers
    drivers = []
    for _ in range(40):
        status = random.choices(
            [DriverStatus.AVAILABLE, DriverStatus.ON_TRIP, DriverStatus.OFF_DUTY, DriverStatus.SUSPENDED],
            weights=[40, 40, 18, 2], k=1
        )[0]
        
        d = Driver(
            id=uuid.uuid4(),
            employee_code=fake.unique.bothify(text='EMP-#####'),
            full_name=fake.name(),
            license_number=fake.unique.bothify(text='DL-#########'),
            status=status,
            phone=fake.phone_number(),
        )
        drivers.append(d)
    db.add_all(drivers)
    
    await db.commit()
    
    # Seed 500 trips over last 6 months
    trips = []
    fuel_logs = []
    for _ in range(500):
        v = random.choice(vehicles)
        d = random.choice(drivers)
        
        # Random date in last 180 days
        days_ago = random.randint(0, 180)
        created_at = datetime.now() - timedelta(days=days_ago)
        
        status = random.choices(
            [TripStatus.COMPLETED, TripStatus.DISPATCHED, TripStatus.DRAFT, TripStatus.CANCELLED],
            weights=[85, 5, 5, 5], k=1
        )[0]
        
        t = Trip(
            trip_number=f"TRP-{fake.unique.random_int(min=10000, max=99999)}",
            vehicle_id=v.id,
            driver_id=d.id,
            source=fake.city(),
            destination=fake.city(),
            status=status,
            planned_distance=random.uniform(10, 500),
            trip_expenses=random.uniform(50, 500),
            created_at=created_at,
            updated_at=created_at
        )
        trips.append(t)
        
        # Add fuel log for some trips
        if random.random() > 0.5:
            liters = random.uniform(20, 100)
            price_per_liter = random.uniform(1.2, 2.5)
            fuel_logs.append(FuelLog(
                vehicle_id=v.id,
                fuel_type=random.choice(list(FuelType)),
                liters=liters,
                price_per_liter=price_per_liter,
                total_cost=liters * price_per_liter,
                filled_at=created_at,
                payment_method=random.choice(list(PaymentMethod)),
                odometer=v.current_odometer - random.uniform(0, 1000),
                created_at=created_at
            ))
            
    db.add_all(trips)
    db.add_all(fuel_logs)
    
    # Seed 50 maintenance records
    maintenance_records = []
    for _ in range(50):
        v = random.choice(vehicles)
        days_ago = random.randint(0, 180)
        start_date = datetime.now() - timedelta(days=days_ago)
        
        from app.enums.fleet import MaintenanceStatus, MaintenanceType, MaintenancePriority
        
        status = random.choices(
            [MaintenanceStatus.COMPLETED, MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.OPEN, MaintenanceStatus.CANCELLED],
            weights=[70, 15, 10, 5], k=1
        )[0]
        
        m = MaintenanceRecord(
            vehicle_id=v.id,
            maintenance_type=random.choice(list(MaintenanceType)),
            priority=random.choice(list(MaintenancePriority)),
            description=fake.sentence(),
            workshop_name=fake.company() + " Workshop",
            mechanic_name=fake.name(),
            estimated_cost=random.uniform(100, 2000),
            actual_cost=random.uniform(100, 2000) if status == MaintenanceStatus.COMPLETED else None,
            start_date=start_date,
            completed_date=start_date + timedelta(days=random.randint(1, 5)) if status == MaintenanceStatus.COMPLETED else None,
            status=status,
            created_at=start_date,
            updated_at=start_date
        )
        maintenance_records.append(m)
        
    db.add_all(maintenance_records)
    await db.commit()
    print("Seeded Vehicles, Drivers, Trips, Fuel Logs, and Maintenance Records")

    # Generate Snapshots based on the CURRENT true state, drifting backwards
    
    # Calculate actual current state to anchor the snapshots
    active_vehicles = sum(1 for v in vehicles if v.status != VehicleStatus.RETIRED)
    available_vehicles = sum(1 for v in vehicles if v.status == VehicleStatus.AVAILABLE)
    vehicles_in_maintenance = sum(1 for v in vehicles if v.status == VehicleStatus.IN_SHOP)
    retired_vehicles = sum(1 for v in vehicles if v.status == VehicleStatus.RETIRED)
    
    # Calculate trips from today (days_ago == 0)
    # Since we used random dates, today's completed trips might be low, so let's guarantee at least some
    completed_trips_today = sum(1 for t in trips if t.status == TripStatus.COMPLETED and t.created_at.date() == date.today())
    completed_trips_today += random.randint(10, 20) # Boost for a healthy dashboard
    
    drivers_on_duty = sum(1 for d in drivers if d.status == DriverStatus.ON_TRIP)
    
    on_trip = sum(1 for v in vehicles if v.status == VehicleStatus.ON_TRIP)
    utilization = round((on_trip / active_vehicles) * 100, 2) if active_vehicles > 0 else 0

    metrics = {
        "active_vehicles": active_vehicles,
        "available_vehicles": available_vehicles,
        "vehicles_in_maintenance": vehicles_in_maintenance,
        "retired_vehicles": retired_vehicles,
        "completed_trips_today": completed_trips_today,
        "drivers_on_duty": drivers_on_duty,
        "fleet_utilization": utilization,
    }

    snapshots = []
    # Seed past 60 days
    # We drift backwards from today. We want it to be slightly *worse* in the past so today looks *green*
    for day_offset in range(1, 61):
        target_date = date.today() - timedelta(days=day_offset)
        
        # Drift backwards (so 30 days ago, numbers were slightly smaller, meaning % change today is positive)
        metrics["completed_trips_today"] = int(max(0, metrics["completed_trips_today"] - random.randint(-2, 5)))
        metrics["available_vehicles"] = int(max(0, metrics["available_vehicles"] - random.randint(-1, 2)))
        metrics["vehicles_in_maintenance"] = int(max(0, metrics["vehicles_in_maintenance"] + random.randint(-1, 1))) # Maintenance was higher
        metrics["drivers_on_duty"] = int(max(0, metrics["drivers_on_duty"] - random.randint(-1, 2)))
        metrics["fleet_utilization"] = round(max(0.0, metrics["fleet_utilization"] - random.uniform(-1.0, 2.0)), 1)

        for metric_name, value in metrics.items():
            snapshots.append(DailySnapshot(
                date=target_date,
                metric_name=metric_name,
                value=float(value)
            ))
            
    db.add_all(snapshots)
    await db.commit()
    print("Seeded 60 days of DailySnapshots with positive historical drift")

async def main():
    async with AsyncSessionLocal() as db:
        await clear_mock_data(db)
        await seed_data(db)
        print("Seeding completely finished!")

if __name__ == "__main__":
    asyncio.run(main())
