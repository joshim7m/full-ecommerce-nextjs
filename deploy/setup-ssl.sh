#!/usr/bin/env bash
# =============================================================================
# Baby Planet BD — Initial SSL Certificate Setup
# -----------------------------------------------------------------------------
# Run this ONCE on a fresh VPS to obtain the initial Let's Encrypt cert.
# After this, the certbot service in docker-compose.prod.yml auto-renews.
#
# Prerequisites:
#   • DNS records for babyplanet-bd.com, www.babyplanet-bd.com, and
#     api.babyplanet-bd.com all pointing to this VPS's IP
#   • Ports 80 + 443 open in the firewall
# =============================================================================

set -euo pipefail

DOMAIN="babyplanet-bd.com"
EMAIL="hello@babyplanet.bd"

echo "🔐  Obtaining initial SSL certificate for *.${DOMAIN}..."
echo ""

# Step 1: Start NGINX on port 80 only (no SSL yet) to serve ACME challenge
echo "→ Starting NGINX in HTTP-only mode for ACME challenge..."

# Create a temporary NGINX config that only listens on port 80
cat > /tmp/nginx-http-only.conf <<EOF
events { worker_connections 1024; }
http {
    server {
        listen 80;
        server_name ${DOMAIN} www.${DOMAIN} api.${DOMAIN};
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 'OK\n';
        }
    }
}
EOF

# Run NGINX temporarily
docker run -d --name nginx_temp \
  -p 80:80 \
  -v /tmp/nginx-http-only.conf:/etc/nginx/nginx.conf:ro \
  -v babyplanet_certbot_webroot:/var/www/certbot \
  nginx:1.27-alpine

sleep 3

# Step 2: Obtain certificate
echo "→ Requesting certificate from Let's Encrypt..."

docker run --rm \
  -v babyplanet_certbot_certs:/etc/letsencrypt \
  -v babyplanet_certbot_webroot:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d ${DOMAIN} \
  -d www.${DOMAIN} \
  -d api.${DOMAIN} \
  --email ${EMAIL} \
  --agree-tos \
  --no-eff-email \
  --non-interactive

# Step 3: Cleanup temp NGINX
echo "→ Cleaning up temporary NGINX..."
docker stop nginx_temp && docker rm nginx_temp
rm /tmp/nginx-http-only.conf

echo ""
echo "✅  SSL certificate obtained successfully!"
echo ""
echo "   Certificate location: /etc/letsencrypt/live/${DOMAIN}/"
echo "   Full chain:           fullchain.pem"
echo "   Private key:          privkey.pem"
echo ""
echo "   Now run: ./deploy/deploy.sh"
echo ""
echo "   The certbot service in docker-compose.prod.yml will auto-renew"
echo "   the certificate every 6 hours, 30 days before expiry."
