import os
from fastapi import APIRouter, Request, HTTPException, Depends
from svix.webhooks import Webhook, WebhookVerificationError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.domain import User, Role

router = APIRouter()

# In production, this should be set in the environment variables
CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET", "whsec_placeholder")

@router.post("/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Receives webhooks from Clerk and synchronizes users with Supabase.
    """
    payload = await request.body()
    headers = request.headers
    
    # Extract Svix headers required for signature verification
    svix_id = headers.get("svix-id")
    svix_timestamp = headers.get("svix-timestamp")
    svix_signature = headers.get("svix-signature")
    
    if not svix_id or not svix_timestamp or not svix_signature:
        # We raise a 400 bad request if headers are missing
        raise HTTPException(status_code=400, detail="Missing svix headers")
        
    try:
        # Verify the webhook signature using the Clerk Webhook Secret
        wh = Webhook(CLERK_WEBHOOK_SECRET)
        evt = wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        })
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
        
    # Handle user.created event to automatically sync with Supabase
    if evt["type"] == "user.created":
        data = evt["data"]
        clerk_id = data["id"]
        email = data["email_addresses"][0]["email_address"]
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        full_name = f"{first_name} {last_name}".strip()
        avatar_url = data.get("image_url", "")
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.clerk_id == clerk_id).first()
        if not existing_user:
            # Fetch the ID for the default "Driver" role
            driver_role = db.query(Role).filter(Role.name == "Driver").first()
            role_id = driver_role.id if driver_role else None
            
            # Create the new user with "Active" status and "Driver" role
            new_user = User(
                clerk_id=clerk_id,
                email=email,
                full_name=full_name,
                avatar_url=avatar_url,
                role_id=role_id,
                status="Active"
            )
            db.add(new_user)
            db.commit()
            
    return {"success": True}
