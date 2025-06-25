from pydantic import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "CBDC FinTrust Backend"

    # In a real application, these should be loaded from a secure source like environment variables
    # For example: POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER")
    POSTGRES_SERVER: str = "localhost:5433"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "app"
    DATABASE_URL: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"

    MONGO_URI: str = "mongodb://localhost:27017/"
    MONGO_DB_NAME: str = "fintrust"

    # AWS Credentials
    AWS_REGION: str = "us-east-1"
    # It's highly recommended to use IAM roles for AWS authentication in production
    # and environment variables for local development.
    AWS_ACCESS_KEY_ID: str = "YOUR_AWS_ACCESS_KEY_ID"
    AWS_SECRET_ACCESS_KEY: str = "YOUR_AWS_SECRET_ACCESS_KEY"

    # Cognito Config
    COGNITO_REGION: str = "us-east-1"
    COGNITO_USERPOOL_ID: str = "your_userpool_id"
    COGNITO_APP_CLIENT_ID: str = "your_app_client_id"
    COGNITO_JWKS_URL: str = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USERPOOL_ID}/.well-known/jwks.json"

    class Config:
        case_sensitive = True

settings = Settings() 