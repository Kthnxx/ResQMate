from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Barangay(Base):
    __tablename__ = "barangays"

    barangay_id = Column(Integer, primary_key=True)

    city_id = Column(
        Integer,
        ForeignKey("cities.city_id")
    )

    barangay_name = Column(String(100))
    psgc_code = Column(String(20))