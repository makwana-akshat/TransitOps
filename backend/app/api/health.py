from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/api/health")
async def health_check():
    """Health check endpoint to verify the API is running."""
    return {"status": "healthy"}
