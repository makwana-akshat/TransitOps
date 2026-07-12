import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, status
import structlog
from app.core.config import settings

logger = structlog.get_logger()

# Setup PyJWKClient
# Clerk JWKS endpoint typically: https://{issuer}/.well-known/jwks.json
# Wait, issuer has a trailing slash sometimes. Let's make it robust.
issuer_url = settings.clerk_jwt_issuer.rstrip("/")
jwks_url = f"{issuer_url}/.well-known/jwks.json"
jwk_client = PyJWKClient(jwks_url)

def verify_clerk_token(token: str) -> dict:
    try:
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        data = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.clerk_jwt_audience,
            issuer=settings.clerk_jwt_issuer,
        )
        return data
    except jwt.exceptions.PyJWKClientError as e:
        logger.error("jwt_jwks_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to fetch JWKS to verify token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.error("jwt_invalid_token", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error("jwt_validation_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
