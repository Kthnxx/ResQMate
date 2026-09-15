from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from database import engine

router = APIRouter()


# =========================
# REQUEST MODELS
# =========================

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "community"


class LoginRequest(BaseModel):
    email: str
    password: str


# =========================
# GET ALL USERS
# =========================

@router.get("/")
def get_users():

    with engine.connect() as conn:

        result = conn.execute(
            text("""
                SELECT
                    user_id,
                    full_name,
                    email,
                    role
                FROM users
            """)
        )

        users = []

        for row in result:
            users.append({
                "user_id": row.user_id,
                "full_name": row.full_name,
                "email": row.email,
                "role": row.role
            })

    return users


# =========================
# REGISTER USER
# =========================

@router.post("/register")
def register_user(data: RegisterRequest):

    with engine.begin() as conn:

        # Check if email already exists
        existing_user = conn.execute(
            text("""
                SELECT user_id
                FROM users
                WHERE email = :email
            """),
            {
                "email": data.email
            }
        ).fetchone()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Insert new user
        result = conn.execute(
            text("""
                INSERT INTO users
                    (full_name, email, password, role)
                VALUES
                    (:full_name, :email, :password, :role)
            """),
            {
                "full_name": data.full_name,
                "email": data.email,
                "password": data.password,
                "role": data.role
            }
        )

        user_id = result.lastrowid

    return {
        "message": "User registered successfully",
        "user_id": user_id,
        "full_name": data.full_name,
        "email": data.email,
        "role": data.role
    }


# =========================
# LOGIN USER
# =========================

@router.post("/login")
def login_user(data: LoginRequest):

    with engine.connect() as conn:

        result = conn.execute(
            text("""
                SELECT
                    user_id,
                    full_name,
                    email,
                    password,
                    role
                FROM users
                WHERE email = :email
            """),
            {
                "email": data.email
            }
        ).fetchone()

    if not result:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if result.password != data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user_id": result.user_id,
        "full_name": result.full_name,
        "email": result.email,
        "role": result.role
    }