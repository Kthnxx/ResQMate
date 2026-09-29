from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Province(Base):
    __tablename__ = "provinces"

    province_id = Column(Integer, primary_key=True)

    region_id = Column(
        Integer,
        ForeignKey("regions.region_id")
    )

    province_name = Column(String(100))
    psgc_code = Column(String(20))