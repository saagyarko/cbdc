# CBDC FinTrust Backend

This is the backend for the CBDC FinTrust project, built with FastAPI.

## Project Structure

- `app/`: Main application folder.
  - `api/`: API endpoint definitions.
    - `v1/`: Version 1 of the API.
  - `core/`: Application configuration and settings.
  - `db/`: Database session management.
  - `models/`: Database models (e.g., SQLAlchemy models).
  - `schemas/`: Pydantic schemas for data validation.
  - `services/`: Business logic.
- `requirements.txt`: Python dependencies.
- `main.py`: FastAPI application entry point.

## Local Development Setup

### Prerequisites

- Python 3.8+
- An active Python virtual environment (recommended).

### Installation

1.  **Clone the repository (if you haven't already).**

2.  **Navigate to the backend directory:**
    ```sh
    cd cbdc-backend
    ```

3.  **Create and activate a virtual environment:**
    ```sh
    python3 -m venv venv
    source venv/bin/activate
    ```
    On Windows, use `venv\Scripts\activate`.

4.  **Install the required packages:**
    ```sh
    pip install -r requirements.txt
    ```

5.  **Set up environment variables:**
    Create a `.env` file in the `cbdc-backend` directory by copying the (currently non-existent) `.env.example`.
    ```sh
    # cp .env.example .env
    ```
    You will need to create the `.env` file manually and add the following, replacing the placeholders with your actual credentials. **Do not commit this file to version control.**

    ```
    # Postgres Database
    POSTGRES_SERVER=localhost
    POSTGRES_USER=your_db_user
    POSTGRES_PASSWORD=your_db_password
    POSTGRES_DB=fintrust

    # Mongo Database
    MONGO_URI="mongodb://localhost:27017/"
    MONGO_DB_NAME="fintrust"

    # AWS
    AWS_REGION=us-east-1
    AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
    ```
    **Note:** The application's configuration in `app/core/config.py` is currently hardcoded for simplicity. For a real application, you should implement loading these values from the `.env` file.

### Running the Application

Once the dependencies are installed and your environment is configured, you can run the application using `uvicorn`.

```sh
uvicorn app.main:app --reload
```

The `--reload` flag makes the server restart after code changes.

The API will be available at `http://127.0.0.1:8000`.

### API Documentation

Once the server is running, you can access the interactive API documentation (powered by Swagger UI) at:

`http://127.0.0.1:8000/docs`

And the alternative documentation (ReDoc) at:

`http://127.0.0.1:8000/redoc` 