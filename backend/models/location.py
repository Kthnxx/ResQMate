from sqlalchemy import Column, Integer, String
from backend.database import Base

class Location(Base):
    __tablename__ = "locations"

    location_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    location_name = Column(String(255))
    barangay = Column(String(100))
    city = Column(String(100))
    province = Column(String(100))
    region = Column(String(100))
