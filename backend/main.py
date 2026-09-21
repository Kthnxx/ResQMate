from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

# Import Models
from models.user import User
from models.category import Category
from models.location import Location
from models.assistance_request import AssistanceRequest
from models.resource import Resource
from models.distribution import Distribution
from models.notification import Notification
from models.request_status_history import RequestStatusHistory

# Import Routers
from routes.users import router as user_router
from routes.notification import router as notification_router
from routes.history import router as history_router
from routes.request import router as request_router
from routes.resource import router as resource_router
from routes.distribution import router as distribution_router
from routes.dashboard import router as dashboard_router
from routes import reports

# Create Tables
Base.metadata.create_all(bind=engine)

# FastAPI App
app = FastAPI(
    title="ResQMate API",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(
    user_router,
    prefix="/users",
    tags=["Users"]
)

app.include_router(
    notification_router,
    prefix="/notifications",
    tags=["Notifications"]
)

app.include_router(
    history_router,
    prefix="/history",
    tags=["Request History"]
)

app.include_router(
    request_router,
    prefix="/requests",
    tags=["Requests"]
)

app.include_router(
    resource_router,
    prefix="/resources",
    tags=["Resources"]
)

app.include_router(
    distribution_router,
    prefix="/distributions",
    tags=["Distributions"]
)

app.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

app.include_router(
    reports.router,
    prefix="/reports",
    tags=["Reports"]
)

# Root Endpoint
@app.get("/")
def home():
    return {
        "message": "ResQMate API Running"
    }