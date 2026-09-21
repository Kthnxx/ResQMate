from fastapi import APIRouter
from sqlalchemy import text
from database import engine

router = APIRouter()


# GET ALL RESOURCES
@router.get("/")
def get_resources():

    query = text("""
        SELECT *
        FROM resources
        ORDER BY resource_id DESC
    """)

    with engine.connect() as conn:

        result = conn.execute(query)

        resources = []

        for row in result:

            resources.append({
                "resource_id": row.resource_id,
                "resource_name": row.resource_name,
                "category": row.category,
                "quantity_available": row.quantity_available,
                "unit": row.unit,
                "location": row.location,
                "status": row.status,
                "last_updated": str(row.last_updated)
            })

        return resources


# CREATE RESOURCE
@router.post("/create")
def create_resource(
    resource_name: str,
    category: str,
    quantity_available: int,
    unit: str,
    location: str,
    status: str = "Available"
):

    query = text("""
        INSERT INTO resources
        (
            resource_name,
            category,
            quantity_available,
            unit,
            location,
            status
        )
        VALUES
        (
            :resource_name,
            :category,
            :quantity_available,
            :unit,
            :location,
            :status
        )
    """)

    with engine.begin() as conn:

       conn.execute(
            query,
            {
                "resource_name": resource_name,
                "category": category,
                "quantity_available": quantity_available,
                "unit": unit,
                "location": location,
                "status": status
            }
        )

    return {
        "message": "Resource Added Successfully"
    }


# UPDATE RESOURCE
@router.put("/{resource_id}")
def update_resource(
    resource_id: int,
    resource_name: str,
    category: str,
    quantity_available: int,
    unit: str,
    location: str,
    status: str
):

    query = text("""
            UPDATE resources
            SET
                resource_name = :resource_name,
                category = :category,
                quantity_available = :quantity_available,
                unit = :unit,
                location = :location,
                status = :status
            WHERE resource_id = :resource_id
        """)

    with engine.begin() as conn:

        conn.execute(
            query,
            {
                "resource_id": resource_id,
                "resource_name": resource_name,
                "category": category,
                "quantity_available": quantity_available,
                "unit": unit,
                "location": location,
                "status": status
            }
        )

    return {
        "message": "Resource Updated Successfully"
    }


# DELETE RESOURCE
@router.delete("/{resource_id}")
def delete_resource(resource_id: int):

    query = text("""
        DELETE FROM resources
        WHERE resource_id = :resource_id
    """)

    with engine.begin() as conn:

        conn.execute(
            query,
            {
                "resource_id": resource_id
            }
        )

    return {
        "message": "Resource Deleted Successfully"
    }