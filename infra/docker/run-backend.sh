#!/usr/bin/env bash
# =============================================================================
# Geoscan — Jalankan container geoscan-backend (FastAPI)
# -----------------------------------------------------------------------------
# Prasyarat:
#   - Image geoscan-backend:latest sudah di-build (Fase 3): lihat Makefile target backend-build
#   - /opt/geoscan/.env sudah ada (scripts/setup_db.sh)
#   - geoscan-redis sudah berjalan (scripts/setup_redis.sh)
#
# Networking (realitas server):
#   - postgres ada di network 'postgres_default'
#   - n8n ada di network 'n8n_default'
#   - Backend HARUS bisa: (a) reach postgres+redis  → join postgres_default
#                         (b) di-reach oleh n8n      → join n8n_default
#   Karena 1 container hanya bisa --network 1 saat 'docker run', kita run di
#   postgres_default lalu 'docker network connect' ke n8n_default.
#
# Port 8000 hanya di-bind ke 127.0.0.1 (Nginx yang expose ke publik via SSL).
# =============================================================================
set -euo pipefail

IMAGE="${IMAGE:-geoscan-backend:latest}"
NAME="${NAME:-geoscan-backend}"
NET_PRIMARY="${NET_PRIMARY:-postgres_default}"
NET_SECONDARY="${NET_SECONDARY:-n8n_default}"
ENV_FILE="${ENV_FILE:-/opt/geoscan/.env}"

log() { echo "[run-backend] $*"; }

[[ -f "${ENV_FILE}" ]] || { echo "[run-backend][ERROR] ${ENV_FILE} tidak ada. Jalankan scripts/setup_db.sh dulu."; exit 1; }

# Hapus container lama jika ada (idempotent re-deploy)
if docker ps -a --format '{{.Names}}' | grep -qx "${NAME}"; then
  log "Menghapus container lama '${NAME}'..."
  docker rm -f "${NAME}" >/dev/null
fi

log "Menjalankan '${NAME}' di network '${NET_PRIMARY}'..."
docker run -d \
  --name "${NAME}" \
  --network "${NET_PRIMARY}" \
  --restart unless-stopped \
  -p 127.0.0.1:8000:8000 \
  --env-file "${ENV_FILE}" \
  --add-host=host.docker.internal:host-gateway \
  -m 512m \
  "${IMAGE}"

# Sambungkan ke network n8n agar n8n bisa hit http://geoscan-backend:8000
log "Menyambungkan '${NAME}' ke network '${NET_SECONDARY}'..."
docker network connect "${NET_SECONDARY}" "${NAME}" 2>/dev/null \
  || log "(sudah tersambung ke ${NET_SECONDARY} atau network tidak ada)"

log "OK. Verifikasi:"
log "  docker logs -f ${NAME}"
log "  curl -s http://127.0.0.1:8000/health"
log "  docker exec n8n curl -s http://geoscan-backend:8000/health   # dari n8n"
