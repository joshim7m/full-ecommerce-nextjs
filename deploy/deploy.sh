#!/usr/bin/env bash
# =============================================================================
# Baby Planet BD — Production Deployment Script
# -----------------------------------------------------------------------------
# Designed for DigitalOcean / Hostinger VPS running Ubuntu 22.04+.
#
# Usage on the VPS:
#   1. git clone <repo> /opt/babyplanet && cd /opt/babyplanet
#   2. cp .env.production.example .env.production && nano .env.production
#   3. chmod +x deploy/deploy.sh && ./deploy/deploy.sh
#
# Prerequisites (auto-installed if missing):
#   • Docker Engine + Docker Compose v2
#   • Certbot (for Let's Encrypt SSL)
# =============================================================================

set -euo pipefail

# ---- Colors ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $*"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARN:${NC} $*"; }
err()  { echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $*" >&2; }
info() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"; }

PROJECT_DIR="/opt/babyplanet"
cd "$PROJECT_DIR"

# -----------------------------------------------------------------------------
# 1. Verify .env.production exists
# -----------------------------------------------------------------------------
if [ ! -f .env.production ]; then
  err ".env.production not found. Copy .env.production.example and fill in real values first."
  exit 1
fi

# Verify no placeholder values remain
if grep -q "CHANGE_ME" .env.production; then
  err "Found CHANGE_ME placeholders in .env.production. Fill in real values before deploying."
  exit 1
fi

log "Environment file verified."

# -----------------------------------------------------------------------------
# 2. Verify Docker is installed
# -----------------------------------------------------------------------------
if ! command -v docker &> /dev/null; then
  log "Installing Docker Engine..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

if ! docker compose version &> /dev/null; then
  err "Docker Compose v2 not available. Install it: apt install docker-compose-plugin"
  exit 1
fi

log "Docker verified: $(docker --version)"

# -----------------------------------------------------------------------------
# 3. Pull latest code
# -----------------------------------------------------------------------------
log "Pulling latest code from git..."
git pull --ff-only

# -----------------------------------------------------------------------------
# 4. Build images
# -----------------------------------------------------------------------------
log "Building Docker images (this may take 5-10 minutes)..."
docker compose -f docker-compose.prod.yml build --no-cache

# -----------------------------------------------------------------------------
# 5. Start infrastructure (PostgreSQL + Redis) first
# -----------------------------------------------------------------------------
log "Starting infrastructure (PostgreSQL + Redis)..."
docker compose -f docker-compose.prod.yml up -d postgres redis

log "Waiting for PostgreSQL to be healthy..."
for i in {1..30}; do
  if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U babyplanet_prod &> /dev/null; then
    log "PostgreSQL is ready."
    break
  fi
  sleep 2
done

# -----------------------------------------------------------------------------
# 6. Run Prisma migrations + seed
# -----------------------------------------------------------------------------
log "Running Prisma migrations..."
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# Only seed on first deployment (check if users table is empty)
USER_COUNT=$(docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U babyplanet_prod -d babyplanet_db_prod -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")

if [ "$USER_COUNT" -lt "1" ]; then
  warn "Database is empty — running seeder..."
  docker compose -f docker-compose.prod.yml run --rm backend npm run prisma:seed
  log "Seed complete. Admin: admin@babyplanet.bd / Admin#1234"
else
  log "Database already has $USER_COUNT users — skipping seed."
fi

# -----------------------------------------------------------------------------
# 7. Start all services
# -----------------------------------------------------------------------------
log "Starting all services..."
docker compose -f docker-compose.prod.yml up -d

# -----------------------------------------------------------------------------
# 8. Obtain SSL certificate (first time only)
# -----------------------------------------------------------------------------
if [ ! -d "/etc/letsencrypt/live/babyplanet-bd.com" ]; then
  warn "SSL certificate not found. Obtaining from Let's Encrypt..."

  # Start NGINX temporarily to serve ACME challenge
  docker compose -f docker-compose.prod.yml up -d nginx

  sleep 3

  docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d babyplanet-bd.com \
    -d www.babyplanet-bd.com \
    -d api.babyplanet-bd.com \
    --email hello@babyplanet.bd \
    --agree-tos \
    --no-eff-email \
    --non-interactive

  log "SSL certificate obtained. Reloading NGINX..."
  docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
else
  log "SSL certificate already exists."
fi

# -----------------------------------------------------------------------------
# 9. Verify all services are healthy
# -----------------------------------------------------------------------------
log "Verifying service health..."
sleep 10

HEALTHY=0
TOTAL=0
for service in nginx frontend backend postgres redis; do
  TOTAL=$((TOTAL + 1))
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' babyplanet_$service 2>/dev/null || echo "starting")
  if [ "$STATUS" = "healthy" ]; then
    log "  ✓ $service: healthy"
    HEALTHY=$((HEALTHY + 1))
  else
    warn "  ✗ $service: $STATUS"
  fi
done

# -----------------------------------------------------------------------------
# 10. Print summary
# -----------------------------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎉  Baby Planet BD — Deployment Complete"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   Services:      $HEALTHY / $TOTAL healthy"
echo "   Storefront:    https://babyplanet-bd.com"
echo "   Admin:         https://babyplanet-bd.com/admin"
echo "   API:           https://api.babyplanet-bd.com/api/v1/health"
echo "   Admin login:   admin@babyplanet.bd / Admin#1234"
echo ""
echo "   Logs:          docker compose -f docker-compose.prod.yml logs -f"
echo "   Restart:       docker compose -f docker-compose.prod.yml restart"
echo "   Stop:          docker compose -f docker-compose.prod.yml down"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ "$HEALTHY" -lt "$TOTAL" ]; then
  warn "Some services are not yet healthy. Check logs:"
  warn "  docker compose -f docker-compose.prod.yml logs <service>"
  exit 1
fi

log "All services healthy. Deployment successful."
