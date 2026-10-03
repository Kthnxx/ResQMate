from sqlalchemy import Column, Integer, String, Text
from backend.database import Base

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    category_name = Column(
        String(100),
        nullable=False
    )

    description = Column(Text)