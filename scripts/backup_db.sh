#!/usr/bin/env bash
# =============================================================================
# Geoscan — Database backup (recommended: host cron at 03:00 WIB / 20:00 UTC)
# -----------------------------------------------------------------------------
# Dumps the 'geoscan' db from the existing 'postgres' container, gzips it,
# keeps 7 days locally, and (optionally) uploads to remote storage via rclone.
#
# Install as a cron (on the server):
#   0 20 * * * /opt/geoscan/scripts/backup_db.sh >> /var/log/geoscan-backup.log 2>&1
# =============================================================================
set -euo pipefail

PG_CONTAINER="${PG_CONTAINER:-postgres}"
PG_SUPERUSER="${PG_SUPERUSER:-admin}"
DB_NAME="${DB_NAME:-geoscan}"
BACKUP_DIR="${BACKUP_DIR:-/opt/geoscan/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
RCLONE_REMOTE="${RCLONE_REMOTE:-}"   # e.g. "b2:geoscan-backups" — empty = skip upload

mkdir -p "${BACKUP_DIR}"
ts="$(date +%F_%H%M)"
file="${BACKUP_DIR}/geoscan-${ts}.sql.gz"

echo "[backup] dumping ${DB_NAME} from container ${PG_CONTAINER}..."
docker exec "${PG_CONTAINER}" pg_dump -U "${PG_SUPERUSER}" -d "${DB_NAME}" | gzip > "${file}"
size="$(du -h "${file}" | cut -f1)"
echo "[backup] wrote ${file} (${size})"

# Retention
find "${BACKUP_DIR}" -name 'geoscan-*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete
echo "[backup] pruned backups older than ${RETENTION_DAYS} days"

# Optional offsite upload
if [[ -n "${RCLONE_REMOTE}" ]] && command -v rclone >/dev/null 2>&1; then
  rclone copy "${file}" "${RCLONE_REMOTE}/" && echo "[backup] uploaded to ${RCLONE_REMOTE}"
fi

echo "BACKUP_OK ${file} ${size}"
