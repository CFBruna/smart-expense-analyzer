# Smart Expense Analyzer

### Controle financeiro com categorização por IA

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

Aplicação fullstack para controle de finanças pessoais com categorização automática de despesas usando IA e suporte a múltiplas moedas com conversão em tempo real.

---

## Funcionalidades

- Lançamento de despesas com categorização automática via Google Gemini e LangChain.
- Suporte a múltiplas moedas (BRL, USD, EUR, PYG, ARS, JPY, GBP) com cache proativo de taxas de câmbio.
- Dashboard analítico com gráficos interativos de receitas e despesas.
- Autenticação JWT com proteção contra força bruta.

---

## Stack

- TypeScript
- NestJS
- React
- MongoDB
- Redis
- LangChain
- Google Gemini
- Tailwind CSS
- Docker

---

## Qualidade

- 88 testes no backend (Jest)
- 20 testes E2E (Cypress)
- GitHub Actions

---

## Como Executar Localmente

### Pré-requisitos
- Node.js >= 20
- pnpm >= 8
- Docker

### Inicialização

```bash
git clone https://github.com/CFBruna/smart-expense-analyzer.git
cd smart-expense-analyzer
cp .env.example .env
pnpm install
docker compose up -d mongodb redis
pnpm dev
```

### Acessos Locais
- **API:** http://localhost:3000
- **Frontend:** http://localhost:3001
- **Swagger:** http://localhost:3000/api/docs

---

## 🧪 Testes

```bash
pnpm test                 # Todos os testes
cd apps/backend && pnpm test:cov   # Backend com cobertura
cd apps/frontend && pnpm test:e2e  # Testes E2E
```

---

## 📄 Licença

MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.