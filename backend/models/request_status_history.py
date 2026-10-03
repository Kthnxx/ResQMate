from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime
)
from sqlalchemy.sql import func
from backend.database import Base

class RequestStatusHistory(Base):
    __tablename__ = "request_status_history"

    history_id = Column(
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

    updated_by = Column(
        Integer,
        ForeignKey(
            "users.user_id"
        )
    )

    status = Column(
        String(50)
    )

    remarks = Column(Text)

    updated_at = Column(
        DateTime,
        server_default=func.now()
    )