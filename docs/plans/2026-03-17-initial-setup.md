# AgentCore Memory Viz — Initial Setup Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bootstrap the full monorepo (Next.js 15 frontend + FastAPI backend) with testing frameworks, CI, and push the first commit to GitHub.

**Architecture:** Monorepo with `frontend/` (Next.js 15 App Router + Cloudscape) and `backend/` (FastAPI + UV). Backend follows DDD layering: api → application → domain → infrastructure. Frontend follows feature-based structure under `app/`.

**Tech Stack:** Next.js 15, TypeScript, Cloudscape Design System, Jest, React Testing Library, Playwright + Cucumber.js (BDD/E2E), FastAPI, UV, pytest, pytest-bdd, GitHub Actions, Docker Compose.

---

## Task 1: Initialize git + project root files

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Create: `docker-compose.yml`

**Step 1: Initialize git**

```bash
cd /Users/sebastianchavarry01/Documents/agentcore-memory-viz
git init
git branch -M main
```

**Step 2: Create root `.gitignore`**

```
# Python
__pycache__/
*.py[cod]
.venv/
*.egg-info/
dist/
.env
.env.*

# Node
node_modules/
.next/
out/
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Test artifacts
coverage/
.coverage
htmlcov/
playwright-report/
test-results/
```

**Step 3: Create `README.md`**

```markdown
# agentcore-memory-viz

Open source visualizer for Amazon Bedrock AgentCore Memory.

## Features
- Memory Browser: list, filter, and search memories by agent/session
- Session Trace: step through a conversation and inspect memory reads/writes

## Stack
- Frontend: Next.js 15 + Cloudscape Design System
- Backend: FastAPI + UV

## Getting Started
See `frontend/README.md` and `backend/README.md`.
```

**Step 4: Create `docker-compose.yml`**

```yaml
version: "3.9"
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - AWS_PROFILE=${AWS_PROFILE:-default}
      - AWS_REGION=${AWS_REGION:-us-east-1}
    volumes:
      - ~/.aws:/root/.aws:ro
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
```

**Step 5: Commit**

```bash
git add .gitignore README.md docker-compose.yml
git commit -m "chore: initial project structure"
```

---

## Task 2: Initialize Next.js 15 frontend

**Files:**
- Create: `frontend/` (via `create-next-app`)

**Step 1: Scaffold Next.js app**

```bash
cd /Users/sebastianchavarry01/Documents/agentcore-memory-viz
npx create-next-app@latest frontend \
  --typescript \
  --app \
  --no-tailwind \
  --eslint \
  --src-dir \
  --import-alias "@/*"
```

**Step 2: Install Cloudscape Design System**

```bash
cd frontend
npm install @cloudscape-design/components @cloudscape-design/global-styles
```

**Step 3: Create frontend directory structure**

```bash
mkdir -p src/components/memory
mkdir -p src/components/session
mkdir -p src/lib/api
mkdir -p src/lib/utils
mkdir -p src/hooks
mkdir -p src/types
mkdir -p tests/unit
mkdir -p tests/e2e
mkdir -p tests/features
```

**Step 4: Create `src/types/index.ts`**

```typescript
export interface Memory {
  id: string;
  agentId: string;
  sessionId?: string;
  content: string;
  createdAt: string;
  type: string;
}

export interface Session {
  id: string;
  agentId: string;
  startedAt: string;
  turns: SessionTurn[];
}

export interface SessionTurn {
  index: number;
  input: string;
  output: string;
  memoriesRead: Memory[];
  memoriesWritten: Memory[];
}
```

**Step 5: Update `src/app/layout.tsx` with Cloudscape AppLayout**

```tsx
import "@cloudscape-design/global-styles/index.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Step 6: Commit**

```bash
cd /Users/sebastianchavarry01/Documents/agentcore-memory-viz
git add frontend/
git commit -m "feat(frontend): scaffold Next.js 15 app with Cloudscape"
```

---

## Task 3: Set up Jest + React Testing Library

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/jest.config.ts`
- Create: `frontend/jest.setup.ts`
- Create: `frontend/tests/unit/example.test.tsx`

**Step 1: Install dependencies**

```bash
cd frontend
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest
```

**Step 2: Create `jest.config.ts`**

```typescript
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  testMatch: ["**/tests/unit/**/*.test.(ts|tsx)"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
};

export default config;
```

**Step 3: Create `jest.setup.ts`**

```typescript
import "@testing-library/jest-dom";
```

**Step 4: Write a smoke test**

```typescript
// tests/unit/example.test.tsx
import { render, screen } from "@testing-library/react";

function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

test("renders greeting", () => {
  render(<Greeting name="AgentCore" />);
  expect(screen.getByText("Hello, AgentCore")).toBeInTheDocument();
});
```

**Step 5: Run test to verify it passes**

```bash
cd frontend
npx jest --testPathPattern=unit
```

Expected: PASS

**Step 6: Add scripts to `package.json`**

```json
{
  "scripts": {
    "test:unit": "jest --testPathPattern=unit --coverage",
    "test:e2e": "playwright test"
  }
}
```

**Step 7: Commit**

```bash
cd /Users/sebastianchavarry01/Documents/agentcore-memory-viz
git add frontend/
git commit -m "feat(frontend): add Jest + RTL testing setup"
```

---

## Task 4: Set up Playwright + Cucumber (BDD/E2E)

**Files:**
- Create: `frontend/playwright.config.ts`
- Create: `frontend/tests/features/memory-browser.feature`
- Create: `frontend/tests/e2e/steps/memory-browser.steps.ts`

**Step 1: Install Playwright + Cucumber**

```bash
cd frontend
npm install -D @playwright/test @cucumber/cucumber @cucumber/html-formatter
npx playwright install chromium
```

**Step 2: Create `playwright.config.ts`**

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
  },
  reporter: [["html", { outputFolder: "playwright-report" }]],
});
```

**Step 3: Create a Gherkin feature file**

```gherkin
# tests/features/memory-browser.feature
Feature: Memory Browser
  As a developer debugging my agent
  I want to browse memories stored by my agent
  So that I can understand what my agent has remembered

  Scenario: View list of memories
    Given I am on the Memory Browser page
    When the page loads
    Then I should see a list of memories
```

**Step 4: Create step definitions scaffold**

```typescript
// tests/e2e/steps/memory-browser.steps.ts
import { test, expect } from "@playwright/test";

test("View list of memories", async ({ page }) => {
  await page.goto("/memories");
  await expect(page.getByRole("heading", { name: /memories/i })).toBeVisible();
});
```

**Step 5: Commit**

```bash
cd /Users/sebastianchavarry01/Documents/agentcore-memory-viz
git add frontend/
git commit -m "feat(frontend): add Playwright + Cucumber E2E setup"
```

---

## Task 5: Initialize FastAPI backend with UV

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/main.py`
- Create: `backend/domain/memory.py`
- Create: `backend/domain/session.py`
- Create: `backend/application/memory_service.py`
- Create: `backend/application/session_service.py`
- Create: `backend/infrastructure/agentcore_client.py`
- Create: `backend/infrastructure/cache.py`
- Create: `backend/api/routers/memories.py`
- Create: `backend/api/routers/sessions.py`
- Create: `backend/api/schemas.py`
- Create: `backend/Dockerfile`

**Step 1: Initialize UV project**

```bash
cd /Users/sebastianchavarry01/Documents/agentcore-memory-viz
mkdir backend && cd backend
uv init --name agentcore-memory-viz-backend
uv add fastapi uvicorn boto3 pydantic diskcache
uv add --dev pytest pytest-asyncio pytest-bdd httpx
```

**Step 2: Create domain entities**

```python
# backend/domain/memory.py
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Memory:
    id: str
    agent_id: str
    content: str
    memory_type: str
    created_at: datetime
    session_id: str | None = None
```

```python
# backend/domain/session.py
from dataclasses import dataclass
from datetime import datetime
from .memory import Memory

@dataclass
class SessionTurn:
    index: int
    user_input: str
    agent_output: str
    memories_read: list[Memory]
    memories_written: list[Memory]

@dataclass
class Session:
    id: str
    agent_id: str
    started_at: datetime
    turns: list[SessionTurn]
```

**Step 3: Create infrastructure layer**

```python
# backend/infrastructure/agentcore_client.py
import boto3
from domain.memory import Memory
from datetime import datetime

class AgentCoreRepository:
    def __init__(self, region: str = "us-east-1"):
        self.client = boto3.client("bedrock-agentcore", region_name=region)

    async def list_memories(self, agent_id: str) -> list[Memory]:
        response = self.client.list_memories(agentId=agent_id)
        return [
            Memory(
                id=m["memoryId"],
                agent_id=agent_id,
                content=m["content"],
                memory_type=m["memoryType"],
                created_at=datetime.fromisoformat(m["createdAt"]),
            )
            for m in response.get("memories", [])
        ]
```

```python
# backend/infrastructure/cache.py
import diskcache
import json
from pathlib import Path

CACHE_DIR = Path.home() / ".agentcore-memory-viz" / "cache"

class DiskCache:
    def __init__(self):
        self.cache = diskcache.Cache(str(CACHE_DIR))

    def get(self, key: str):
        return self.cache.get(key)

    def set(self, key: str, value, ttl: int = 300):
        self.cache.set(key, value, expire=ttl)
```

**Step 4: Create application service**

```python
# backend/application/memory_service.py
from domain.memory import Memory
from infrastructure.agentcore_client import AgentCoreRepository
from infrastructure.cache import DiskCache

class MemoryService:
    def __init__(self, repo: AgentCoreRepository, cache: DiskCache):
        self.repo = repo
        self.cache = cache

    async def list_memories(self, agent_id: str) -> list[Memory]:
        cache_key = f"memories:{agent_id}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        memories = await self.repo.list_memories(agent_id)
        self.cache.set(cache_key, memories)
        return memories
```

**Step 5: Create API router + schemas**

```python
# backend/api/schemas.py
from pydantic import BaseModel
from datetime import datetime

class MemoryResponse(BaseModel):
    id: str
    agent_id: str
    content: str
    memory_type: str
    created_at: datetime
    session_id: str | None = None
```

```python
# backend/api/routers/memories.py
from fastapi import APIRouter
from api.schemas import MemoryResponse
from application.memory_service import MemoryService
from infrastructure.agentcore_client import AgentCoreRepository
from infrastructure.cache import DiskCache

router = APIRouter(prefix="/memories", tags=["memories"])

def get_service() -> MemoryService:
    return MemoryService(AgentCoreRepository(), DiskCache())

@router.get("/", response_model=list[MemoryResponse])
async def list_memories(agent_id: str):
    service = get_service()
    memories = await service.list_memories(agent_id)
    return [MemoryResponse(**m.__dict__) for m in memories]
```

**Step 6: Create `main.py`**

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import memories, sessions

app = FastAPI(title="AgentCore Memory Viz API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(memories.router)
```

**Step 7: Verify it starts**

```bash
cd backend
uv run uvicorn main:app --reload
```

Expected: `INFO: Uvicorn running on http://127.0.0.1:8000`

**Step 8: Commit**

```bash
cd /Users/sebastianchavarry01/Documents/agentcore-memory-viz
git add backend/
git commit -m "feat(backend): scaffold FastAPI + UV with DDD structure"
```

---

## Task 6: Set up pytest + pytest-bdd

**Files:**
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/unit/test_memory_service.py`
- Create: `backend/tests/features/list_memories.feature`
- Create: `backend/tests/features/steps/test_list_memories.py`
- Create: `backend/pytest.ini`

**Step 1: Create `pytest.ini`**

```ini
[pytest]
asyncio_mode = auto
testpaths = tests
```

**Step 2: Write unit test for MemoryService**

```python
# backend/tests/unit/test_memory_service.py
import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime
from application.memory_service import MemoryService
from domain.memory import Memory

@pytest.fixture
def mock_memory():
    return Memory(
        id="mem-1",
        agent_id="agent-123",
        content="User prefers concise answers",
        memory_type="SEMANTIC",
        created_at=datetime(2026, 3, 17),
    )

@pytest.mark.asyncio
async def test_list_memories_returns_cached(mock_memory):
    repo = AsyncMock()
    cache = MagicMock()
    cache.get.return_value = [mock_memory]

    service = MemoryService(repo, cache)
    result = await service.list_memories("agent-123")

    assert len(result) == 1
    assert result[0].id == "mem-1"
    repo.list_memories.assert_not_called()

@pytest.mark.asyncio
async def test_list_memories_calls_repo_on_cache_miss(mock_memory):
    repo = AsyncMock()
    repo.list_memories.return_value = [mock_memory]
    cache = MagicMock()
    cache.get.return_value = None

    service = MemoryService(repo, cache)
    result = await service.list_memories("agent-123")

    assert len(result) == 1
    repo.list_memories.assert_called_once_with("agent-123")
    cache.set.assert_called_once()
```

**Step 3: Run unit tests**

```bash
cd backend
uv run pytest tests/unit -v
```

Expected: 2 PASSED

**Step 4: Create BDD feature file**

```gherkin
# backend/tests/features/list_memories.feature
Feature: List Memories
  Scenario: Return cached memories when available
    Given a cached list of memories for agent "agent-123"
    When I request memories for agent "agent-123"
    Then I receive 1 memory without calling AgentCore

  Scenario: Fetch from AgentCore on cache miss
    Given no cached memories for agent "agent-123"
    And AgentCore has 2 memories for agent "agent-123"
    When I request memories for agent "agent-123"
    Then I receive 2 memories from AgentCore
```

**Step 5: Commit**

```bash
cd /Users/sebastianchavarry01/Documents/agentcore-memory-viz
git add backend/
git commit -m "test(backend): add pytest + pytest-bdd setup with unit tests"
```

---

## Task 7: Set up GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create CI workflow**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  frontend-tests:
    name: Frontend Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - name: Unit tests
        run: npm run test:unit -- --coverage
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: E2E tests
        run: npm run test:e2e
        continue-on-error: true  # E2E requires running server; wire up later

  backend-tests:
    name: Backend Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
        with:
          version: "latest"
      - run: uv sync
      - name: Run pytest
        run: uv run pytest tests/unit -v --tb=short
```

**Step 2: Commit**

```bash
cd /Users/sebastianchavarry01/Documents/agentcore-memory-viz
git add .github/
git commit -m "ci: add GitHub Actions workflow for frontend and backend tests"
```

---

## Task 8: Create GitHub repo and push

**Step 1: Create public repo on GitHub**

```bash
gh repo create agentcore-memory-viz \
  --public \
  --description "Open source visualizer for Amazon Bedrock AgentCore Memory" \
  --source=. \
  --remote=origin \
  --push
```

Expected: repo created at `https://github.com/sebastianperudev2001/agentcore-memory-viz`

---
