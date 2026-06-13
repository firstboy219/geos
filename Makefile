# Geoscan — convenience targets. Most run ON THE SERVER via SSH.
.PHONY: help audit db-setup redis-setup backend-build backend-run celery-run nginx-install

help:
	@echo "Geoscan make targets:"
	@echo "  make audit         - run read-only server audit (scripts/audit_server.sh)"
	@echo "  make db-setup      - create geoscan db/user + generate /opt/geoscan/.env"
	@echo "  make redis-setup   - start geoscan-redis container"
	@echo "  make backend-build - build geoscan-backend:latest image (Phase 3)"
	@echo "  make backend-run   - run geoscan-backend container (joins both networks)"
	@echo "  make celery-run    - run geoscan-celery worker (-c 1)"
	@echo "  make nginx-install - print nginx install instructions"

audit:
	bash scripts/audit_server.sh

db-setup:
	sudo bash scripts/setup_db.sh

redis-setup:
	sudo bash scripts/setup_redis.sh

backend-build:
	cd backend && docker build -t geoscan-backend:latest .

backend-run:
	sudo bash infra/docker/run-backend.sh

celery-run:
	sudo bash infra/docker/run-celery.sh

nginx-install:
	@echo "1) sudo cp infra/nginx/apigeo.cosger.online.conf /etc/nginx/sites-available/"
	@echo "2) sudo ln -s /etc/nginx/sites-available/apigeo.cosger.online.conf /etc/nginx/sites-enabled/"
	@echo "3) sudo certbot --nginx -d apigeo.cosger.online"
	@echo "4) sudo nginx -t && sudo systemctl reload nginx"
