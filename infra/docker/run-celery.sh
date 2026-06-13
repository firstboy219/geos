#!/usr/bin/env bash
# =============================================================================
# Geoscan — Jalankan container geoscan-celery (Celery worker)
# -----------------------------------------------------------------------------
# Image sama dengan backend (geoscan-backend:latest), hanya command berbeda.
# WAJIB concurrency=1 (-c 1) — server 2 vCPU / 3.7GB RAM. JANGAN diubah.
# Worker hanya perlu reach postgres + redis → cukup join postgres_default.
# =============================================================================
set -euo pipefail

IMAGE="${IMAGE:-geoscan-backend:latest}"
NAME="${NAME:-geoscan-celery}"
NET_PRIMARY="${NET_PRIMARY:-postgres_default}"
ENV_FILE="${ENV_FILE:-/opt/geoscan/.env}"

log() { echo "[run-celery] $*"; }

[[ -f "${ENV_FILE}" ]] || { echo "[run-celery][ERROR] ${ENV_FILE} tidak ada. Jalankan scripts/setup_db.sh dulu."; exit 1; }

if docker ps -a --format '{{.Names}}' | grep -qx "${NAME}"; then
  log "Menghapus container lama '${NAME}'..."
  docker rm -f "${NAME}" >/dev/null
fi

log "Menjalankan '${NAME}' (concurrency=1, queue=geoscan)..."
docker run -d \
  --name "${NAME}" \
  --network "${NET_PRIMARY}" \
  --restart unless-stopped \
  --env-file "${ENV_FILE}" \
  --add-host=host.docker.internal:host-gateway \
  -m 400m \
  "${IMAGE}" \
  celery -A app.celery_app worker -c 1 -Q geoscan -l info

log "OK. Verifikasi:"
log "  docker logs -f ${NAME}"
log "  docker stats --no-stream ${NAME}   # pastikan < 400MB"
