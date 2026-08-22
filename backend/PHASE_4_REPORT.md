# Phase 4 Report — Media Library Module

## Status: ✔ Complete

---

## ✔ Folder Changes

### New Directories Created

```
backend/app/storage/                  # Storage provider abstraction
backend/app/utils/media/              # Media utility modules
```

### New Files

| File | Purpose |
|---|---|
| `app/storage/__init__.py` | Storage module init |
| `app/storage/base.py` | Abstract `StorageProvider` interface |
| `app/storage/local.py` | Local filesystem storage provider |
| `app/storage/factory.py` | Storage provider factory (singleton) |
| `app/utils/media/__init__.py` | Media utilities init |
| `app/utils/media/file_validator.py` | File extension, MIME, and size validation |
| `app/utils/media/image_processor.py` | Image dimension extraction, blurhash/thumbnail placeholders |
| `app/schemas/media.py` | 9 Pydantic schemas for media operations |
| `app/repositories/media_repository.py` | Media-specific repository with search and soft delete |
| `app/services/media_service.py` | Full media management business logic |
| `app/exceptions/media_exceptions.py` | 3 custom HTTP exceptions |
| `app/api/v1/endpoints/media.py` | 10 media management endpoints |

### Modified Files

| File | Change |
|---|---|
| `app/api/v1/router.py` | Added `media_router` to v1 routes |
| `app/models/media.py` | Added `SoftDeleteMixin` inheritance |
| `requirements.txt` | Added `Pillow==11.1.0` |

---

## ✔ Storage Architecture

### Storage Provider Interface (`app/storage/base.py`)

```python
class StorageProvider(ABC):
    async save_file(file, file_path, content_type) -> str
    async delete_file(file_path) -> bool
    async move_file(source_path, dest_path) -> bool
    async file_exists(file_path) -> bool
    async generate_url(file_path) -> str
    async generate_thumbnail(file_path) -> str | None
```

### Local Storage Provider (`app/storage/local.py`)

- Files stored under `UPLOAD_DIR` from settings (default: `./uploads/`)
- Auto-creates directory structure
- Automatic empty parent directory cleanup after deletion

### Factory Pattern (`app/storage/factory.py`)

- Singleton pattern via `get_storage_provider()`
- Currently returns `LocalStorageProvider`
- Future: switch to S3/MinIO/Cloudinary by changing one line

---

## ✔ Repository Layer

### MediaRepository (`app/repositories/media_repository.py`)

Extends `BaseRepository[Media]` with:

| Method | Description |
|---|---|
| `get_by_id(entity_id)` | Inherited — get by UUID |
| `create(**kwargs)` | Inherited — create record |
| `update(entity, **kwargs)` | Inherited — update record |
| `paginate(page_params, filters, sort)` | Inherited — paginated query |
| `search(query, page_params)` | ILIKE search on filename, original_name, alt_text |
| `find_by_folder(folder)` | List media in a folder |
| `get_by_media_type(media_type)` | List media by type |
| `soft_delete_by_id(media_id)` | Mark as deleted with timestamp |
| `restore_by_id(media_id)` | Unmark deleted |

---

## ✔ Service Layer

### MediaService (`app/services/media_service.py`)

| Method | Description |
|---|---|
| `upload(file, folder, alt_text)` | Validate, process, store, and save metadata |
| `get_by_id(media_id)` | Get single media item |
| `list_media(params, filters, search)` | Filtered, paginated listing |
| `update_alt_text(media_id, alt_text)` | Update accessibility text |
| `move_media(media_id, target_folder)` | Move file on disk + update DB |
| `rename_media(media_id, new_name)` | Rename file on disk + update DB |
| `soft_delete(media_id)` | Mark as deleted |
| `restore(media_id)` | Restore from soft delete |
| `bulk_delete(ids)` | Batch soft delete |
| `bulk_restore(ids)` | Batch restore |

---

## ✔ API Endpoints

| Method | Path | Auth | Permission | Summary |
|---|---|---|---|---|
| GET | `/api/v1/media` | Bearer | Active User | List/filter/search media |
| GET | `/api/v1/media/{id}` | Bearer | Active User | Get single media |
| POST | `/api/v1/media/upload` | Bearer | EDITOR+ | Upload file |
| PATCH | `/api/v1/media/{id}` | Bearer | EDITOR+ | Update alt text |
| PATCH | `/api/v1/media/{id}/move` | Bearer | EDITOR+ | Move to folder |
| PATCH | `/api/v1/media/{id}/rename` | Bearer | EDITOR+ | Rename file |
| DELETE | `/api/v1/media/{id}` | Bearer | ADMIN+ | Soft delete |
| POST | `/api/v1/media/{id}/restore` | Bearer | ADMIN+ | Restore |
| POST | `/api/v1/media/bulk-delete` | Bearer | ADMIN+ | Bulk soft delete |
| POST | `/api/v1/media/bulk-restore` | Bearer | ADMIN+ | Bulk restore |

---

## ✔ Upload Flow

```
Client → POST /api/v1/media/upload (multipart/form-data)
         │
         ├─📁 Folder validation (allowed: hero, gallery, packages, etc.)
         ├─🔍 FileValidator.validate()
         │   ├─ Extension check (.jpg, .png, .pdf, .mp4, etc.)
         │   ├─ MIME type validation
         │   └─ Size check (10MB image, 200MB video, 25MB doc)
         │
         ├─📖 Read file bytes
         ├─🏷️ Generate unique filename: {sanitized_name}_{uuid4}{ext}
         ├─💾 StorageProvider.save_file()
         │   └─ Local: saves to uploads/{folder}/{filename}
         │
         ├─🖼️ ImageProcessor.extract_metadata()
         │   ├─ Opens with Pillow
         │   └─ Returns (width, height) or (None, None)
         │
         └─🗄️ MediaRepository.create()
              └─ Persists metadata to database
```

---

## ✔ Validation Rules

### Allowed File Types

| Category | Extensions | MIME Types | Max Size |
|---|---|---|---|
| Images | .jpg, .jpeg, .png, .webp, .svg, .gif | image/jpeg, image/png, image/webp, image/svg+xml, image/gif | 10 MB |
| Videos | .mp4, .mov | video/mp4, video/quicktime | 200 MB |
| Documents | .pdf | application/pdf | 25 MB |

### Allowed Folders

`hero`, `gallery`, `packages`, `articles`, `avatars`, `general`

### Filename Sanitization

- Original name truncated to 50 chars
- Appended with UUID hex for uniqueness
- Only alphanumeric, dots, underscores, hyphens, and spaces allowed

---

## ✔ Permission Matrix

| Operation | SUPER_ADMIN | ADMIN | EDITOR |
|---|---|---|---|
| List media | ✅ | ✅ | ✅ |
| View media | ✅ | ✅ | ✅ |
| Upload | ✅ | ✅ | ✅ |
| Update alt text | ✅ | ✅ | ✅ |
| Move folder | ✅ | ✅ | ✅ |
| Rename | ✅ | ✅ | ✅ |
| Soft delete | ✅ | ✅ | ❌ |
| Restore | ✅ | ✅ | ❌ |
| Bulk delete | ✅ | ✅ | ❌ |
| Bulk restore | ✅ | ✅ | ❌ |

---

## ✔ Application Verification

```
✅ Application loaded successfully
Total routes: 22

Media routes:
  /api/v1/media                          GET    List media
  /api/v1/media/upload                   POST   Upload file
  /api/v1/media/bulk-delete              POST   Bulk delete
  /api/v1/media/bulk-restore             POST   Bulk restore
  /api/v1/media/{media_id}               GET    Get media
  /api/v1/media/{media_id}               PATCH  Update alt text
  /api/v1/media/{media_id}               DELETE Soft delete
  /api/v1/media/{media_id}/move          PATCH  Move to folder
  /api/v1/media/{media_id}/rename        PATCH  Rename file
  /api/v1/media/{media_id}/restore       POST   Restore
```

---

## ✔ Remaining Work (Future Phases)

- [ ] Integration tests for media with real database
- [ ] Cloud storage providers (S3, MinIO, Cloudinary)
- [ ] Thumbnail generation with cached sizes
- [ ] Blurhash placeholder generation
- [ ] Image optimization (compression, resizing)
- [ ] Video metadata extraction (duration, codec, etc.)
- [ ] CDN integration for file serving
- [ ] Rate limiting on upload endpoints
- [ ] File scanning for security (virus/malware)

---

## End of Phase 4

**Do not proceed to Phase 5.** This report marks the completion of the Media Library module. All subsequent phases (CMS modules, business features, etc.) are to be implemented separately.

Phase 4 established:
- ✔ Storage abstraction layer with interface + local implementation
- ✔ File validation (extension, MIME type, size limits)
- ✔ Image metadata extraction via Pillow
- ✔ Blurhash and thumbnail placeholder interfaces
- ✔ Media repository with search, filter, soft delete
- ✔ Media service with full CRUD + bulk operations
- ✔ 10 media management API endpoints
- ✔ RBAC enforcement (EDITOR can upload/manage, ADMIN can delete/restore)
- ✔ Unique filename generation with sanitization
- ✔ Automatic folder organization