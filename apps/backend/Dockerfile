FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace configs
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json* ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm --filter backend build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

# Copy env if needed or rely on runtime env
CMD ["node", "apps/backend/dist/main"]
