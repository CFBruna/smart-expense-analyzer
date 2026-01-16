#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Create User Script ===${NC}\n"

# Check if required containers are running
echo -e "${YELLOW}Checking required containers...${NC}"

if ! docker ps --format '{{.Names}}' | grep -q '^expense_mongo$'; then
    echo -e "${RED}Error: expense_mongo container is not running${NC}"
    echo -e "${YELLOW}Start services first: docker compose -f docker-compose.prod.yml up -d${NC}"
    exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q '^expense_backend$'; then
    echo -e "${RED}Error: expense_backend container is not running${NC}"
    echo -e "${YELLOW}Start services first: docker compose -f docker-compose.prod.yml up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All required containers are running${NC}\n"

# Check if mongosh is in the container
if ! docker exec expense_mongo which mongosh >/dev/null 2>&1; then
    echo -e "${RED}Error: mongosh not found in expense_mongo container${NC}"
    exit 1
fi

# Get user details
echo -e "${YELLOW}Enter user details:${NC}"
read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo
read -p "Name: " NAME
read -p "Currency [BRL]: " CURRENCY
CURRENCY=${CURRENCY:-BRL}

echo -e "\n${YELLOW}Generating password hash...${NC}"

# Generate hash using bcryptjs in container
HASH=$(docker exec -i expense_backend node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('$PASSWORD', 10).then(hash => console.log(hash));
" 2>/dev/null | tail -1)

if [[ -z "$HASH" ]]; then
    echo -e "${RED}Failed to generate password hash${NC}"
    echo -e "${YELLOW}Visit https://bcrypt-generator.com/ and manually generate a hash${NC}"
    read -p "Paste the bcrypt hash here: " HASH
fi

echo -e "\n${YELLOW}Creating user in MongoDB...${NC}"

# Create user in MongoDB
docker exec -i expense_mongo mongosh smart-expense-analyzer --quiet --eval "
db.users.insertOne({
  email: '$EMAIL',
  passwordHash: '$HASH',
  name: '$NAME',
  currency: '$CURRENCY',
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0
});
" >/dev/null 2>&1

# Verify user was created
VERIFY=$(docker exec -i expense_mongo mongosh smart-expense-analyzer --quiet --eval "
db.users.countDocuments({ email: '$EMAIL' });
" 2>/dev/null | tail -1)

if [[ "$VERIFY" == "1" ]]; then
    echo -e "${GREEN}✓ User created successfully!${NC}"
    echo -e "\nCredentials:"
    echo -e "  Email: ${YELLOW}$EMAIL${NC}"
    echo -e "  Password: ${YELLOW}$PASSWORD${NC}"
else
    echo -e "${RED}✗ Failed to create user${NC}"
    exit 1
fi
