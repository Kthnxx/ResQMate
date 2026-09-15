from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from database import engine

router = APIRouter()


# GET ALL DISTRIBUTIONS
@router.get("/")
def get_distributions():

    query = text("""
        SELECT *
        FROM distributions
        ORDER BY distribution_id DESC
    """)

    with engine.connect() as conn:

        result = conn.execute(query)

        distributions = []

        for row in result:

            distributions.append({
                "distribution_id": row.distribution_id,
                "request_id": row.request_id,
                "resource_id": row.resource_id,
                "staff_id": row.staff_id,
                "quantity_given": row.quantity_given,
                "distribution_date": str(row.distribution_date)
            })

        return distributions


# CREATE DISTRIBUTION
@router.post("/create")
def create_distribution(
    request_id: int,
    resource_id: int,
    staff_id: int,
    quantity_given: int
):

    # Prevent zero or negative distributions
    if quantity_given <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity given must be greater than 0"
        )

    with engine.begin() as conn:

        # Check if resource exists and get available quantity
        resource = conn.execute(
            text("""
                SELECT resource_id, quantity_available
                FROM resources
                WHERE resource_id = :resource_id
            """),
            {
                "resource_id": resource_id
            }
        ).fetchone()

        if not resource:
            raise HTTPException(
                status_code=404,
                detail="Resource not found"
            )

        # Check if enough stock is available
        if resource.quantity_available < quantity_given:
            raise HTTPException(
                status_code=400,
                detail="Insufficient resource quantity"
            )

        # Insert distribution
        conn.execute(
            text("""
                INSERT INTO distributions
                (
                    request_id,
                    resource_id,
                    staff_id,
                    quantity_given
                )
                VALUES
                (
                    :request_id,
                    :resource_id,
                    :staff_id,
                    :quantity_given
                )
            """),
            {
                "request_id": request_id,
                "resource_id": resource_id,
                "staff_id": staff_id,
                "quantity_given": quantity_given
            }
        )

        # Deduct quantity from resources
        conn.execute(
            text("""
                UPDATE resources
                SET quantity_available =
                    quantity_available - :quantity_given
                WHERE resource_id = :resource_id
            """),
            {
                "quantity_given": quantity_given,
                "resource_id": resource_id
            }
        )

    return {
        "message": "Distribution Recorded Successfully"
    }


# DELETE DISTRIBUTION
@router.delete("/{distribution_id}")
def delete_distribution(distribution_id: int):

    with engine.begin() as conn:

        # Get distribution before deleting it
        distribution = conn.execute(
            text("""
                SELECT
                    distribution_id,
                    resource_id,
                    quantity_given
                FROM distributions
                WHERE distribution_id = :distribution_id
            """),
            {
                "distribution_id": distribution_id
            }
        ).fetchone()

        # Distribution does not exist
        if not distribution:
            raise HTTPException(
                status_code=404,
                detail="Distribution not found"
            )

        # Restore quantity back to resources
        conn.execute(
            text("""
                UPDATE resources
                SET quantity_available =
                    quantity_available + :quantity_given
                WHERE resource_id = :resource_id
            """),
            {
                "quantity_given": distribution.quantity_given,
                "resource_id": distribution.resource_id
            }
        )

        # Delete distribution
        conn.execute(
            text("""
                DELETE FROM distributions
                WHERE distribution_id = :distribution_id
            """),
            {
                "distribution_id": distribution_id
            }
        )

    return {
        "message": "Distribution Deleted Successfully",
        "quantity_restored": distribution.quantity_given
    }