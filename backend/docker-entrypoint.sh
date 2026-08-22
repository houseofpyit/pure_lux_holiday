#!/bin/sh
set -eu

echo "Running database migrations..."
i=0
until alembic upgrade head; do
  i=$((i + 1))
  if [ "$i" -ge 20 ]; then
    echo "Migrations failed after retries" >&2
    exit 1
  fi
  echo "Waiting for database... ($i)"
  sleep 2
done

if [ "${RUN_SEED:-true}" = "true" ]; then
  echo "Seeding database (admin, CMS content, packages)..."
  python scripts/seed.py
fi

WORKERS="${UVICORN_WORKERS:-2}"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers "$WORKERS"
