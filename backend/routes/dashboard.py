from fastapi import APIRouter, Depends
from backend.security import get_current_user, get_current_admin, require_role
from sqlalchemy import text
from backend.database import engine

router = APIRouter()


@router.get("/")
def dashboard_stats():

    with engine.connect() as conn:

        total_requests = conn.execute(
            text("SELECT COUNT(*) FROM assistance_requests")
        ).scalar()

        pending_requests = conn.execute(
            text("SELECT COUNT(*) FROM assistance_requests WHERE status = 'pending'")
        ).scalar()

        processing_requests = conn.execute(
            text("SELECT COUNT(*) FROM assistance_requests WHERE status = 'processing'")
        ).scalar()

        completed_requests = conn.execute(
            text("SELECT COUNT(*) FROM assistance_requests WHERE status = 'completed'")
        ).scalar()

        total_users = conn.execute(
            text("SELECT COUNT(*) FROM users")
        ).scalar()

        total_resources = conn.execute(
            text("SELECT COUNT(*) FROM resources")
        ).scalar()

    return {
        "total_requests":      total_requests,
        "pending_requests":    pending_requests,
        "processing_requests": processing_requests,
        "completed_requests":  completed_requests,
        "total_users":         total_users,
        "total_resources":     total_resources
    }
