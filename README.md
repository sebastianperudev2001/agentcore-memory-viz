# AgentCore Memory Viz

> Open source developer tool for inspecting and debugging Amazon Bedrock AgentCore Memory — because the AWS Console doesn't give you this.

[![CI](https://github.com/sebastianperudev2001/agentcore-memory-viz/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastianperudev2001/agentcore-memory-viz/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## What is this?

Amazon Bedrock AgentCore Memory lets your AI agents remember things across sessions. But once memories are stored, AWS gives you no visual interface to inspect them.

**AgentCore Memory Viz** fills that gap — a local developer tool that connects to your AWS credentials and lets you browse, search, and trace exactly what your agent has remembered and when.

---

## Features

- **Memory Browser** — list, filter, and search all memories for any agent, sorted by type and recency
- **Session Trace** — step through a past conversation turn-by-turn and see which memories were read or written at each step
- **Local caching** — responses are cached locally so you can explore without hammering the AWS API
- **AWS credential-aware** — reads from your standard `~/.aws/credentials` or environment variables, no config required

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Cloudscape Design System |
| Backend | FastAPI, Python 3.12, UV |
| Testing (frontend) | Jest + React Testing Library, Playwright + Cucumber.js |
| Testing (backend) | pytest, pytest-bdd |
| CI | GitHub Actions |
| Local dev | Docker Compose |

---

## Prerequisites

- Node.js 20+
- Python 3.12+ (or Docker)
- [UV](https://docs.astral.sh/uv/) — Python package manager
- AWS credentials configured (`aws configure` or environment variables)
- AWS account with Bedrock AgentCore enabled

---

## Getting Started

### Option 1: Docker Compose (recommended)

```bash
git clone https://github.com/sebastianperudev2001/agentcore-memory-viz.git
cd agentcore-memory-viz
docker-compose up
```

Open http://localhost:3000

### Option 2: Run locally

**Backend:**
```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

**Frontend** (in a separate terminal):
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Environment variables

The frontend reads `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).

The backend reads standard AWS environment variables:
```bash
AWS_PROFILE=my-profile        # or use AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
AWS_REGION=us-east-1
```

---

## Project Structure

```
agentcore-memory-viz/
├── frontend/                  # Next.js 16 App Router
│   ├── src/
│   │   ├── app/               # Pages (memories/, sessions/)
│   │   ├── components/        # Cloudscape UI components
│   │   ├── lib/api/           # API client (fetch wrappers)
│   │   ├── hooks/             # Custom React hooks
│   │   └── types/             # Shared TypeScript interfaces
│   └── tests/
│       ├── unit/              # Jest + RTL
│       ├── e2e/               # Playwright specs
│       └── features/          # Gherkin .feature files
│
├── backend/                   # FastAPI + DDD
│   ├── domain/                # Entities (Memory, Session) — no dependencies
│   ├── application/           # Use cases (MemoryService, SessionService)
│   ├── infrastructure/        # AWS AgentCore client + disk cache
│   ├── api/                   # FastAPI routers + Pydantic schemas
│   └── tests/
│       ├── unit/              # pytest
│       └── features/          # pytest-bdd + Gherkin
│
├── .github/workflows/ci.yml   # CI: runs all tests on push/PR
└── docker-compose.yml         # Local dev orchestration
```

---

## Running Tests

**Frontend unit tests:**
```bash
cd frontend && npm run test:unit
```

**Frontend E2E tests** (requires running dev server):
```bash
cd frontend && npm run test:e2e
```

**Backend tests:**
```bash
cd backend && uv run pytest tests/ -v
```

---

## Contributing

Contributions are welcome. Please open an issue before submitting a PR to align on scope.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Follow the dev workflow documented in [CLAUDE.md](CLAUDE.md)
4. Open a pull request against `main`

---

## License

MIT — see [LICENSE](LICENSE).
