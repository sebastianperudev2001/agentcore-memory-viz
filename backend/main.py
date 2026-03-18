from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import memories, sessions


app = FastAPI(
    title="AgentCore Memory Viz API",
    description="Open source visualizer for Amazon Bedrock AgentCore Memory",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(memories.router)
app.include_router(sessions.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
