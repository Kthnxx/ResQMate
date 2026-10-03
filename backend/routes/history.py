from fastapi import APIRouter, Depends
from backend.security import get_current_user, get_current_admin, require_role
from sqlalchemy import text
from backend.database import engine

router = APIRouter()


@router.get("/{request_id}")
def get_request_history(request_id: int, user: dict = Depends(get_current_user)):

    query = text("""
        SELECT *
        FROM request_status_history
        WHERE request_id = :request_id
        ORDER BY updated_at ASC
    """)

    with engine.connect() as conn:
        result = conn.execute(
            query,
            {"request_id": request_id}
        )

        history = []

        for row in result:
            history.append({
                "history_id": row.history_id,
                "request_id": row.request_id,
                "updated_by": row.updated_by,
                "status": row.status,
                "remarks": row.remarks,
                "updated_at": str(row.updated_at)
            })

        return history


@router.post("/create")
def create_history(request_id: int, updated_by: int, status: str, remarks: str, user: dict = Depends(get_current_user)):

    query = text("""
        INSERT INTO request_status_history
        (
            request_id,
            updated_by,
            status,
            remarks
        )
        VALUES
        (
            :request_id,
            :updated_by,
            :status,
            :remarks
        )
    """)

    with engine.begin() as conn:
        conn.execute(
            query,
            {
                "request_id": request_id,
                "updated_by": updated_by,
                "status": status,
                "remarks": remarks
            }
        )

    return {
        "message": "History Record Created"
    }