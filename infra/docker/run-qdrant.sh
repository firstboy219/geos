#!/usr/bin/env bash
# =============================================================================
# Geoscan — Jalankan container geoscan-qdrant (self-hosted vector DB)
# Pengganti Pinecone (tanpa akun SaaS). Join postgres_default, internal only.
# =============================================================================
set -euo pipefail

NAME="${NAME:-geoscan-qdrant}"
NET="${NET:-postgres_default}"
IMAGE="${IMAGE:-qdrant/qdrant:latest}"

log() { echo "[run-qdrant] $*"; }

if docker ps -a --format '{{.Names}}' | grep -qx "${NAME}"; then
  log "Menghapus container lama '${NAME}'..."
  docker rm -f "${NAME}" >/dev/null
fi

log "Menjalankan '${NAME}' di network '${NET}' (port internal 6333, no host expose)..."
docker run -d \
  --name "${NAME}" \
  --network "${NET}" \
  --restart unless-stopped \
  -m 384m \
  -v geoscan-qdrant-data:/qdrant/storage \
  "${IMAGE}"

log "OK. Verifikasi: docker exec ${NAME} sh -c 'wget -qO- http://localhost:6333/ 2>/dev/null | head -c 80' "
