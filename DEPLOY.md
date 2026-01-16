# Azure Deployment Guide

Complete guide for deploying Smart Expense Analyzer to production on Azure VM.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Deployment Methods](#deployment-methods)
  - [Method 1: Standalone (Recommended)](#method-1-standalone-recommended)
  - [Method 2: With Existing Gateway](#method-2-with-existing-gateway-advanced)
- [Post-Deployment](#post-deployment)
- [User Management](#user-management)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/CFBruna/smart-expense-analyzer.git
cd smart-expense-analyzer

# 2. Setup environment
./scripts/deploy/setup-env.sh

# 3. Create nginx configuration
mkdir -p nginx
cp nginx/nginx.conf.example nginx/nginx.conf
# Edit nginx/nginx.conf and replace 'expenses.yourdomain.com' with your domain

# 4. Generate SSL certificate
sudo certbot certonly --standalone \
  --preferred-challenges http \
  -d expenses.yourdomain.com \
  --email your@email.com \
  --agree-tos

# 5. Deploy
./scripts/deploy/deploy.sh

# 6. Create first user
./scripts/deploy/create-user.sh
```

> **Note**: For detailed instructions and troubleshooting, see the full deployment guide below.

## Prerequisites

### Azure VM Requirements

- **OS**: Ubuntu 20.04 LTS or newer
- **Size**: Standard B2s minimum (2 vCPUs, 4GB RAM)
- **Disk**: 30GB+ SSD
- **Network**: Public IP with ports 80, 443, and 22 open
- **Domain**: Domain name pointing to VM's public IP

### Required Software

```bash
# Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Certbot for SSL
sudo apt update
sudo apt install -y certbot

# Log out and back in for docker group to take effect
```

## Deployment Methods

### Method 1: Standalone (Recommended)

This is the **standard deployment** for most users. All services (frontend, backend, database, and nginx) run in Docker.

#### 1. DNS Configuration

Add an A record in your DNS provider:

```
Type: A
Name: expenses  (or your subdomain)
Value: <YOUR_VM_PUBLIC_IP>
TTL: 300 (for faster propagation)
```

Verify DNS:
```bash
nslookup expenses.yourdomain.com
dig @8.8.8.8 expenses.yourdomain.com
```

#### 2. Clone Repository

```bash
ssh user@<VM_IP>
cd ~
git clone https://github.com/CFBruna/smart-expense-analyzer.git
cd smart-expense-analyzer
```

#### 3. Environment Setup

**Option A: Using Setup Script** (Recommended)
```bash
./scripts/deploy/setup-env.sh
```

**Option B: Manual Setup**

Create `apps/backend/.env`:
```env
# MongoDB
MONGODB_URI=mongodb://expense_mongo:27017/smart-expense-analyzer

# Redis
REDIS_URL=redis://expense_redis:6379

# JWT Secret (generate with: openssl rand -base64 48)
JWT_SECRET=your-secure-secret-here-min-32-chars

# Google Gemini AI (get from: https://aistudio.google.com/apikey)
GEMINI_API_KEY=your-api-key-here

# Server
PORT=3000
NODE_ENV=production
```

Create `apps/frontend/.env.production`:
```env
VITE_API_URL=https://expenses.yourdomain.com/api
```

#### 4. Create Nginx Configuration

Create nginx configuration for the application:

```bash
mkdir -p nginx
cp nginx/nginx.conf.example nginx/nginx.conf
```

**Important**: Edit `nginx/nginx.conf` and replace `expenses.yourdomain.com` with your actual domain.

Or create it manually:

```bash
mkdir -p nginx
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server expense_backend:3000;
    }

    upstream frontend {
        server expense_frontend:80;
    }

    # HTTP - Redirect to HTTPS
    server {
        listen 80;
        server_name _;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS
    server {
        listen 443 ssl http2;
        server_name _;
        
        ssl_certificate     /etc/letsencrypt/live/expenses.yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/expenses.yourdomain.com/privkey.pem;
        
        # API routes
        location /api/ {
            rewrite ^/api/(.*) /$1 break;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }

        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
    }
}
EOF
```

#### 5. SSL Certificate

Generate SSL certificate **before** starting services:

```bash
# Create certbot directory
sudo mkdir -p /var/www/certbot

# Generate certificate
sudo certbot certonly --standalone \
  --preferred-challenges http \
  -d expenses.yourdomain.com \
  --email your@email.com \
  --agree-tos \
  --no-eff-email

# Certificate will be at:
# /etc/letsencrypt/live/expenses.yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/expenses.yourdomain.com/privkey.pem
```

#### 6. Docker Compose Configuration

The project includes a complete standalone configuration at `docker-compose.standalone.yml` that includes nginx.

**Option A: Use Standalone Configuration** (Recommended for simple deployments)

```bash
# Use the provided standalone configuration
cp docker-compose.standalone.yml docker-compose.prod.yml
```

**Option B: Keep Gateway-ready Configuration**

If you plan to use Method 2 (gateway), keep the existing `docker-compose.prod.yml` and manually add nginx service.

See `docker-compose.standalone.yml` for reference on the nginx service configuration.

#### 7. Build and Deploy

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Verify all running
docker compose -f docker-compose.prod.yml ps
```

#### 8. Verify Deployment

```bash
# Test HTTPS
curl -I https://expenses.yourdomain.com

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### Method 2: With Existing Gateway (Advanced)

**Use this only if** you already have a centralized nginx gateway managing multiple applications.

#### Prerequisites
- Existing nginx gateway with external Docker network
- Gateway handling SSL termination

#### Configuration

1. **Ensure external network exists:**
```bash
docker network create gateway_net
```

2. **Use original `docker-compose.prod.yml`** (without nginx service, using `expose` instead of `ports`)

3. **Add to your gateway's nginx.conf:**

```nginx
# Add upstreams
upstream expense_frontend {
    server expense_frontend:80;
}
upstream expense_backend {
    server expense_backend:3000;
}

# Add server block
server {
    listen 443 ssl http2;
    server_name expenses.yourdomain.com;
    
    ssl_certificate     /etc/letsencrypt/live/expenses.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/expenses.yourdomain.com/privkey.pem;
    
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://expense_backend;
        # ... proxy headers ...
    }

    location / {
        proxy_pass http://expense_frontend;
        # ... proxy headers ...
    }
}
```

4. **Generate SSL and restart gateway:**
```bash
sudo certbot certonly --webroot -w /var/www/certbot -d expenses.yourdomain.com
docker compose -f /path/to/gateway/docker-compose.yml restart
```

## Post-Deployment

### Create First User

```bash
./scripts/deploy/create-user.sh
```

Or manually via MongoDB:

```bash
# Generate hash at: https://bcrypt-generator.com/ (cost factor: 10)

docker exec -it expense_mongo mongosh smart-expense-analyzer

db.users.insertOne({
  email: "you@example.com",
  passwordHash: "$2b$10$[PASTE_HASH_HERE]",
  name: "Your Name",
  currency: "BRL",
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0
});

exit
```

### Verify Application

Visit: `https://expenses.yourdomain.com`

- Test login with created user
- Create a test expense
- Verify AI categorization works (requires Gemini API key)
- Check analytics dashboard

## User Management

### Create Additional Users

```bash
./scripts/deploy/create-user.sh
```

### Reset Password

```bash
# Generate new hash at: https://bcrypt-generator.com/

docker exec -it expense_mongo mongosh smart-expense-analyzer

db.users.updateOne(
  { email: "user@example.com" },
  { $set: { passwordHash: "$2b$10$NEW_HASH", updatedAt: new Date() } }
);

exit
```

### List All Users

```bash
docker exec -it expense_mongo mongosh smart-expense-analyzer --eval "db.users.find({}, {email:1, name:1, currency:1}).pretty()"
```

## Troubleshooting

### DNS Issues

**Problem:** `DNS_PROBE_FINISHED_NXDOMAIN` in browser

**Solutions:**

1. Verify DNS propagation:
   ```bash
   nslookup expenses.yourdomain.com
   https://dnschecker.org/#A/expenses.yourdomain.com
   ```

2. Clear local DNS cache:
   ```bash
   # Linux
   sudo systemd-resolve --flush-caches
   
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```

3. Disable browser DNS over HTTPS (Chrome: `chrome://settings/security`)

4. Try different browser or incognito mode

### SSL Certificate Issues

**Problem:** SSL certificate error

```bash
# Verify certificate files exist
sudo ls -la /etc/letsencrypt/live/expenses.yourdomain.com/

# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/expenses.yourdomain.com/fullchain.pem -text -noout

# Test SSL connection
openssl s_client -connect expenses.yourdomain.com:443 -servername expenses.yourdomain.com
```

**Problem:** Certificate renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Restart nginx after renewal
docker compose -f docker-compose.prod.yml restart nginx
```

### Application Issues

**Problem:** 502 Bad Gateway

```bash
# Check all services are running
docker compose -f docker-compose.prod.yml ps

# Check backend logs
docker logs expense_backend --tail=100

# Verify MongoDB connection
docker exec expense_backend wget -q -O- http://localhost:3000/
```

**Problem:** Frontend blank page

```bash
# Check browser console for errors
# Verify VITE_API_URL in apps/frontend/.env.production

# Check frontend logs
docker logs expense_frontend

# Verify nginx routing
docker logs expense_nginx
```

**Problem:** API timeout or slow responses

```bash
# Check Gemini API key is valid
# Monitor container resources
docker stats

# Check backend logs for errors
docker logs expense_backend -f
```

### Docker Issues

**Problem:** Containers not starting

```bash
# View all container logs
docker compose -f docker-compose.prod.yml logs

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

**Problem:** Port already in use

```bash
# Check what's using ports 80/443
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Stop conflicting service
sudo systemctl stop apache2  # or nginx, if system nginx running
```

## Maintenance

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend

# Last N lines
docker logs expense_backend --tail=50
```

### Database Backup

```bash
# Backup
docker exec expense_mongo mongodump \
  --db smart-expense-analyzer \
  --out /tmp/backup

docker cp expense_mongo:/tmp/backup ./mongodb-backup-$(date +%Y%m%d)

# Restore
docker cp ./mongodb-backup-YYYYMMDD expense_mongo:/tmp/restore
docker exec expense_mongo mongorestore \
  /tmp/restore/smart-expense-analyzer \
  --db smart-expense-analyzer
```

### Update Application

```bash
cd ~/smart-expense-analyzer

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Check logs for issues
docker compose -f docker-compose.prod.yml logs -f
```

### Monitor Resources

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean unused resources
docker system prune -a --volumes
```

### Auto-renewal Setup

Certbot automatically sets up renewal. Verify:

```bash
# Check renewal timer
sudo systemctl status certbot.timer

# View renewal config
sudo cat /etc/letsencrypt/renewal/expenses.yourdomain.com.conf
```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files to git
   - Use strong JWT secrets (min 32 characters)
   - Rotate secrets periodically

2. **Firewall**
   ```bash
   sudo ufw allow 22   # SSH
   sudo ufw allow 80   # HTTP
   sudo ufw allow 443  # HTTPS
   sudo ufw enable
   ```

3. **SSH Security**
   - Use SSH keys, disable password authentication
   - Change default SSH port
   - Use fail2ban

4. **Regular Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   docker compose -f docker-compose.prod.yml pull
   ```

5. **Monitoring**
   - Set up log monitoring
   - Configure alerts for failures
   - Monitor disk space and resources

## Quick Reference

### Common Commands

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Stop all services
docker compose -f docker-compose.prod.yml down

# Restart service
docker compose -f docker-compose.prod.yml restart [service]

# View logs
docker compose -f docker-compose.prod.yml logs -f [service]

# Rebuild service
docker compose -f docker-compose.prod.yml up -d --build [service]

# Access MongoDB
docker exec -it expense_mongo mongosh smart-expense-analyzer

# Check service health
docker compose -f docker-compose.prod.yml ps
```

### Service Architecture

**Standalone Deployment:**
```
Internet → Nginx (443) → Frontend (80)
                      → Backend (3000) → MongoDB (27017)
                                      → Redis (6379)
```

**Gateway Deployment:**
```
Internet → Gateway Nginx (443) → Frontend (80)
                               → Backend (3000) → MongoDB (27017)
                                                → Redis (6379)
```

### Important Files

- `apps/backend/.env` - Backend environment variables
- `apps/frontend/.env.production` - Frontend environment variables
- `docker-compose.prod.yml` - Production services configuration
- `nginx/nginx.conf` - Nginx configuration (standalone only)
- `/etc/letsencrypt/` - SSL certificates

### Useful Links

- **Gemini API Key**: https://aistudio.google.com/apikey
- **Bcrypt Generator**: https://bcrypt-generator.com/
- **DNS Checker**: https://dnschecker.org/
- **SSL Test**: https://www.ssllabs.com/ssltest/

## Support

If you encounter issues:

1. Check relevant section in [Troubleshooting](#troubleshooting)
2. Review logs: `docker compose logs -f`
3. Verify DNS propagation
4. Check firewall rules
5. Ensure all environment variables are set correctly
6. Try restarting services

For persistent issues, gather:
- Output of `docker compose ps`
- Recent logs from affected service
- Browser console errors (if frontend issue)
- Steps to reproduce the problem
