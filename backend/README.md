# Pure Luxe Holidays Backend

Enterprise-grade backend API for Pure Luxe Holidays, built with FastAPI and Python 3.13.

## Project Overview

This project follows Clean Architecture principles with a modular, scalable structure designed for enterprise applications. The backend provides a robust foundation for building luxury holiday management services.

## Folder Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/       # Route handlers
│   │   │   └── router.py        # v1 router aggregation
│   │   └── dependencies.py      # Shared API dependencies
│   │
│   ├── core/                    # Core configuration and utilities
│   │   ├── config.py            # Application settings
│   │   ├── security.py          # JWT and password utilities
│   │   ├── database.py          # Database engine and session
│   │   ├── logger.py            # Logging configuration
│   │   └── lifespan.py          # Application lifecycle
│   │
│   ├── models/                  # SQLAlchemy ORM models
│   ├── schemas/                 # Pydantic request/response schemas
│   ├── repositories/            # Data access layer
│   ├── services/                # Business logic layer
│   ├── middleware/               # Custom ASGI middleware
│   ├── dependencies/            # Domain-specific dependencies
│   ├── utils/                   # Helper utilities
│   ├── exceptions/              # Custom exception classes
│   ├── constants/               # Application constants
│   │
│   ├── db/
│   │   ├── base.py              # Declarative Base
│   │   ├── session.py           # Session management
│   │   └── seed/                # Database seeders
│   │
│   └── main.py                  # Application entry point
│
├── alembic/                     # Database migrations
├── tests/
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── conftest.py              # Shared test fixtures
│
├── uploads/                     # File uploads
│   ├── images/
│   ├── documents/
│   └── temp/
│
├── logs/                        # Application logs
├── scripts/                     # Utility scripts
├── docs/                        # Documentation
│
├── .env.example                 # Environment variables template
├── .gitignore
├── pyproject.toml               # Project configuration
├── requirements.txt             # Runtime dependencies
├── requirements-dev.txt         # Development dependencies
├── README.md
└── Dockerfile
```

## Prerequisites

- Python 3.13 or higher
- PostgreSQL 16+
- Redis 7+ (optional, for caching)

## Virtual Environment Setup

### Windows

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your local configuration:
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Set `SECRET_KEY` to a secure random value
   - Configure `ALLOWED_ORIGINS` for CORS

## Running the Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000/api/v1
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=term-missing

# Run specific test categories
pytest tests/unit/
pytest tests/integration/
```

## Code Quality

### Linting

```bash
# Ruff linting
ruff check app/ tests/

# Ruff auto-fix
ruff check --fix app/ tests/
```

### Formatting

```bash
# Black formatting
black app/ tests/

# isort import sorting
isort app/ tests/
```

### Type Checking

```bash
mypy app/
```

### Pre-commit Hooks

```bash
# Install pre-commit hooks
pre-commit install

# Run pre-commit on all files
pre-commit run --all-files
```

## Docker

### Build

```bash
docker build -t pure-luxe-holidays-backend .
```

### Run

```bash
docker run -p 8000:8000 --env-file .env pure-luxe-holidays-backend
```

## Architecture Decisions

- **Clean Architecture**: Separation of concerns with distinct layers (API, Service, Repository, Model)
- **Async-First**: Fully asynchronous with asyncpg and SQLAlchemy async support
- **Configuration Management**: Pydantic Settings for type-safe environment variable handling
- **Logging**: Loguru for structured, performant logging with rotation and compression
- **Security**: JWT-based authentication with bcrypt password hashing (ready for implementation)
- **API Versioning**: URL-based versioning (/api/v1) for backward compatibility
- **Dependency Injection**: FastAPI's built-in DI system for clean, testable code