from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import requests
from app.core.config import settings

bearer_scheme = HTTPBearer()

# Cache JWKS for performance
_jwks = None
def get_jwks():
    global _jwks
    if _jwks is None:
        resp = requests.get(settings.COGNITO_JWKS_URL)
        _jwks = resp.json()["keys"]
    return _jwks

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    jwks = get_jwks()
    try:
        header = jwt.get_unverified_header(token)
        key = next(k for k in jwks if k["kid"] == header["kid"])
        public_key = jwt.construct_rsa_public_key(key)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.COGNITO_APP_CLIENT_ID,
            issuer=f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/{settings.COGNITO_USERPOOL_ID}"
        )
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication: {str(e)}"
        )
