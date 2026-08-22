# Phase 2 Report — Database Foundation

## Status: ✔ Complete

---

## ✔ Folder Changes

### New Directories Created

```
backend/app/models/mixins/          # Reusable model mixins
backend/app/db/repositories/        # Base repository pattern
backend/app/db/utils/               # Database utility modules
backend/app/db/types/               # Custom SQLAlchemy types (prepared)
backend/app/utils/database/         # Database utility helpers (prepared)
backend/alembic/versions/           # Migration version files
backend/uploads/hero/               # Hero image uploads
backend/uploads/gallery/            # Gallery image uploads
backend/uploads/packages/           # Package image uploads
backend/uploads/articles/           # Article image uploads
backend/uploads/avatars/            # Avatar uploads
backend/uploads/general/            # General file uploads
```

### Modified Files

| File | Change |
|---|---|
| `app/db/base.py` | Added naming convention for constraints/indexes, `__repr__` method |
| `app/core/database.py` | Added connection pool configuration (pool_size=20, max_overflow=10, pool_timeout=30, pool_pre_ping=True), NullPool for tests |
| `app/models/__init__.py` | Added AdminUser and Media model imports |
| `app/constants/__init__.py` | Added enum imports |
| `app/constants/enums.py` | Created with UserRole, MediaType, PageStatus enums |
| `requirements.txt` | Added psycopg2-binary for Alembic synchronous mode |
| `tests/conftest.py` | Added database test fixtures (test_engine, test_session, db_connection_check) |
| `alembic/env.py` | Configured for synchronous migrations with naming convention support |

---

## ✔ Models Created

### AdminUser (`app/models/admin_user.py`)

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key, Indexed, Default: uuid4 |
| name | String(255) | NOT NULL |
| email | String(255) | NOT NULL, UNIQUE, Indexed |
| password_hash | String(255) | NOT NULL |
| role | String(50) | NOT NULL, Indexed, Default: "editor" |
| is_active | Boolean | NOT NULL, Default: true |
| last_login | DateTime(tz) | NULLABLE |
| created_at | DateTime(tz) | NOT NULL, Server Default: now() |
| updated_at | DateTime(tz) | NOT NULL, Server Default: now() |

### Media (`app/models/media.py`)

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key, Indexed, Default: uuid4 |
| filename | String(255) | NOT NULL, Indexed |
| original_name | String(255) | NOT NULL |
| file_url | String(1024) | NOT NULL |
| mime_type | String(127) | NOT NULL, Indexed |
| extension | String(20) | NOT NULL |
| size | BigInteger | NOT NULL |
| folder | String(255) | NULLABLE, Indexed |
| alt_text | Text | NULLABLE |
| media_type | String(20) | NOT NULL, Indexed, Default: "image" |
| width | Integer | NULLABLE |
| height | Integer | NULLABLE |
| duration | Float | NULLABLE |
| created_at | DateTime(tz) | NOT NULL, Server Default: now() |
| updated_at | DateTime(tz) | NOT NULL, Server Default: now() |

---

## ✔ Mixins Created

### UUIDMixin (`app/models/mixins/uuid_mixin.py`)
- UUID primary key column
- Server-side UUID generation via `uuid.uuid4()`
- PostgreSQL native UUID type for performance

### TimestampMixin (`app/models/mixins/timestamp_mixin.py`)
- `created_at` — set once on creation with `server_default=func.now()`
- `updated_at` — auto-updated via `onupdate` on every record change
- Both columns use timezone-aware `DateTime(timezone=True)`

### SoftDeleteMixin (`app/models/mixins/soft_delete_mixin.py`)
- `is_deleted` — Boolean flag with `server_default="false"`, indexed
- `deleted_at` — Nullable DateTime for deletion timestamp
- `soft_delete()` method for safe record removal

### AuditMixin (`app/models/mixins/audit_mixin.py`)
- `created_by` — Nullable UUID FK to `admin_users.id`, `ON DELETE SET NULL`
- `updated_by` — Nullable UUID FK to `admin_users.id`, `ON DELETE SET NULL`
- Both columns indexed for query performance

---

## ✔ Enums Created

All enums are defined in `app/constants/enums.py`:

### UserRole
```python
SUPER_ADMIN = "super_admin"
ADMIN       = "admin"
EDITOR      = "editor"
```

### MediaType
```python
IMAGE    = "image"
VIDEO    = "video"
DOCUMENT = "document"
```

### PageStatus
```python
ACTIVE    = "active"
INACTIVE  = "inactive"
DRAFT     = "draft"
PUBLISHED = "published"
```

---

## ✔ Repository Architecture

### BaseRepository (`app/db/repositories/base_repository.py`)

Generic async repository with the following methods:

| Method | Signature | Description |
|---|---|---|
| `get_by_id` | `(entity_id: UUID) -> ModelType \| None` | Retrieve by UUID primary key |
| `get_all` | `(skip, limit, filters) -> list[ModelType]` | Retrieve all with optional filters |
| `create` | `(**kwargs) -> ModelType` | Create and persist a new record |
| `update` | `(entity, **kwargs) -> ModelType` | Update an existing record |
| `delete` | `(entity) -> None` | Permanently delete a record |
| `exists` | `(**filters) -> bool` | Check if a record exists |
| `paginate` | `(page_params, filters, sort_params) -> PaginatedResult` | Paginated query with filters and sorting |
| `find_by_field` | `(field, value, unique) -> ModelType \| list \| None` | Find by exact field match |

Usage pattern:
```python
class AdminUserRepository(BaseRepository[AdminUser]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, AdminUser)
```

---

## ✔ Database Utilities

### Pagination (`app/db/utils/pagination.py`)
- `PaginationParams` — Pydantic model with `page` (default: 1) and `page_size` (default: 20, max: 100)
- `PaginatedResult` — Dataclass with items, total, page, page_size, total_pages + navigation helpers (`has_next`, `has_previous`, `next_page`, `previous_page`)
- `paginate()` — Async function that executes a count query + paginated select

### Filters (`app/db/utils/filters.py`)
- `FilterCondition` — Dataclass with `field`, `operator`, `value`
- `FilterParams` — Base Pydantic model for extension
- `build_filters()` — Builds SQLAlchemy filter expressions from conditions
- Supported operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `in_`, `not_in`, `is_null`, `is_not_null`

### Sorting (`app/db/utils/sorting.py`)
- `SortParams` — Pydantic model with `sort_by` (default: "created_at") and `sort_order` (asc/desc)
- `apply_sorting()` — Applies ORDER BY to a select statement
- Optional `allowed_fields` set for security validation

### QueryBuilder (`app/db/utils/query_builder.py`)
- Fluent interface combining filters, sorting, and pagination
- `with_filters()`, `with_sorting()`, `with_pagination()` chainable methods
- `execute()` — Runs the query and returns `PaginatedResult` or raw list
- `count()` — Returns total matching records count

---

## ✔ Alembic Configuration

### Configuration Details

- `alembic.ini` — Script location: `alembic/`, Post-write hook: Black formatter
- `alembic/env.py` — Synchronous engine for migrations, imports all models via `import app.models`
- `alembic/script.py.mako` — Custom migration template with type hints
- Naming conventions for constraints applied via `Base.metadata`

### Naming Convention
```python
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}
```

---

## ✔ Migration Status

### Migration File: `alembic/versions/0001_initial_migration.py`

| Action | Status |
|---|---|
| Autogenerate support | ✔ Configured (models imported in env.py) |
| Upgrade `admin_users` creation | ✔ 4 indexes + UUID PK + unique email |
| Upgrade `media` creation | ✔ 5 indexes + UUID PK |
| Downgrade | ✔ Drops both tables |
| Naming convention applied | ✔ All constraint names follow convention |

### Verification Commands

```bash
# Generate static SQL (no database needed)
alembic upgrade head --sql

# Apply migration (requires running PostgreSQL)
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Generate new autogenerated migration
alembic revision --autogenerate -m "description"

# View migration history
alembic history
```

---

## ✔ Test Configuration

### Test Database Fixtures (`tests/conftest.py`)

| Fixture | Scope | Description |
|---|---|---|
| `test_engine` | Session | Creates async engine with NullPool, creates/drops all tables |
| `test_session` | Function | Fresh session with transaction rollback after each test |
| `db_connection_check` | Function | Verifies database connectivity with `SELECT 1` |

### Database Tests (`tests/test_database_connection.py`)

| Test | Description |
|---|---|
| `test_database_connection` | Verifies connectivity by running `SELECT 1` |
| `test_session_creation` | Verifies async session can execute queries |
| `test_model_metadata_registered` | Verifies all models registered in `Base.metadata` |
| `test_table_creation` | Verifies tables exist in database schema |
| `test_admin_users_columns` | Verifies all expected columns exist |
| `test_media_columns` | Verifies all expected columns exist |
| `test_email_unique_constraint` | Verifies UNIQUE constraint on email column |

---

## ✔ Connection Pool Configuration

Applied in `app/core/database.py`:

```python
pool_config = {
    "pool_size": 20,        # Maximum persistent connections
    "max_overflow": 10,     # Additional connections beyond pool_size
    "pool_timeout": 30,     # Seconds to wait for a connection
    "pool_pre_ping": True,  # Verify connection before using
}
```

- Uses `AsyncAdaptedQueuePool` for production/development
- Uses `NullPool` (no pooling) for test environment
- Echo mode controlled by `settings.DEBUG`

---

## ✔ Upload Structure

```
uploads/
├── images/      # General image uploads
├── documents/   # Document uploads
├── temp/        # Temporary processing files
├── hero/        # Hero/banner images
├── gallery/     # Gallery images
├── packages/    # Package-related images
├── articles/    # Article images
├── avatars/     # User avatar images
└── general/     # General-purpose uploads
```

---

## Remaining Work (Future Phases)

- [ ] Domain-specific repositories (AdminUserRepository, MediaRepository)
- [ ] Service layer with business logic
- [ ] API endpoints and routers
- [ ] Authentication implementation (JWT verification, login, register)
- [ ] Authorization middleware and permission checks
- [ ] File upload API with cloud storage integration
- [ ] Caching layer with Redis integration
- [ ] Integration tests for database operations
- [ ] API documentation and examples

---

## End of Phase 2

**Do not proceed to Phase 3.** This report marks the completion of the database foundation phase. All subsequent phases (services, APIs, authentication, business logic) are to be implemented separately.

Phase 2 established:
- ✔ 4 reusable mixins (UUID, Timestamp, SoftDelete, Audit)
- ✔ 3 domain enums (UserRole, MediaType, PageStatus)
- ✔ 2 database models (AdminUser, Media)
- ✔ BaseRepository with generic CRUD
- ✔ Database utilities (pagination, filters, sorting, query builder)
- ✔ Alembic configuration with initial migration
- ✔ Connection pool configuration
- ✔ Database test configuration and connection tests
- ✔ Upload directory structure with sub-folders