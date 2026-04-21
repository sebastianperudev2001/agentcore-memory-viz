# Architecture Documentation

## System Overview

**AgentCore Memory Viz** is a full-stack developer tool for inspecting and debugging Amazon Bedrock AgentCore Memory. It exposes a visual interface to browse, search, trace, and insert agent memories across sessions — without relying on the AWS Console.

## Architecture Style

- **Frontend**: Next.js App Router (SSR + client components)
- **Backend**: FastAPI with Domain-Driven Design (DDD)
- **AWS**: Bedrock AgentCore Memory API via boto3 + official SDK
- **Caching**: Local disk cache (diskcache, 5-min TTL)
- **Containerization**: Docker Compose for local development

## Layer Diagram

```
┌─────────────────────────────────────────────┐
│              Next.js Frontend               │
│  Components → Hooks → API Client (fetch)    │
└──────────────────┬──────────────────────────┘
                   │ HTTP (localhost:8000)
┌──────────────────▼──────────────────────────┐
│              FastAPI Backend                │
│  Routers → Services → Repository → AWS SDK  │
└──────────────────┬──────────────────────────┘
                   │ boto3 / bedrock-agentcore SDK
┌──────────────────▼──────────────────────────┐
│          AWS Bedrock AgentCore              │
│         Memory API (Cloud)                  │
└─────────────────────────────────────────────┘
```

## Backend DDD Layers

| Layer | Responsibility | Key Files |
|---|---|---|
| Domain | Pure entity models, no external deps | `domain/event.py`, `domain/session.py` |
| Application | Use cases, orchestration | `application/event_service.py`, `application/session_service.py` |
| Infrastructure | AWS client, caching | `infrastructure/agentcore_client.py` |
| API | HTTP routing, request/response DTOs | `api/routers/`, `api/schemas.py` |

## Frontend Architecture

| Layer | Files |
|---|---|
| Pages (App Router) | `app/memories/`, `app/memories/[id]/sessions/[sessionId]/` |
| Components | `components/event/`, `components/session/`, `components/memory/` |
| Custom Hooks | `hooks/useEvents.ts`, `hooks/useSessions.ts`, `hooks/useMemories.ts` |
| API Client | `lib/api/events.ts`, `lib/api/sessions.ts`, `lib/api/memories.ts` |
| Types | `types/index.ts` |
