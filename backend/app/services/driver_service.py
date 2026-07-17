import uuid
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.repositories.driver_repository import DriverRepository
from app.schemas.driver import DriverCreate, DriverUpdate, DriverStatusUpdate, DriverSafetyScoreUpdate, ComplianceAlertsResponse
from app.models.user import User, Role
from app.enums.fleet import DriverStatus

class DriverService:
    def __init__(self, db: AsyncSession):
        self.repo = DriverRepository(db)

    async def get_drivers(self, page: int, page_size: int, search: Optional[str] = None, **filters):
        return await self.repo.get_paginated(page, page_size, search, **filters)

    async def get_driver_by_id(self, driver_id: uuid.UUID):
        driver = await self.repo.get_by_id(driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        return driver

    async def create_driver(self, driver_in: DriverCreate, current_user: User):
        if await self.repo.get_by_employee_code(driver_in.employee_code):
            raise HTTPException(status_code=409, detail="Employee code already exists")
        if await self.repo.get_by_license_number(driver_in.license_number):
            raise HTTPException(status_code=409, detail="License number already exists")
        if await self.repo.get_by_email(driver_in.email):
            raise HTTPException(status_code=409, detail="Email already exists")
            
        driver_data = driver_in.model_dump(exclude_unset=True)
        driver_data["created_by"] = current_user.id
        return await self.repo.create(driver_data)

    async def update_driver(self, driver_id: uuid.UUID, driver_in: DriverUpdate, current_user: User):
        driver = await self.get_driver_by_id(driver_id)
        
        if driver_in.email and driver_in.email != driver.email:
            existing = await self.repo.get_by_email(driver_in.email)
            if existing and existing.id != driver.id:
                raise HTTPException(status_code=409, detail="Email already exists")
                
        update_data = driver_in.model_dump(exclude_unset=True)

        if "status" in update_data and update_data["status"] != driver.status:
            expiry = update_data.get("license_expiry", driver.license_expiry)
            self._validate_status_transition(driver, update_data["status"], current_user, expiry)

        return await self.repo.update(driver, update_data)

    async def update_status(self, driver_id: uuid.UUID, status_in: DriverStatusUpdate, current_user: User):
        driver = await self.get_driver_by_id(driver_id)
        if status_in.status != driver.status:
            self._validate_status_transition(driver, status_in.status, current_user, driver.license_expiry)
        return await self.repo.update(driver, {"status": status_in.status})

    async def update_safety_score(self, driver_id: uuid.UUID, score_in: DriverSafetyScoreUpdate):
        driver = await self.get_driver_by_id(driver_id)
        return await self.repo.update(driver, {"safety_score": score_in.safety_score})

    async def delete_driver(self, driver_id: uuid.UUID):
        driver = await self.get_driver_by_id(driver_id)
        if driver.status == DriverStatus.ON_TRIP:
            raise HTTPException(status_code=400, detail="Cannot delete a driver who is on an active trip")
        await self.repo.soft_delete(driver)

    async def get_compliance_alerts(self, safety_threshold: float = 50.0):
        all_active = await self.repo.get_all_active()
        
        expired = []
        expiring_soon = []
        low_safety = []
        
        today = datetime.now(timezone.utc).date()
        
        for d in all_active:
            if d.license_expiry:
                if d.license_expiry < today:
                    expired.append(d)
                else:
                    delta = d.license_expiry - today
                    if delta.days <= 30:
                        expiring_soon.append(d)
                        
            if d.safety_score is not None and d.safety_score < safety_threshold:
                low_safety.append(d)
                
        return ComplianceAlertsResponse(
            expired_licenses=expired,
            expiring_soon=expiring_soon,
            low_safety_scores=low_safety
        )

    def _validate_status_transition(self, current_driver, new_status: DriverStatus, current_user: User, expiry_date=None):
        if current_driver.status == DriverStatus.ON_TRIP and new_status == DriverStatus.SUSPENDED:
            raise HTTPException(status_code=400, detail="Cannot suspend a driver who is on an active trip")
            
        if current_driver.status == DriverStatus.SUSPENDED and new_status == DriverStatus.AVAILABLE:
            if current_user.role != Role.ADMIN:
                raise HTTPException(status_code=403, detail="Suspended drivers require administrator action to become available")
            
        if new_status in [DriverStatus.AVAILABLE, DriverStatus.ON_TRIP]:
            if not expiry_date or expiry_date < datetime.now(timezone.utc).date():
                raise HTTPException(status_code=400, detail="Drivers with expired licenses cannot be set to Available or On Trip")
