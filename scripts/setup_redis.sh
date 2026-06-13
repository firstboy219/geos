#!/usr/bin/env bash
# =============================================================================
# Geoscan — FASE 0-B: Tambah Redis Container (geoscan-redis)
# -----------------------------------------------------------------------------
# Membuat container Redis baru dan join ke Docker network EXISTING
# 'postgres_default' (network yang sama dengan PostgreSQL), sehingga
# geoscan-backend & geoscan-celery bisa resolve hostname 'geoscan-redis'.
#
# Ketentuan (KB 3.3 / Prompt 0-B):
#   - Image           : redis:7-alpine
#   - Container name   : geoscan-redis
#   - Network          : postgres_default (TIDAK expose port ke host)
#   - Restart policy   : unless-stopped
#   - Memory limit     : -m 128m
#   - Volume persist   : geoscan-redis-data:/data
#   - Redis config     : --maxmemory 100mb --maxmemory-policy allkeys-lru
#
# CARA MENJALANKAN (via SSH ke server):
#   chmod +x setup_redis.sh
#   sudo ./setup_redis.sh
#
# Idempotent: jika container sudah ada & running, script tidak membuat ulang.
#
# CARA VERIFIKASI (lihat bagian akhir output script):
#   docker ps | grep geoscan-redis
#   docker exec geoscan-redis redis-cli ping            # -> PONG
#   docker run --rm --network postgres_default redis:7-alpine \
#     redis-cli -h geoscan-redis ping                    # test dari container lain
# =============================================================================

set -euo pipefail

# ── Konfigurasi ───────────────────────────────────────────────────────────────
REDIS_NAME="${REDIS_NAME:-geoscan-redis}"
REDIS_IMAGE="${REDIS_IMAGE:-redis:7-alpine}"
NETWORK="${NETWORK:-postgres_default}"
VOLUME="${VOLUME:-geoscan-redis-data}"
MEM_LIMIT="${MEM_LIMIT:-128m}"
MAXMEMORY="${MAXMEMORY:-100mb}"
MAXMEMORY_POLICY="${MAXMEMORY_POLICY:-allkeys-lru}"

log() { echo -e "[setup_redis] $*"; }
err() { echo -e "[setup_redis][ERROR] $*" >&2; }

# ── Pre-flight ────────────────────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  err "docker tidak ditemukan. Jalankan di server."
  exit 1
fi
if ! docker network ls --format '{{.Name}}' | grep -qx "${NETWORK}"; then
  err "Network '${NETWORK}' tidak ada. Cek: docker network ls"
  exit 1
fi
log "OK — network '${NETWORK}' ditemukan."

# ── Idempotensi ───────────────────────────────────────────────────────────────
if docker ps --format '{{.Names}}' | grep -qx "${REDIS_NAME}"; then
  log "Container '${REDIS_NAME}' sudah running — lewati pembuatan."
elif docker ps -a --format '{{.Names}}' | grep -qx "${REDIS_NAME}"; then
  log "Container '${REDIS_NAME}' ada tapi berhenti — start ulang."
  docker start "${REDIS_NAME}" >/dev/null
else
  log "Membuat volume '${VOLUME}' (jika belum ada)..."
  docker volume create "${VOLUME}" >/dev/null

  log "Menjalankan container '${REDIS_NAME}'..."
  docker run -d \
    --name "${REDIS_NAME}" \
    --network "${NETWORK}" \
    --restart unless-stopped \
    -m "${MEM_LIMIT}" \
    -v "${VOLUME}:/data" \
    "${REDIS_IMAGE}" \
    redis-server --maxmemory "${MAXMEMORY}" --maxmemory-policy "${MAXMEMORY_POLICY}" \
                 --appendonly yes
  log "Container '${REDIS_NAME}' dibuat (NO port expose ke host)."
fi

# ── Verifikasi: ping lokal ────────────────────────────────────────────────────
log "Verifikasi: redis-cli ping..."
if docker exec "${REDIS_NAME}" redis-cli ping | grep -q PONG; then
  log "OK — ${REDIS_NAME} menjawab PONG."
else
  err "Redis tidak menjawab PONG."
  exit 1
fi

# ── Verifikasi: dari container lain di network yang sama ──────────────────────
log "Verifikasi: ping dari container ephemeral di network '${NETWORK}'..."
if docker run --rm --network "${NETWORK}" "${REDIS_IMAGE}" \
     redis-cli -h "${REDIS_NAME}" ping | grep -q PONG; then
  log "OK — ${REDIS_NAME} reachable sebagai hostname dari network '${NETWORK}'."
else
  err "Tidak bisa reach ${REDIS_NAME} dari network '${NETWORK}'."
  exit 1
fi

# ── Ringkasan ─────────────────────────────────────────────────────────────────
cat <<SUMMARY

============================================================
 RINGKASAN SETUP REDIS GEOSCAN
============================================================
 Container   : ${REDIS_NAME}
 Image       : ${REDIS_IMAGE}
 Network     : ${NETWORK}  (internal only, no host port)
 Memory      : -m ${MEM_LIMIT} | maxmemory ${MAXMEMORY} (${MAXMEMORY_POLICY})
 Volume      : ${VOLUME} -> /data
 REDIS_URL   : redis://${REDIS_NAME}:6379/0
------------------------------------------------------------
 REDIS_URL / CELERY_BROKER_URL sudah di-set otomatis oleh
 setup_db.sh di /opt/geoscan/.env.
============================================================
SUMMARY
log "Selesai."
