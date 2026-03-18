from fastapi import APIRouter


router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/{session_id}/trace")
async def get_session_trace(session_id: str):
    # Placeholder for session trace
    return {"session_id": session_id, "turns": []}
