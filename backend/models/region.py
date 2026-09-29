from sqlalchemy import Column, Integer, String
from database import Base

class Region(Base):
    __tablename__ = "regions"

    region_id = Column(Integer, primary_key=True)
    region_name = Column(String(100))
    psgc_code = Column(String(20))