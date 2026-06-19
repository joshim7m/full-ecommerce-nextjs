# Baby Planet BD Clone — Production Deployment Guide

Complete deployment guide for the Baby Planet BD e-commerce clone on **DigitalOcean** or **Hostinger VPS**.

## 🏗️ Architecture

```
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │   NGINX (443)   │  ← TLS termination, Gzip+Brotli, caching, rate limit
              │   + Certbot     │  ← Let's Encrypt auto-renewal
              └────────┬────────┘
                       │
            ┌──────────┼──────────┐
            ▼                     ▼
   ┌─────────────────┐   ┌─────────────────┐
   │  Next.js (3000) │   │ Express (4000)  │
   │  Frontend       │   │  Backend API    │
   │  standalone     │   │  JWT + OAuth    │
   └─────────────────┘   └────────┬────────┘
                                  │
                       ┌──────────┼──────────┐
                       ▼                     ▼
              ┌─────────────────┐   ┌─────────────────┐
              │ PostgreSQL 16   │   │   Redis 7       │
              │  (5432)         │   │  (6379)         │
              │  Primary DB     │   │  Cache + rate   │
              └─────────────────┘   └─────────────────┘
```

## 📋 Prerequisites

- **VPS**: Ubuntu 22.04+ with at least 2GB RAM (4GB recommended)
- **Domain**: `babyplanet-bd.com` with DNS A records pointing to your VPS IP
- **DNS records**:
  - `babyplanet-bd.com` → VPS IP
  - `www.babyplanet-bd.com` → VPS IP
  - `api.babyplanet-bd.com` → VPS IP
- **Ports**: 80 (HTTP) + 443 (HTTPS) open in firewall
- **SSH access** as a non-root user with sudo

## 🚀 Quick Deploy

```bash
# 1. SSH into your VPS
ssh root@your-vps-ip

# 2. Install git + clone repo
apt update && apt install -y git
git clone https://github.com/your-org/babyplanet-clone.git /opt/babyplanet
cd /opt/babyplanet

# 3. Configure environment
cp .env.production.example .env.production
nano .env.production  # fill in real secrets

# 4. Run the deployment script
chmod +x deploy/deploy.sh deploy/setup-ssl.sh
./deploy/setup-ssl.sh  # one-time: obtain SSL cert
./deploy/deploy.sh     # build + deploy everything
```

That's it! Visit **https://babyplanet-bd.com** to see your live store.

## 📁 Project Structure (Phase 4 additions)

```
babyplanet-clone/
├── nginx/
│   └── nginx.conf              # NGINX reverse proxy + Gzip/Brotli + SSL + cache
├── deploy/
│   ├── deploy.sh               # One-command production deploy
│   └── setup-ssl.sh            # Initial Let's Encrypt SSL setup
├── src/
│   ├── app/
│   │   ├── sitemap.xml/
│   │   │   └── route.ts        # Dynamic sitemap (homepage + categories + products)
│   │   ├── robots.txt/
│   │   │   └── route.ts        # Dynamic robots.txt
│   │   ├── manifest.webmanifest/
│   │   │   └── route.ts        # PWA manifest
│   │   └── opengraph-image.tsx # Dynamic OG image (1200×630)
│   ├── lib/
│   │   └── seo.ts              # JSON-LD schema generators + metadata helpers
│   └── components/
│       └── shared/
│           └── json-ld.tsx     # JSON-LD <script> injector
├── Dockerfile                  # Frontend multi-stage build
├── Dockerfile.backend          # Backend multi-stage build
├── docker-compose.prod.yml     # Production stack
├── .env.production.example     # All env vars documented
└── next.config.ts              # Image opt + security headers + cache rules
```

## 🔍 SEO Features (Phase 4)

### Structured Data (JSON-LD)

| Schema             | Where it's embedded                          | Purpose                              |
|--------------------|----------------------------------------------|--------------------------------------|
| Organization       | Root layout (every page)                     | Google knowledge panel               |
| WebSite            | Root layout                                  | Sitelinks search box                 |
| LocalBusiness      | Root layout                                  | Local search + maps                  |
| Product            | Product detail pages                         | Shopping rich results (price, stock) |
| BreadcrumbList     | Every page with breadcrumbs                  | Breadcrumb rich results              |
| CollectionPage     | Category pages                               | Category indexing                    |
| SearchResultsPage  | Search page                                  | Search result indexing               |

### Dynamic Sitemap (`/sitemap.xml`)

Auto-generates with:
- Homepage (priority 1.0, daily)
- 5 category pages (priority 0.9, weekly)
- 25 product pages (priority 0.8, weekly, with image references)
- 7 static pages (priority 0.3–0.5, monthly/yearly)

Refreshes every hour via `revalidate: 3600`.

### Robots.txt (`/robots.txt`)

- ✅ Allows Googlebot, Bingbot, social crawlers
- ❌ Blocks `/admin`, `/api`, `/checkout`, `/account`, `/orders`, `/_next`
- 📌 Points to sitemap + declares canonical host

### OpenGraph + Twitter Cards

- Dynamic 1200×630 OG image generated at the edge via `next/og`
- Per-page OG metadata via `buildMetadata()` helper
- Product pages get OG `product` type with price + availability
- Twitter `summary_large_image` cards everywhere

### Performance Optimizations

| Feature                     | Config                                              |
|-----------------------------|-----------------------------------------------------|
| Image formats               | AVIF + WebP auto-negotiated                         |
| Responsive image sizes      | 8 sizes (16px → 1920px) auto-generated              |
| Static asset caching        | 1 year + `immutable` (content-addressed by hash)    |
| Image caching               | 30 days + `stale-while-revalidate=1day`             |
| Font caching                | 1 year + `immutable`                                |
| Package import optimization | Tree-shakes `lucide-react`, `date-fns`, etc.        |
| Compression                 | Gzip (Next.js) + Brotli (NGINX)                     |
| HTTP/2                      | Enabled on NGINX                                    |
| Source maps                 | Disabled in browser (kept server-side for debugging)|

## 🛡️ Security Headers

Applied via both `next.config.ts` AND `nginx.conf`:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
Content-Security-Policy: default-src 'self'; ... (full CSP)
```

## 🌐 NGINX Configuration

### Rate Limiting

| Zone     | Rate       | Burst | Path                       |
|----------|------------|-------|----------------------------|
| general  | 30 req/s   | 60    | All other routes           |
| api      | 10 req/s   | 20    | `/api/*`                   |
| auth     | 2 req/s    | 5     | `/api/v1/auth/*`           |
| checkout | 1 req/s    | 3     | `/api/v1/orders`           |

### Caching Zones

| Zone          | Size  | TTL         | Use                          |
|---------------|-------|-------------|------------------------------|
| `api_cache`   | 50 MB | 5 min (200) | API GET responses            |
| `static_cache`| 50 MB | 30 days     | Images, CSS, JS, fonts       |

Cache bypass when `Authorization` header or `bp_token` cookie present (auth-aware).

### Gzip + Brotli

Both compression algorithms enabled. Brotli at level 6 for text-based assets. Min length 256 bytes.

## 🐳 Docker

### Multi-stage Builds

**Frontend** (`Dockerfile`):
- `deps` → install deps with bun
- `builder` → build standalone Next.js
- `runner` → minimal Alpine image with non-root user (~120 MB)

**Backend** (`Dockerfile.backend`):
- `deps` → install production deps only
- `builder` → compile TypeScript → `dist/`
- `runner` → Alpine + non-root user (~80 MB)

### Health Checks

Every container has a healthcheck so Docker restarts unhealthy services automatically:
- NGINX: `GET /health`
- Frontend: `GET /`
- Backend: `GET /api/v1/health/ping`
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`

## 🔄 Operations

### View logs
```bash
docker compose -f docker-compose.prod.yml logs -f              # all services
docker compose -f docker-compose.prod.yml logs -f frontend     # one service
docker compose -f docker-compose.prod.yml logs -f nginx | grep -i error
```

### Restart a service
```bash
docker compose -f docker-compose.prod.yml restart backend
```

### Run database migration
```bash
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
```

### Open Prisma Studio (admin DB UI)
```bash
docker compose -f docker-compose.prod.yml run --rm backend npx prisma studio
```

### Manual SSL renewal
```bash
docker compose -f docker-compose.prod.yml run --rm certbot renew --quiet
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### Update to a new version
```bash
cd /opt/babyplanet
git pull
./deploy/deploy.sh
```

## 🔧 Performance Tuning

### NGINX worker processes
Edit `nginx/nginx.conf` and adjust:
```nginx
worker_processes auto;        # one per CPU core
worker_connections 1024;      # bump to 4096 for high-traffic
```

### PostgreSQL
Tune in `docker-compose.prod.yml`:
```yaml
postgres:
  command: postgres -c shared_buffers=512MB -c effective_cache_size=2GB -c max_connections=200
```

### Redis
Already configured with 512 MB max memory + LRU eviction. Bump in `docker-compose.prod.yml` if needed.

## 📊 Monitoring (optional Phase 5+)

Recommended additions:
- **Uptime monitoring**: UptimeRobot or BetterStack (free tier)
- **Error tracking**: Sentry (`@sentry/nextjs`)
- **Analytics**: Plausible or Umami (self-hosted, privacy-friendly)
- **Log aggregation**: Loki + Grafana

## 🚨 Troubleshooting

### "502 Bad Gateway"
Backend or frontend container is down. Check:
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend | tail -50
```

### SSL certificate renewal failed
```bash
docker compose -f docker-compose.prod.yml logs certbot
# Force renewal:
docker compose -f docker-compose.prod.yml run --rm certbot renew --force
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### Out of memory
```bash
docker stats
# Add swap if needed:
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
```

### Database connection errors
```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U babyplanet_prod -d babyplanet_db_prod -c "SELECT 1;"
```

---

## ✅ Phase 4 Checklist

- [x] Dynamic sitemap.xml with all 25 products + 5 categories
- [x] Dynamic robots.txt with proper crawl rules
- [x] JSON-LD schemas (Organization, WebSite, LocalBusiness, Product, Breadcrumb, CollectionPage)
- [x] OpenGraph + Twitter card metadata helpers
- [x] Dynamic OG image generation (1200×630) via `next/og`
- [x] PWA manifest with shortcuts
- [x] Security headers in both Next.js + NGINX
- [x] Image optimization (AVIF + WebP, responsive sizes)
- [x] NGINX config with Gzip + Brotli + SSL + rate limiting + caching
- [x] Multi-stage Dockerfiles for frontend + backend (~200 MB total)
- [x] Production docker-compose with all 5 services
- [x] One-command deploy script
- [x] SSL setup script with Let's Encrypt auto-renewal
- [x] Production env template

🎉 **All 4 phases complete!** The Baby Planet BD clone is production-ready.
