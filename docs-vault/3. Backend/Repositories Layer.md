---
title: "Repositories Layer"
aliases: ["Data Access", "Repositories"]
tags: ["#backend", "#database"]
created: "2026-07-17"
updated: "2026-07-17"
---

# Repositories Layer

Located in `backend/app/repositories/`. 

## Responsibilities
- Execute raw SQLAlchemy queries.
- Isolate the rest of the application from the database technology.

## Pattern
We use the Repository Pattern. Instead of services querying the DB directly, they instantiate a repository.
```python
class VehicleRepository:
    def __init__(self, db_session: AsyncSession):
        self.db = db_session

    async def get_all(self):
        stmt = select(Vehicle).where(Vehicle.deleted_at.is_(None))
        result = await self.db.execute(stmt)
        return result.scalars().all()
```

## Benefits
- **Testability**: You can mock `VehicleRepository` to return dummy Python objects instead of setting up a test database.
- **Maintainability**: If we switch from SQLAlchemy ORM to raw SQL or another ORM like SQLModel, we only have to change the Repositories; the Controllers and Services remain untouched.
