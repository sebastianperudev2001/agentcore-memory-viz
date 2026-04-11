from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
import fastapi_swagger_dark as fsd
from api.routers import agent_runtimes, memories, sessions, events, memory_records, actors


app = FastAPI(
    title="AgentCore Memory Viz API",
    description="Open source visualizer for Amazon Bedrock AgentCore Memory",
    version="0.1.0",
    docs_url=None,  # Disable default docs to register custom dark mode docs
)

docs_router = APIRouter()
fsd.install(docs_router, swagger_ui_parameters={"syntaxHighlight.theme": "nord"})
app.include_router(docs_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(memories.router)
app.include_router(sessions.router)
app.include_router(events.router)
app.include_router(memory_records.router)
app.include_router(actors.router)
app.include_router(agent_runtimes.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
