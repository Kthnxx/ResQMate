from fastapi import APIRouter
from sqlalchemy import text
from database import engine

router = APIRouter()


# DASHBOARD STATISTICS
@router.get("/")
def dashboard_stats():

    with engine.connect() as conn:

        # Total assistance requests
        total_requests = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM assistance_requests
            """)
        ).scalar()

        # Pending requests
        pending_requests = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM assistance_requests
                WHERE status = 'Pending'
            """)
        ).scalar()

        # Accepted requests
        accepted_requests = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM assistance_requests
                WHERE status = 'Accepted'
            """)
        ).scalar()

        # Total registered users
        total_users = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM users
            """)
        ).scalar()

        # Total resource types
        total_resources = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM resources
            """)
        ).scalar()

    return {
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "accepted_requests": accepted_requests,
        "total_users": total_users,
        "total_resources": total_resources
    }