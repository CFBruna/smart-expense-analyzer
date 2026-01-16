# Deployment Scripts

Helper scripts for deploying Smart Expense Analyzer to production.

## Available Scripts

### 1. Environment Setup (`setup-env.sh`)

Interactive script to create `.env` files for both backend and frontend.

```bash
./scripts/deploy/setup-env.sh
```

**Features:**
- Prompts for all required configuration
- Auto-generates JWT secret if not provided
- Validates input
- Creates properly formatted `.env` files

### 2. Production Deploy (`deploy.sh`)

Automated deployment script that pulls code, builds, and starts services.

```bash
./scripts/deploy/deploy.sh
```

**What it does:**
1. Pulls latest changes from git
2. Builds Docker images
3. Starts all services
4. Runs health checks
5. Reports status

**Prerequisites:**
- `.env` files must exist (run `setup-env.sh` first)
- Docker and docker-compose must be installed

### 3. Create User (`create-user.sh`)

Creates a new user with password hashing.

```bash
./scripts/deploy/create-user.sh
```

**Features:**
- Prompts for email, password, name, currency
- Automatically generates bcrypt hash
- Verifies user creation
- Fallback to manual hash if needed

## Usage Examples

### Initial Setup

```bash
# 1. Setup environment variables
./scripts/deploy/setup-env.sh

# 2. Deploy application
./scripts/deploy/deploy.sh

# 3. Create first user
./scripts/deploy/create-user.sh
```

### Update Deployment

```bash
# Pull changes, rebuild, and restart
./scripts/deploy/deploy.sh
```

### Add New User

```bash
./scripts/deploy/create-user.sh
```

## Manual Usage

If scripts fail, you can run commands manually:

### Manual Deployment

```bash
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

### Manual User Creation

```bash
# Connect to MongoDB
docker exec -it expense_mongo mongosh smart-expense-analyzer

# Create user (replace values)
db.users.insertOne({
  email: "user@example.com",
  passwordHash: "$2b$10$...",  // Get from https://bcrypt-generator.com
  name: "User Name",
  currency: "BRL",
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0
});

exit
```

## Troubleshooting

### Script Permission Denied

```bash
chmod +x scripts/deploy/*.sh
```

### bcrypt Hash Generation Fails

Visit https://bcrypt-generator.com/ and:
1. Enter your password
2. Set rounds to 10
3. Copy the generated hash
4. Use it when prompted by the script

### Docker Command Not Found

Install Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Then log out and back in for group changes to take effect.

## Security Notes

- **Never commit `.env` files** to git
- Store production credentials securely
- Use strong passwords (min 8 characters)
- Regularly rotate JWT secrets and API keys
- Keep backups of `.env` files in a secure location
