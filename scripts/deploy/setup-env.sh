#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Environment Setup Script ===${NC}\n"

# Function to prompt for input with default
prompt_with_default() {
    local prompt=$1
    local default=$2
    local varname=$3
    
    read -p "$prompt [$default]: " value
    eval $varname=\${value:-$default}
}

# Check if files already exist
if [[ -f "apps/backend/.env" ]]; then
    echo -e "${YELLOW}⚠️  apps/backend/.env already exists!${NC}"
    read -p "Overwrite? (y/n): " overwrite
    if [[ "$overwrite" != "y" ]]; then
        echo "Skipping backend .env"
        SKIP_BACKEND=true
    fi
fi

if [[ -f "apps/frontend/.env.production" ]]; then
    echo -e "${YELLOW}⚠️  apps/frontend/.env.production already exists!${NC}"
    read -p "Overwrite? (y/n): " overwrite
    if [[ "$overwrite" != "y" ]]; then
        echo "Skipping frontend .env"
        SKIP_FRONTEND=true
    fi
fi

# Backend Environment
if [[ "$SKIP_BACKEND" != "true" ]]; then
    echo -e "\n${GREEN}Backend Configuration:${NC}"
    
    prompt_with_default "MongoDB URI" "mongodb://expense_mongo:27017/smart-expense-analyzer" MONGODB_URI
    prompt_with_default "Redis URL" "redis://expense_redis:6379" REDIS_URL
    prompt_with_default "Server Port" "3000" PORT
    prompt_with_default "Node Environment" "production" NODE_ENV
    
    echo -e "\n${YELLOW}JWT Secret (leave empty to generate):${NC}"
    read -p "JWT Secret: " JWT_SECRET
    if [[ -z "$JWT_SECRET" ]]; then
        JWT_SECRET=$(openssl rand -base64 48)
        echo -e "${GREEN}Generated JWT Secret: $JWT_SECRET${NC}"
    fi
    
    echo -e "\n${YELLOW}Google Gemini API Key (required for AI features):${NC}"
    read -p "Gemini API Key: " GEMINI_API_KEY
    
    # Write backend .env
    cat > apps/backend/.env << EOF
# Production Environment
# Generated on $(date)

# MongoDB (Docker container)
MONGODB_URI=$MONGODB_URI

# Redis (Docker container)
REDIS_URL=$REDIS_URL

# JWT Authentication
JWT_SECRET=$JWT_SECRET

# Google Gemini AI
GEMINI_API_KEY=$GEMINI_API_KEY

# Server
PORT=$PORT
NODE_ENV=$NODE_ENV
EOF

    echo -e "${GREEN}✓ Created apps/backend/.env${NC}"
fi

# Frontend Environment
if [[ "$SKIP_FRONTEND" != "true" ]]; then
    echo -e "\n${GREEN}Frontend Configuration:${NC}"
    
    prompt_with_default "Full domain (e.g., expenses.brunadev.com)" "localhost" DOMAIN
    
    if [[ "$DOMAIN" == "localhost" ]]; then
        API_URL="http://localhost:3000"
    else
        API_URL="https://$DOMAIN/api"
    fi
    
    echo "API URL will be: $API_URL"
    
    # Write frontend .env.production
    cat > apps/frontend/.env.production << EOF
# Production Frontend Environment
# Generated on $(date)

VITE_API_URL=$API_URL
EOF

    echo -e "${GREEN}✓ Created apps/frontend/.env.production${NC}"
fi

echo -e "\n${GREEN}=== Environment Setup Complete! ===${NC}"
echo -e "Review the files and update any values as needed:"
echo -e "  - ${YELLOW}apps/backend/.env${NC}"
echo -e "  - ${YELLOW}apps/frontend/.env.production${NC}"
echo -e "\n${YELLOW}IMPORTANT:${NC} Never commit these .env files to git!"
