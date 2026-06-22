#!/usr/bin/env sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
API_DIR="$ROOT_DIR/apps/api"

cd "$API_DIR"
exec ./.venv/bin/python -m uvicorn app.main:app --reload --host "${API_HOST:-127.0.0.1}" --port "${API_PORT:-8000}"