# CLAUDE.md — AgentCore Memory Viz

This file documents the development workflow, architecture conventions, and practices for this project. Claude Code reads this file automatically at the start of every session.

---

## Project Overview

**agentcore-memory-viz** is an open source developer tool for inspecting Amazon Bedrock AgentCore Memory. It provides a Memory Browser and a Session Trace viewer — features the AWS Console does not offer.

- **Frontend:** `frontend/` — Next.js 16, App Router, TypeScript, Cloudscape Design System
- **Backend:** `backend/` — FastAPI, UV, Python 3.12, DDD architecture
- **GitHub:** https://github.com/sebastianperudev2001/agentcore-memory-viz

---

## Architecture

### Backend — Domain-Driven Design (DDD)

The backend follows DDD with strict layer separation. The dependency flow is one-directional:

```
api/ → application/ → domain/
              ↓
       infrastructure/
```

| Layer | Directory | Responsibility |
|---|---|---|
| API | `api/routers/`, `api/schemas.py` | HTTP endpoints, Pydantic request/response models |
| Application | `application/` | Use cases — orchestrate domain + infrastructure |
| Domain | `domain/` | Pure Python dataclasses — entities with no external dependencies |
| Infrastructure | `infrastructure/` | boto3 AgentCore client, diskcache SQLite layer |

**Rule:** Domain entities (`domain/`) must never import from `application/`, `infrastructure/`, or `api/`. They are pure Python with no external dependencies.

### Frontend — Feature-based structure

```
src/
├── app/              # Next.js App Router pages
│   ├── memories/     # Memory Browser page
│   └── sessions/     # Session Trace page
├── components/       # Cloudscape-based UI components, split by feature
├── lib/api/          # Typed fetch wrappers to FastAPI backend
├── hooks/            # Custom React hooks
└── types/            # Shared TypeScript interfaces (Memory, Session, SessionTurn)
```

**Rule:** Components do not call the API directly — they use hooks. Hooks call `lib/api/`. This keeps components testable in isolation.

---

## Python Compatibility

The system may run Python 3.9. All backend Python files must:

1. Include `from __future__ import annotations` at the top
2. Use `Optional[T]` and `List[T]` from `typing` instead of `T | None` or `list[T]`

Example:
```python
from __future__ import annotations
from typing import Optional, List

def get_memory(id: str) -> Optional[Memory]:
    ...
```

---

## Development Methodologies

### TDD (Test-Driven Development)
Write the failing test first, then write the minimum code to make it pass. This applies to both frontend (Jest) and backend (pytest).

### BDD (Behavior-Driven Development)
User-facing behaviors are described in Gherkin `.feature` files before implementation:
- Frontend: `frontend/tests/features/*.feature` — run via Playwright
- Backend: `backend/tests/features/*.feature` — run via pytest-bdd

### DDD (Domain-Driven Design)
Business concepts live in `domain/`. Use cases live in `application/`. Infrastructure details (AWS, cache) are isolated in `infrastructure/`. The API layer is thin — it delegates to application services.

---

## Testing

### Frontend

| Type | Framework | Location | Command |
|---|---|---|---|
| Unit | Jest + React Testing Library | `frontend/tests/unit/` | `npm run test:unit` |
| E2E / BDD | Playwright + Cucumber.js | `frontend/tests/e2e/`, `tests/features/` | `npm run test:e2e` |

**Jest config:** `frontend/jest.config.ts` — uses `ts-jest`, jsdom environment, `setupFilesAfterEnv` loads `@testing-library/jest-dom`.

**Playwright config:** `frontend/playwright.config.ts` — targets `http://localhost:3000`, Chromium only, screenshots on failure.

### Backend

| Type | Framework | Location | Command |
|---|---|---|---|
| Unit | pytest + pytest-asyncio | `backend/tests/unit/` | `uv run pytest tests/unit -v` |
| BDD | pytest-bdd (Gherkin) | `backend/tests/features/` | `uv run pytest tests/ -v` |

**pytest config:** `backend/pytest.ini` — `asyncio_mode = auto`, `testpaths = tests`.

---

## Running Services Locally

**Backend:**
```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Both together:**
```bash
docker-compose up
```

**Health check:**
```bash
curl http://localhost:8000/health
# → {"status":"ok"}
```

---

## Git Workflow

- Default branch: `main`
- Feature branches: `feat/<feature-name>`
- Fix branches: `fix/<issue-description>`
- Commit message format: `type(scope): description`
  - Types: `feat`, `fix`, `test`, `ci`, `chore`, `docs`, `refactor`
  - Scopes: `frontend`, `backend`, `ci`, or omit for root-level changes
  - Examples: `feat(backend): add session trace endpoint`, `test(frontend): add memory browser BDD scenario`

**Never commit:**
- `.env` or `.env.local` files
- `node_modules/`, `.venv/`, `.next/`
- AWS credentials

---

## CI — GitHub Actions

Workflow: `.github/workflows/ci.yml`

- Triggers on push to `main`/`develop` and PRs to `main`
- `frontend-tests` job: `npm ci` → Jest unit tests → Playwright E2E
- `backend-tests` job: `uv sync` → `pytest tests/ -v`

Both jobs run in parallel. A failing unit test blocks merge. E2E tests run with `continue-on-error: true` until a test server is wired into CI.

---

## Adding New Features

1. Define the domain entity in `domain/` if a new concept is needed
2. Write a Gherkin `.feature` file describing the behavior
3. Write failing unit tests
4. Implement the use case in `application/`
5. Add infrastructure in `infrastructure/` if AWS or cache interaction is needed
6. Expose via `api/routers/`
7. Wire up the frontend: types → lib/api → hook → component → page
8. All tests green before opening a PR

---

## Dependencies

**Backend managed by UV** — edit `backend/pyproject.toml`, then run `uv sync`.

```bash
uv add <package>           # add runtime dependency
uv add --dev <package>     # add dev dependency
uv sync                    # install all dependencies
```

**Frontend managed by npm** — edit `frontend/package.json`, then run `npm install`.

```bash
npm install <package>      # add runtime dependency
npm install -D <package>   # add dev dependency
```
