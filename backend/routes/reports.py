from fastapi import APIRouter
from sqlalchemy import text
from database import engine

router = APIRouter()

@router.get("/")
def get_reports():

    with engine.connect() as conn:

        total_requests = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM assistance_requests
            """)
        ).scalar()

        completed = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM assistance_requests
                WHERE status = 'Completed'
            """)
        ).scalar()

        pending = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM assistance_requests
                WHERE status = 'Pending'
            """)
        ).scalar()

        processing = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM assistance_requests
                WHERE status = 'Processing'
            """)
        ).scalar()

        total_distributions = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM distributions
            """)
        ).scalar()

        total_resources = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM relief_resources
            """)
        ).scalar()

    return {
        "total_requests": total_requests,
        "completed": completed,
        "pending": pending,
        "processing": processing,
        "total_distributions": total_distributions,
        "total_resources": total_resources
    }

@router.get("/monthly")
def get_monthly_requests():

    with engine.connect() as conn:

        result = conn.execute(
            text("""
                SELECT
                    MONTH(date_requested) AS month_num,
                    COUNT(*) AS total
                FROM assistance_requests
                GROUP BY MONTH(date_requested)
                ORDER BY MONTH(date_requested)
            """)
        )

        monthly_data = {
            "Apr": 0,
            "May": 0,
            "Jun": 0,
            "Jul": 0,
            "Aug": 0,
            "Sep": 0
        }

        month_map = {
            4: "Apr",
            5: "May",
            6: "Jun",
            7: "Jul",
            8: "Aug",
            9: "Sep"
        }

        for row in result:

            if row.month_num in month_map:

                monthly_data[
                    month_map[row.month_num]
                ] = row.total

    return monthly_data