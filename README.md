# Smart Expense Analyzer 💰🤖

> AI-powered personal finance management system with intelligent expense categorization and real-time multi-currency support.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

## 🎯 Overview

Smart Expense Analyzer is a full-stack application designed to help users track, categorize, and analyze their expenses effortlessly. It leverages AI for automatic expense categorization and provides real-time currency conversion with proactive caching for instant performance.

**Key Highlights:**
- 🤖 **AI-Powered Categorization** using Google Gemini and LangChain
- 💱 **Multi-Currency Support** with 24 currency pairs and real-time exchange rates
- 📊 **Interactive Analytics** with visual spending insights
- ⚡ **Instant Performance** with Redis caching and background job scheduling
- 🏗️ **Clean Architecture** following Domain-Driven Design principles
- 🔒 **Secure Authentication** with JWT and bcrypt

## ✨ Features

### Core Functionality
- **Expense Management**: Create, read, update, and delete expenses with detailed information
- **Smart Categorization**: AI automatically suggests categories based on expense descriptions
- **Category Management**: Create custom expense categories with icons and colors
- **Analytics Dashboard**: Visual charts and insights into spending patterns
- **Multi-Currency**: Support for BRL, USD, EUR, PYG, ARS, JPY, GBP with real-time conversion

### Technical Features
- **Proactive Exchange Rate Caching**: Scheduled background jobs fetch rates twice daily (6 AM & 6 PM)
- **Resilient API Calls**: 5 retry attempts with exponential backoff (up to 10s delay)
- **Health Metrics**: Comprehensive logging for monitoring system performance
- **Stale-While-Revalidate**: 7-day cache TTL ensures availability even during API outages
- **JWT Authentication**: Secure user sessions with 7-day token expiration
- **Rate Limiting**: Protection against brute-force attacks and API abuse
  - Global: 20 requests/minute
  - Login: 5 attempts/minute
  - Register: 3 attempts/minute
- **Input Validation**: Comprehensive validation using Zod and class-validator

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 10.0 with TypeScript 5.1
- **Database**: MongoDB 8.21 with Mongoose ODM
- **Cache**: Redis 5.8 (ioredis client)
- **AI/ML**: LangChain 0.1.37 + Google Gemini API
- **Job Scheduling**: @nestjs/schedule with cron jobs
- **Authentication**: @nestjs/jwt with bcrypt
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest with 81 passing tests

### Frontend
- **Framework**: React 18.3 with TypeScript 5.6
- **Build Tool**: Vite 6.0
- **Styling**: Tailwind CSS 3.4
- **State Management**: TanStack Query (React Query) 5.90
- **Forms**: React Hook Form 7.53 with Zod validation
- **Charts**: Recharts 2.15
- **Icons**: Lucide React 0.469
- **Routing**: React Router DOM 6.26

### Infrastructure
- **Monorepo**: pnpm workspaces
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Deployment**: Azure VM (production-ready)

## �️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│  (Controllers, DTOs, Guards, Pipes)     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Application Layer               │
│        (Use Cases, Services)            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│            Domain Layer                 │
│    (Entities, Value Objects, Rules)     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Infrastructure Layer             │
│  (DB, Cache, External APIs, Schedulers) │
└─────────────────────────────────────────┘
```

### Monorepo Structure

```
smart-expense-analyzer/
├── apps/
│   ├── backend/          # NestJS REST API
│   └── frontend/         # React SPA
├── packages/
│   └── shared/          # Shared types & utilities
├── docker-compose.yml   # Local development
├── docker-compose.prod.yml  # Production config
└── pnpm-workspace.yaml  # Workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.0.0
- **Docker**: Latest stable version
- **Docker Compose**: Latest stable version

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CFBruna/smart-expense-analyzer.git
   cd smart-expense-analyzer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start infrastructure services**
   ```bash
   docker compose up -d mongodb redis
   ```

5. **Run development servers**
   ```bash
   pnpm dev
   ```

   This starts:
   - Backend API: http://localhost:3000
   - Frontend App: http://localhost:3001
   - Swagger Docs: http://localhost:3000/api/docs

### Quick Commands

```bash
# Development
pnpm dev              # Start all services in watch mode
pnpm build            # Build all applications
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm format           # Format code with Prettier

# Backend only
cd apps/backend
pnpm dev             # Start backend in watch mode
pnpm test            # Run backend tests
pnpm test:cov        # Run tests with coverage

# Frontend only
cd apps/frontend
pnpm dev             # Start frontend dev server
pnpm build           # Build for production
pnpm preview         # Preview production build
```

## 📁 Project Structure

### Backend Structure
```
apps/backend/src/
├── application/          # Use cases & application services
│   └── use-cases/
│       ├── auth/        # Authentication flows
│       ├── expenses/    # Expense CRUD operations
│       ├── categories/  # Category management
│       └── analytics/   # Analytics generation
├── domain/              # Domain entities & business logic
│   ├── entities/
│   ├── repositories/    # Repository interfaces
│   └── value-objects/
├── infrastructure/      # External services & implementations
│   ├── database/        # MongoDB repositories
│   ├── cache/          # Redis service
│   ├── ai/             # LangChain AI service
│   ├── services/       # Exchange rate service
│   └── schedulers/     # Background jobs
└── presentation/        # API layer
    ├── controllers/    # REST controllers
    ├── dtos/          # Data transfer objects
    └── guards/        # Auth guards
```

### Frontend Structure
```
apps/frontend/src/
├── application/         # Application logic
│   ├── hooks/          # Custom React hooks
│   └── services/       # API service layer
├── domain/             # Domain models
│   └── entities/       # Frontend entities
├── infrastructure/     # External integrations
│   └── api/           # Axios configuration
└── presentation/       # UI components
    ├── components/     # Reusable components
    └── pages/         # Page components
```

## 📚 API Documentation

### Authentication
```http
POST   /auth/register      # Register new user
POST   /auth/login         # Login and get JWT token
```

### Expenses
```http
GET    /expenses           # List all expenses (with pagination & filters)
POST   /expenses           # Create new expense
GET    /expenses/:id       # Get expense by ID
PATCH  /expenses/:id       # Update expense
DELETE /expenses/:id       # Delete expense
```

### Categories
```http
GET    /categories         # List all categories
POST   /categories         # Create new category
PATCH  /categories/:id     # Update category
DELETE /categories/:id     # Delete category
```

### Analytics
```http
GET    /analytics          # Get spending analytics
```

### Exchange Rates
```http
GET    /exchange-rates     # Get exchange rate
GET    /dev/prefetch-rates # Manually trigger rate prefetch (dev only)
```

#### Dev Endpoint Usage
To manually trigger the exchange rate prefetch and view health metrics:

```bash
# Option 1: cURL
curl http://localhost:3000/dev/prefetch-rates

# Option 2: Browser
# Visit: http://localhost:3000/dev/prefetch-rates

# Option 3: Swagger UI
# Visit: http://localhost:3000/api/docs > dev tag
```

**Response:**
```json
{
  "message": "Exchange rates prefetch completed successfully"
}
```

**Health Metrics** (visible in backend terminal logs):
```
========================================
EXCHANGE RATE PREFETCH HEALTH METRICS
========================================
Total Duration: 15.24s
Total Pairs Attempted: 24
✓ Successful: 24 (100.0%)
✗ Failed: 0 (0.0%)
🔄 Retries Needed: 0
🎉 PERFECT: 100% success rate!
========================================
```

> **Note**: Health metrics appear in the backend terminal logs, not in the HTTP response.

### User Profile
```http
GET    /user/profile       # Get user profile
PATCH  /user/profile       # Update user profile
```

> **Full API Documentation**: Available at http://localhost:3000/api/docs (Swagger UI)

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/expense_analyzer
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here_minimum_32_chars
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Backend tests only
cd apps/backend
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:cov          # With coverage report

# Frontend tests
cd apps/frontend
pnpm test
```

### Test Coverage

Current backend test coverage:
- **Total Tests**: 81 passing
- **Coverage**: ~85% (application layer)
- **Frameworks**: Jest + Supertest

### E2E Tests

End-to-end testing with **Cypress 15.9.0**:

```bash
# Run E2E tests (headless)
cd apps/frontend
pnpm test:e2e

# Open Cypress GUI
cd apps/frontend
pnpm test:e2e:open
```

**Coverage**: 20 E2E tests across 4 suites
- **Authentication** (5 tests): login, logout, validation
- **Analytics** (7 tests): dashboard, statistics, charts, filters
- **Expenses** (5 tests): CRUD, navigation, filters
- **Multi-currency** (3 tests): selector, menu display

All tests are **language-agnostic** (PT/EN/ES) and pass in ~34 seconds.

## 🚢 Deployment

### Production Build

```bash
# Build all applications
pnpm build

# Or build individually
cd apps/backend && pnpm build
cd apps/frontend && pnpm build
```

### Docker Production

```bash
# Build and start production containers
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop containers
docker compose -f docker-compose.prod.yml down
```

### Azure Deployment

The application is configured for deployment on Azure VM with:
- Nginx as reverse proxy
- Docker containers for backend services
- Static file serving for frontend
- SSL/TLS termination
- Health checks and monitoring

Refer to `docker-compose.prod.yml` for production configuration.

## 🎨 Key Implementation Highlights

### 1. AI-Powered Categorization
Uses LangChain with Google Gemini to analyze expense descriptions and suggest appropriate categories:
```typescript
// Automatically suggests: "Shopping"
createExpense({ description: "Bought groceries at supermarket", amount: 150 })
```

### 2. Proactive Exchange Rate Caching
Background scheduler runs twice daily to prefetch all currency pairs:
- **Schedule**: 6:00 AM and 6:00 PM (configurable cron)
- **Currencies**: 24 pairs (BRL, USD, EUR, PYG, ARS, JPY, GBP)
- **Resilience**: 5 retry attempts with exponential backoff
- **Cache TTL**: 7 days with stale-while-revalidate
- **Health Metrics**: Detailed logging for monitoring

### 3. Clean Architecture Benefits
- **Testability**: Business logic independent of frameworks
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features without breaking existing code
- **Technology Agnostic**: Can swap databases, frameworks with minimal changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using Clean Architecture principles**
