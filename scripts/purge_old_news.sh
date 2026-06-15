#!/usr/bin/env bash
# =============================================================================
# Geoscan — News retention purge (spec: delete news_articles > 4 months old).
# -----------------------------------------------------------------------------
# Age is counted from ingested_at (created date). Runs the purge directly inside
# the geoscan-backend container (no Celery/Redis needed). Idempotent + safe.
#
# Install as a host cron (on the server), e.g. daily 02:00 UTC:
#   0 2 * * * /opt/geoscan/scripts/purge_old_news.sh >> /var/log/geoscan-purge.log 2>&1
# =============================================================================
set -euo pipefail

CONTAINER="${CONTAINER:-geoscan-backend}"
MONTHS="${MONTHS:-4}"

echo "[purge_old_news] $(date -u +%FT%TZ) purging news older than ${MONTHS} months"
docker exec "${CONTAINER}" python -c \
  "import asyncio; from app.services.ai.pipeline import run_purge_old_news; print(asyncio.run(run_purge_old_news(${MONTHS})))"
