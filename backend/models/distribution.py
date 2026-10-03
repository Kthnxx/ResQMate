from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime
)
from sqlalchemy.sql import func
from backend.database import Base

class Distribution(Base):
    __tablename__ = "distributions"

    distribution_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    request_id = Column(
        Integer,
        ForeignKey(
            "assistance_requests.request_id"
        )
    )

    resource_id = Column(
        Integer,
        ForeignKey(
            "resources.resource_id"
        )
    )

    staff_id = Column(
        Integer,
        ForeignKey(
            "users.user_id"
        )
    )

    quantity_given = Column(
        Integer
    )

    distribution_date = Column(
        DateTime,
        server_default=func.now()
    )