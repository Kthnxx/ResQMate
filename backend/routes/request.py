from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from database import engine

router = APIRouter()


class CreateRequestData(BaseModel):
    user_id: int
    assistance_type: str
    location: str
    request_details: str
    priority: str


@router.get("/")
def get_requests():
    query = text("""
        SELECT *
        FROM assistance_requests
        ORDER BY request_id DESC
    """)

    with engine.connect() as conn:
        result = conn.execute(query)

        requests = []

        for row in result:
            requests.append({
                "request_id": row.request_id,
                "user_id": row.user_id,
                "category_id": row.category_id,
                "location_id": row.location_id,
                "request_details": row.request_details,
                "priority_level": row.priority_level,
                "status": row.status,
                "date_requested": str(row.date_requested)
            })

        return requests


@router.get("/{request_id}")
def get_request(request_id: int):
    query = text("""
        SELECT *
        FROM assistance_requests
        WHERE request_id = :request_id
    """)

    with engine.connect() as conn:
        result = conn.execute(
            query,
            {"request_id": request_id}
        )

        row = result.fetchone()

        if not row:
            raise HTTPException(
                status_code=404,
                detail="Request Not Found"
            )

        return {
            "request_id": row.request_id,
            "user_id": row.user_id,
            "category_id": row.category_id,
            "location_id": row.location_id,
            "request_details": row.request_details,
            "priority_level": row.priority_level,
            "status": row.status,
            "date_requested": str(row.date_requested)
        }


@router.post("/create")
def create_request(data: CreateRequestData):
    assistance_type = data.assistance_type.strip()
    location = data.location.strip()
    request_details = data.request_details.strip()
    priority = data.priority.strip()

    category_mapping = {
        "Food": "Food",
        "Water": "Water",
        "Shelter": "Shelter",
        "Medicine": "Medicine"
    }

    priority_mapping = {
        "Normal": "medium",
        "High": "high",
        "Critical": "critical"
    }

    if assistance_type not in category_mapping:
        raise HTTPException(
            status_code=400,
            detail="Invalid assistance type."
        )

    if priority not in priority_mapping:
        raise HTTPException(
            status_code=400,
            detail="Invalid priority level."
        )

    if not location:
        raise HTTPException(
            status_code=400,
            detail="Location is required."
        )

    if not request_details:
        raise HTTPException(
            status_code=400,
            detail="Request details are required."
        )

    category_name = category_mapping[assistance_type]
    database_priority = priority_mapping[priority]

    with engine.begin() as conn:
        user_result = conn.execute(
            text("""
                SELECT user_id
                FROM users
                WHERE user_id = :user_id
            """),
            {"user_id": data.user_id}
        ).fetchone()

        if not user_result:
            raise HTTPException(
                status_code=404,
                detail="User Not Found."
            )

        category_result = conn.execute(
            text("""
                SELECT category_id
                FROM categories
                WHERE LOWER(category_name) = LOWER(:category_name)
                LIMIT 1
            """),
            {"category_name": category_name}
        ).fetchone()

        if not category_result:
            conn.execute(
                text("""
                    INSERT INTO categories
                    (
                        category_name,
                        description
                    )
                    VALUES
                    (
                        :category_name,
                        :description
                    )
                """),
                {
                    "category_name": category_name,
                    "description": f"{category_name} assistance"
                }
            )

            category_result = conn.execute(
                text("""
                    SELECT category_id
                    FROM categories
                    WHERE LOWER(category_name) = LOWER(:category_name)
                    LIMIT 1
                """),
                {"category_name": category_name}
            ).fetchone()

        category_id = category_result.category_id

        location_result = conn.execute(
            text("""
                SELECT location_id
                FROM locations
                WHERE location_name = :location_name
                LIMIT 1
            """),
            {"location_name": location}
        ).fetchone()

        if not location_result:
            conn.execute(
                text("""
                    INSERT INTO locations
                    (
                        location_name
                    )
                    VALUES
                    (
                        :location_name
                    )
                """),
                {"location_name": location}
            )

            location_result = conn.execute(
                text("""
                    SELECT location_id
                    FROM locations
                    WHERE location_name = :location_name
                    LIMIT 1
                """),
                {"location_name": location}
            ).fetchone()

        location_id = location_result.location_id

        result = conn.execute(
            text("""
                INSERT INTO assistance_requests
                (
                    user_id,
                    category_id,
                    location_id,
                    request_details,
                    priority_level,
                    status
                )
                VALUES
                (
                    :user_id,
                    :category_id,
                    :location_id,
                    :request_details,
                    :priority_level,
                    'pending'
                )
            """),
            {
                "user_id": data.user_id,
                "category_id": category_id,
                "location_id": location_id,
                "request_details": request_details,
                "priority_level": database_priority
            }
        )

        request_id = result.lastrowid

    return {
        "message": "Request Created Successfully",
        "request_id": request_id,
        "user_id": data.user_id,
        "category": category_name,
        "location": location,
        "priority": priority,
        "status": "pending"
    }


@router.put("/{request_id}/status")
def update_request_status(
    request_id: int,
    status: str,
    updated_by: int
):
    with engine.begin() as conn:
        user_result = conn.execute(
            text("""
                SELECT user_id
                FROM assistance_requests
                WHERE request_id = :request_id
            """),
            {"request_id": request_id}
        ).fetchone()

        if not user_result:
            raise HTTPException(
                status_code=404,
                detail="Request Not Found"
            )

        user_id = user_result.user_id

        conn.execute(
            text("""
                UPDATE assistance_requests
                SET status = :status
                WHERE request_id = :request_id
            """),
            {
                "status": status,
                "request_id": request_id
            }
        )

        conn.execute(
            text("""
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
            """),
            {
                "request_id": request_id,
                "updated_by": updated_by,
                "status": status,
                "remarks": f"Status changed to {status}"
            }
        )

        conn.execute(
            text("""
                INSERT INTO notifications
                (
                    user_id,
                    title,
                    message
                )
                VALUES
                (
                    :user_id,
                    :title,
                    :message
                )
            """),
            {
                "user_id": user_id,
                "title": "Request Update",
                "message": f"Your request status is now {status}"
            }
        )

    return {
        "message": "Request Updated Successfully"
    }


@router.get("/user/{user_id}")
def get_user_requests(user_id: int):
    query = text("""
        SELECT
            ar.request_id,
            ar.user_id,
            ar.category_id,
            ar.location_id,
            ar.request_details,
            ar.priority_level,
            ar.status,
            ar.date_requested,
            c.category_name,
            l.location_name
        FROM assistance_requests ar
        LEFT JOIN categories c
            ON ar.category_id = c.category_id
        LEFT JOIN locations l
            ON ar.location_id = l.location_id
        WHERE ar.user_id = :user_id
        ORDER BY ar.request_id DESC
    """)

    with engine.connect() as conn:
        result = conn.execute(
            query,
            {"user_id": user_id}
        )

        requests = []

        for row in result:
            requests.append({
                "request_id": row.request_id,
                "user_id": row.user_id,
                "category_id": row.category_id,
                "category_name": row.category_name,
                "location_id": row.location_id,
                "location": row.location_name,
                "request_details": row.request_details,
                "priority_level": row.priority_level,
                "status": row.status,
                "date_requested": str(row.date_requested)
            })

        return requests