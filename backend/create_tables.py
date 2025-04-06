# backend/create_tables.py
from db import engine
from models import Base

Base.metadata.create_all(bind=engine)
