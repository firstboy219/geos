#!/usr/bin/env bash
# =============================================================================
# Geoscan — FASE 0: Audit Server (read-only / diagnostic)
# -----------------------------------------------------------------------------
# Membungkus perintah audit manual FASE 0 menjadi satu script convenience.
# TIDAK mengubah apa pun — hanya membaca kondisi server.
#
# Tujuan: pastikan tidak bentrok dengan container/network/port existing
# sebelum men-deploy Redis & backend Geoscan.
#
# CARA MENJALANKAN (via SSH ke server):
#   chmod +x audit_server.sh
#   ./audit_server.sh          # tambahkan sudo jika perlu untuk ss/nginx
#
# Yang dicek:
#   - docker ps -a, docker network ls, docker volume ls
#   - port 80/443/5432/5678/6379/8000 (harus: 6379 & 8000 KOSONG)
#   - resource: free -h, df -h, nproc
#   - daftar database PostgreSQL (container 'postgres', user 'admin')
#   - nginx sites-enabled & nginx -t
# =============================================================================

set -uo pipefail   # sengaja tanpa -e: audit harus tetap lanjut walau satu cek gagal

PG_CONTAINER="${PG_CONTAINER:-postgres}"
PG_SUPERUSER="${PG_SUPERUSER:-admin}"
PG_ADMIN_DB="${PG_ADMIN_DB:-saasdb}"

section() { echo; echo "============================================================"; echo " $*"; echo "============================================================"; }

section "1. Docker containers (docker ps -a)"
docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null \
  || echo "  [WARN] docker tidak tersedia / butuh sudo"

section "2. Docker networks (docker network ls)"
docker network ls 2>/dev/null || echo "  [WARN] gagal list networks"
echo "  Harapan: ada 'postgres_default' dan 'n8n_default'"

section "3. Docker volumes (docker volume ls)"
docker volume ls 2>/dev/null || echo "  [WARN] gagal list volumes"

section "4. Port usage (80 443 5432 5678 6379 8000)"
if command -v ss >/dev/null 2>&1; then
  ss -tlnp 2>/dev/null | grep -E ':(80|443|5432|5678|6379|8000)\b' || echo "  (tidak ada match)"
elif command -v netstat >/dev/null 2>&1; then
  netstat -tlnp 2>/dev/null | grep -E ':(80|443|5432|5678|6379|8000)\b' || echo "  (tidak ada match)"
else
  echo "  [WARN] ss/netstat tidak tersedia"
fi
echo "  >> Pastikan port 6379 (Redis) dan 8000 (backend) BELUM dipakai."

section "5. Resource (free -h / df -h / nproc)"
echo "--- RAM ---";   free -h 2>/dev/null || echo "  [WARN] free tidak tersedia"
echo "--- Disk ---";  df -h / 2>/dev/null || echo "  [WARN] df tidak tersedia"
echo "--- CPU ---";   echo "  vCPU: $(nproc 2>/dev/null || echo '?')"

section "6. PostgreSQL — daftar database (container '${PG_CONTAINER}')"
if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "${PG_CONTAINER}"; then
  docker exec -i "${PG_CONTAINER}" psql -U "${PG_SUPERUSER}" -d "${PG_ADMIN_DB}" -c '\l' 2>/dev/null \
    || echo "  [WARN] gagal query psql (cek user '${PG_SUPERUSER}')"
  echo "  >> Cek apakah database 'geoscan' sudah ada (akan dibuat oleh setup_db.sh)."
else
  echo "  [WARN] container '${PG_CONTAINER}' tidak running."
fi

section "7. Docker resource usage (docker stats --no-stream)"
docker stats --no-stream 2>/dev/null \
  || echo "  [WARN] gagal docker stats"

section "8. Nginx — sites-enabled & syntax test"
ls -1 /etc/nginx/sites-enabled/ 2>/dev/null || echo "  [WARN] tidak bisa baca sites-enabled (butuh sudo?)"
echo "--- nginx -t ---"
if command -v nginx >/dev/null 2>&1; then
  nginx -t 2>&1 || echo "  [INFO] nginx -t butuh sudo, atau ada cert error existing (lihat KB)."
else
  echo "  [WARN] nginx CLI tidak tersedia"
fi
echo "  >> Harapan: site 'apigeo.cosger.online' BELUM ada (akan dipasang manual)."

echo
echo "[audit] Selesai — audit read-only, tidak ada perubahan dilakukan."
