# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter frontend build

# Production Stage
FROM nginx:alpine

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
# COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf # Uncomment when created

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
