#!/usr/bin/env bash
# =============================================================================
# Geoscan — FASE 0-A: Setup Database di PostgreSQL Existing
# -----------------------------------------------------------------------------
# Script ini membuat database `geoscan` + user `geoscan_user` di dalam
# container PostgreSQL yang SUDAH berjalan (container name: postgres),
# lalu men-generate file /opt/geoscan/.env lengkap (KB section 3.4).
#
# REALITAS SERVER (server_knowledge_base):
#   - Container Postgres : postgres  (image postgres:16-alpine)
#   - Superuser          : admin
#   - Default DB         : saasdb
#   - Docker network     : postgres_default
#   - geoscan-redis / geoscan-backend / geoscan-celery join postgres_default
#   - geoscan-backend juga join n8n_default agar n8n bisa hit
#     http://geoscan-backend:8000
#
# CARA MENJALANKAN (via SSH ke server, sebagai root/sudo):
#   chmod +x setup_db.sh
#   sudo ./setup_db.sh
#
# Idempotent: aman dijalankan berulang. DB/user yang sudah ada tidak dibuat ulang.
# Password DB di-generate sekali; jika .env sudah ada, password lama dipertahankan.
#
# CARA VERIFIKASI:
#   docker exec postgres psql -U admin -d saasdb -c '\l'   # lihat db geoscan
#   docker exec postgres psql -U geoscan_user -d geoscan -c 'SELECT 1;'
#   cat /opt/geoscan/.env
# =============================================================================

set -euo pipefail

# ── Konfigurasi (boleh override via environment) ──────────────────────────────
PG_CONTAINER="${PG_CONTAINER:-postgres}"          # nama container PostgreSQL existing
PG_SUPERUSER="${PG_SUPERUSER:-admin}"             # superuser existing
PG_ADMIN_DB="${PG_ADMIN_DB:-saasdb}"              # db default untuk koneksi admin
DB_NAME="${DB_NAME:-geoscan}"
DB_USER="${DB_USER:-geoscan_user}"
ENV_DIR="${ENV_DIR:-/opt/geoscan}"
ENV_FILE="${ENV_FILE:-${ENV_DIR}/.env}"

# ── Helper logging ────────────────────────────────────────────────────────────
log()  { echo -e "[setup_db] $*"; }
err()  { echo -e "[setup_db][ERROR] $*" >&2; }

# psql helper: jalankan SQL sebagai superuser di dalam container
psql_admin() {
  docker exec -i "${PG_CONTAINER}" psql -v ON_ERROR_STOP=1 -U "${PG_SUPERUSER}" -d "${PG_ADMIN_DB}" "$@"
}

# ── Pre-flight checks ─────────────────────────────────────────────────────────
log "Pre-flight: memeriksa container '${PG_CONTAINER}'..."
if ! command -v docker >/dev/null 2>&1; then
  err "docker tidak ditemukan. Pastikan dijalankan di server."
  exit 1
fi
if ! docker ps --format '{{.Names}}' | grep -qx "${PG_CONTAINER}"; then
  err "Container '${PG_CONTAINER}' tidak running. Cek dengan: docker ps"
  exit 1
fi
log "OK — container PostgreSQL '${PG_CONTAINER}' running."

# ── Password DB: pertahankan jika .env sudah punya, kalau tidak generate baru ──
EXISTING_PW=""
if [[ -f "${ENV_FILE}" ]]; then
  EXISTING_PW="$(grep -E '^DB_PASSWORD=' "${ENV_FILE}" 2>/dev/null | head -n1 | cut -d= -f2- || true)"
fi
if [[ -n "${EXISTING_PW}" ]]; then
  DB_PASSWORD="${EXISTING_PW}"
  log "Memakai DB_PASSWORD yang sudah ada di ${ENV_FILE}."
else
  DB_PASSWORD="$(openssl rand -hex 24)"   # 48 hex char — kuat
  log "DB_PASSWORD baru di-generate."
fi

# ── Buat USER (idempotent) ────────────────────────────────────────────────────
log "Membuat/memperbarui user '${DB_USER}'..."
USER_EXISTS="$(psql_admin -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}';" || true)"
if [[ "${USER_EXISTS}" == "1" ]]; then
  log "User '${DB_USER}' sudah ada — set ulang password agar match .env."
  psql_admin -c "ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';" >/dev/null
else
  psql_admin -c "CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';" >/dev/null
  log "User '${DB_USER}' dibuat."
fi

# ── Buat DATABASE (idempotent — CREATE DATABASE tidak bisa di transaction) ─────
log "Membuat database '${DB_NAME}'..."
DB_EXISTS="$(psql_admin -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}';" || true)"
if [[ "${DB_EXISTS}" == "1" ]]; then
  log "Database '${DB_NAME}' sudah ada — lewati pembuatan."
else
  psql_admin -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" >/dev/null
  log "Database '${DB_NAME}' dibuat (owner: ${DB_USER})."
fi

# ── Grant privileges ──────────────────────────────────────────────────────────
log "Memberikan privileges ke '${DB_USER}' pada '${DB_NAME}'..."
psql_admin -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" >/dev/null
# Schema public grants (PostgreSQL 15+: public schema tidak default-writable)
docker exec -i "${PG_CONTAINER}" psql -v ON_ERROR_STOP=1 -U "${PG_SUPERUSER}" -d "${DB_NAME}" <<SQL >/dev/null
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER SCHEMA public OWNER TO ${DB_USER};
SQL
log "Privileges di-set."

# ── Verifikasi koneksi sebagai user baru ──────────────────────────────────────
log "Verifikasi koneksi sebagai '${DB_USER}'..."
if docker exec -e PGPASSWORD="${DB_PASSWORD}" -i "${PG_CONTAINER}" \
     psql -U "${DB_USER}" -d "${DB_NAME}" -tAc "SELECT 'connection_ok';" | grep -q connection_ok; then
  log "OK — koneksi database berhasil."
else
  err "Koneksi sebagai '${DB_USER}' GAGAL."
  exit 1
fi

# ── Generate / update .env ────────────────────────────────────────────────────
log "Menulis ${ENV_FILE}..."
mkdir -p "${ENV_DIR}"

# Secrets: pertahankan dari .env lama jika ada, kalau tidak generate
read_or_gen() {  # $1 = key, $2 = generator command
  local key="$1" gen="$2" cur=""
  if [[ -f "${ENV_FILE}" ]]; then
    cur="$(grep -E "^${key}=" "${ENV_FILE}" 2>/dev/null | head -n1 | cut -d= -f2- || true)"
  fi
  if [[ -n "${cur}" ]]; then echo "${cur}"; else eval "${gen}"; fi
}
SECRET_KEY="$(read_or_gen SECRET_KEY 'openssl rand -hex 32')"        # 64 hex char
INTERNAL_API_KEY="$(read_or_gen INTERNAL_API_KEY 'openssl rand -hex 16')"  # 32 hex char

# DATABASE_URL pakai asyncpg + host = nama container 'postgres' (bukan localhost),
# karena backend & celery berada di network postgres_default.
DATABASE_URL="postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@${PG_CONTAINER}:5432/${DB_NAME}"

cat > "${ENV_FILE}" <<ENV
# =============================================================================
# Geoscan .env — generated by scripts/setup_db.sh
# Lokasi: ${ENV_FILE}  (JANGAN commit ke git)
# =============================================================================

# ── Database (host = nama container 'postgres' di network postgres_default) ──
DATABASE_URL=${DATABASE_URL}
DB_HOST=${PG_CONTAINER}
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# ── Security ──
SECRET_KEY=${SECRET_KEY}
INTERNAL_API_KEY=${INTERNAL_API_KEY}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# ── Redis (resolve via nama container di network postgres_default) ──
REDIS_URL=redis://geoscan-redis:6379/0

# ── n8n (geoscan-backend join n8n_default → n8n hit via http://geoscan-backend:8000) ──
N8N_WEBHOOK_URL=http://n8n:5678

# ── AI (placeholder — isi manual) — Google Gemini ──
GEMINI_API_KEY=REPLACE_ME
GEMINI_MODEL_ANALYSIS=gemini-2.0-flash
GEMINI_MODEL_EMBEDDING=gemini-embedding-001
PINECONE_API_KEY=pcsk_REPLACE_ME
PINECONE_INDEX_NAME=geoscan-historical
PINECONE_DIMENSION=1536

# ── External APIs (via n8n credentials — bukan di sini) ──
# NEWS_API_KEY → set di n8n credentials

# ── Firebase (placeholder) ──
FIREBASE_CREDENTIALS_JSON=/app/firebase-service-account.json

# ── Stripe (placeholder — test mode) ──
STRIPE_SECRET_KEY=sk_test_REPLACE_ME
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_ME
STRIPE_PRO_PRICE_ID=price_REPLACE_ME

# ── CORS ──
ALLOWED_ORIGINS=http://localhost:3000,https://apigeo.cosger.online

# ── Monitoring (placeholder) ──
SENTRY_DSN=https://REPLACE_ME@sentry.io/0

# ── Celery ──
CELERY_BROKER_URL=redis://geoscan-redis:6379/0
CELERY_RESULT_BACKEND=redis://geoscan-redis:6379/1
CELERY_TASK_QUEUE=geoscan
ENV

chmod 600 "${ENV_FILE}"
log "OK — ${ENV_FILE} ditulis (chmod 600)."

# ── Ringkasan ─────────────────────────────────────────────────────────────────
cat <<SUMMARY

============================================================
 RINGKASAN SETUP DATABASE GEOSCAN
============================================================
 Container PostgreSQL : ${PG_CONTAINER}
 Database             : ${DB_NAME}
 User                 : ${DB_USER}
 DB_HOST (in-network) : ${PG_CONTAINER}:5432
 DATABASE_URL         : postgresql+asyncpg://${DB_USER}:***@${PG_CONTAINER}:5432/${DB_NAME}
 .env path            : ${ENV_FILE} (chmod 600)
 SECRET_KEY           : (64 hex)  ${SECRET_KEY:0:8}...
 INTERNAL_API_KEY     : (32 hex)  ${INTERNAL_API_KEY:0:8}...
------------------------------------------------------------
 LANGKAH MANUAL BERIKUTNYA:
  1) Isi placeholder GEMINI/PINECONE/STRIPE/FIREBASE/SENTRY di ${ENV_FILE}
  2) Jalankan scripts/setup_redis.sh
  3) (Fase 3) build image geoscan-backend:latest
  4) Jalankan infra/docker/run-backend.sh & run-celery.sh
  5) Pasang nginx infra/nginx/apigeo.cosger.online.conf + certbot
============================================================
SUMMARY
log "Selesai."
