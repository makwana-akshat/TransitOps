---
title: "Controllers & Routes"
aliases: ["Routers", "API Endpoints"]
tags: ["#backend", "#controllers"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Controllers & Routes

Located in `backend/app/api/`. These are the HTTP entry points.

## Responsibilities
- Define HTTP Methods (`@router.get`, `@router.post`).
- Define input schemas and output schemas using `response_model`.
- Extract dependencies (like `get_db`, `get_current_user`).
- Delegate actual work to the [[Services Layer]].
- Handle any HTTP-specific exceptions (e.g., throwing a `404 HTTPException` if a service returns `None`).

## Example Implementation
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.vehicle_service import VehicleService

router = APIRouter()

@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: str, db: AsyncSession = Depends(get_db)):
    service = VehicleService(db)
    vehicle = await service.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle
```

## Best Practices
Do **not** write SQL queries or complex data transformations here. The controller should be as thin as possible.
