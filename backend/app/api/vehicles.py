from fastapi import APIRouter, Depends
from typing import List
from app.core.dependencies import get_current_user, require_role

router = APIRouter()

# Just returning placeholders as instructed by PRD

@router.get("/")
def get_vehicles(current_user: dict = Depends(get_current_user)):
    return {"data": []}

@router.post("/")
def create_vehicle(current_user: dict = Depends(require_role(["Admin", "Fleet Manager"]))):
    return {"message": "Vehicle created (placeholder)"}
