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
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Error: docker-compose is not installed${NC}" >&2; exit 1; }

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
sleep 5

echo -e "\n${YELLOW}Step 5/5: Checking service status...${NC}"
docker compose -f docker-compose.prod.yml ps

# Test backend health
echo -e "\n${YELLOW}Testing backend...${NC}"
if docker exec expense_backend wget -q -O- http://localhost:3000/ >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

# Test frontend health
echo -e "${YELLOW}Testing frontend...${NC}"
if docker exec expense_frontend wget -q -O- http://localhost:80/ >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
fi

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "View logs: ${YELLOW}docker compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "Stop services: ${YELLOW}docker compose -f docker-compose.prod.yml down${NC}"
