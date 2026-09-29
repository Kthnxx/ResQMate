from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Location(Base):
    __tablename__ = "locations"

    location_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    region_id = Column(
        Integer,
        ForeignKey("regions.region_id")
    )

    province_id = Column(
        Integer,
        ForeignKey("provinces.province_id")
    )

    city_id = Column(
        Integer,
        ForeignKey("cities.city_id")
    )

    barangay_id = Column(
        Integer,
        ForeignKey("barangays.barangay_id")
    )

    street_address = Column(String(255))