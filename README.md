# Smart Expense Analyzer 💰🤖

AI-powered expense management system using NestJS, React, and Clean Architecture.

## 🚀 Features

- **AI Categorization**: Automatically categorizes expenses using Google Gemini + LangChain.
- **Clean Architecture**: Domain-driven design in both backend and frontend.
- **Analytics Dashboard**: Visual insights into spending habits.
- **Monorepo**: Efficiently managed with pnpm workspaces.
- **Dockerized**: Ready for production deployment on Azure.

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeScript, MongoDB, Redis, LangChain
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Infrastructure**: Docker, Nginx, Azure VM

## 🏃 Quick Start

### Prerequisites
- Node.js 20+
- pnpm
- Docker & Docker Compose

### Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start infrastructure (DBs):
   ```bash
   docker compose up -d mongodb redis
   ```

3. Run development mode:
   ```bash
   pnpm dev
   ```

## 🏗️ Architecture

See `implementation_plan.md` for detailed architecture diagrams.

## 📄 License

MIT
