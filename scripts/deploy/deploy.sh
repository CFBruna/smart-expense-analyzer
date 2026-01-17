#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Smart Expense Analyzer - Production Deploy ===${NC}\n"

# Check if docker-compose.prod.yml exists
if [[ ! -f "docker-compose.prod.yml" ]]; then
    echo -e "${YELLOW}docker-compose.prod.yml not found. Using standalone configuration...${NC}"
    cp docker-compose.standalone.yml docker-compose.prod.yml
fi

# Check required tools
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Error: docker is not installed${NC}" >&2; exit 1; }

# Check if docker compose works (plugin or standalone)
if ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}Error: docker compose is not available${NC}" >&2
    echo "Please install Docker Compose plugin or docker-compose"
    exit 1
fi

# Check if .env files exist
if [[ ! -f "apps/backend/.env" ]]; then
    echo -e "${RED}Error: apps/backend/.env not found${NC}"
    echo "Please create it first. See DEPLOY.md for instructions."
    exit 1
fi

if [[ ! -f "apps/frontend/.env.production" ]]; then
    echo -e "${RED}Error: apps/frontend/.env.production not found${NC}"
    echo "Please create it first. See DEPLOY.md for instructions."
    exit 1
fi

echo -e "${YELLOW}Step 1/5: Checking for updates...${NC}"
if git rev-parse --git-dir > /dev/null 2>&1; then
    git pull origin main || {
        echo -e "${YELLOW}Could not pull from git. Skipping...${NC}"
    }
else
    echo -e "${YELLOW}Not a git repository. Skipping git pull...${NC}"
fi

echo -e "\n${YELLOW}Step 2/5: Building Docker images...${NC}"
docker compose -f docker-compose.prod.yml build || {
    echo -e "${RED}Build failed!${NC}"
    exit 1
}

echo -e "\n${YELLOW}Step 3/5: Starting services...${NC}"
docker compose -f docker-compose.prod.yml up -d || {
    echo -e "${RED}Failed to start services!${NC}"
    exit 1
}

echo -e "\n${YELLOW}Step 4/5: Waiting for services to be ready...${NC}"
echo -e "${YELLOW}Step 5/5: Checking service status...${NC}"
docker compose -f docker-compose.prod.yml ps

# Test backend health with retry (check if container is responsive)
echo -e "\n${YELLOW}Testing backend...${NC}"
BACKEND_READY=false
for i in {1..30}; do
    if docker exec expense_backend wget -q --spider http://localhost:3000/categories 2>/dev/null || docker exec expense_backend wget -q --spider http://localhost:3000/auth/login 2>/dev/null; then
        echo -e "${GREEN}✓ Backend is responding${NC}"
        BACKEND_READY=true
        break
    fi
    sleep 1
done

if [ "$BACKEND_READY" = false ]; then
    echo -e "${RED}✗ Backend health check failed after 30s${NC}"
    echo -e "${YELLOW}Note: Check logs with: docker compose -f docker-compose.prod.yml logs backend${NC}"
fi

# Test frontend health with retry
echo -e "${YELLOW}Testing frontend...${NC}"
FRONTEND_READY=false
for i in {1..30}; do
    if docker exec expense_frontend wget -q --spider http://localhost:80/ 2>/dev/null; then
        echo -e "${GREEN}✓ Frontend is responding${NC}"
        FRONTEND_READY=true
        break
    fi
    sleep 1
done

if [ "$FRONTEND_READY" = false ]; then
    echo -e "${RED}✗ Frontend health check failed after 30s${NC}"
    echo -e "${YELLOW}Note: Check logs with: docker compose -f docker-compose.prod.yml logs frontend${NC}"
fi

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "View logs: ${YELLOW}docker compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "Stop services: ${YELLOW}docker compose -f docker-compose.prod.yml down${NC}"
