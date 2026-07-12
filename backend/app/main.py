from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.vehicles import router as vehicles_router
from app.api.webhooks import router as webhooks_router
from app.api.roles import router as roles_router
from app.api.permissions import router as permissions_router
from app.api.audit_logs import router as audit_logs_router

app = FastAPI(title="TransitOps API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(vehicles_router, prefix="/api/vehicles", tags=["vehicles"])
app.include_router(webhooks_router, prefix="/api/webhooks", tags=["webhooks"])
app.include_router(roles_router, prefix="/api/roles", tags=["roles"])
app.include_router(permissions_router, prefix="/api/permissions", tags=["permissions"])
app.include_router(audit_logs_router, prefix="/api/audit-logs", tags=["audit_logs"])
