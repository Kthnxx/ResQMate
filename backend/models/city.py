from sqlalchemy import Column, Integer, String, ForeignKey
from backend.database import Base

class City(Base):
    __tablename__ = "cities"

    city_id = Column(Integer, primary_key=True)

    province_id = Column(
        Integer,
        ForeignKey("provinces.province_id")
    )

    city_name = Column(String(100))
    psgc_code = Column(String(20))