from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from database import engine

router = APIRouter()


# =========================
# REQUEST MODELS
# =========================

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    phone_number: str
    dob: str
    role: str = "community"


class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateUserRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    role: str


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
                    CONCAT_WS(' ', first_name, last_name) AS full_name,
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
                    (first_name, last_name, email, password, role, phone_number, dob)
                VALUES
                    (:first_name, :last_name, :email, :password, :role, :phone_number, :dob)
            """),
            {
                "first_name": data.first_name,
                "last_name": data.last_name,
                "email": data.email,
                "password": data.password,
                "role": data.role,
                "phone_number": data.phone_number,
                "dob": data.dob
            }
        )

        user_id = result.lastrowid

    return {
        "message": "User registered successfully",
        "user_id": user_id,
        "first_name": data.first_name,
        "last_name": data.last_name,
        "full_name": f"{data.first_name} {data.last_name}",
        "email": data.email,
        "role": data.role,
        "phone_number": data.phone_number,
        "dob": data.dob
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
                    CONCAT_WS(' ', first_name, last_name) AS full_name,
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

    # =========================
# UPDATE USER
# =========================




@router.put("/{user_id}")
def update_user(
    user_id: int,
    data: UpdateUserRequest
):

    with engine.begin() as conn:

        result = conn.execute(
            text("""
                UPDATE users
                SET
                    first_name = :first_name,
                    last_name = :last_name,
                    email = :email,
                    role = :role
                WHERE user_id = :user_id
            """),
            {
                "user_id": user_id,
                "first_name": data.first_name,
                "last_name": data.last_name,
                "email": data.email,
                "role": data.role
            }
        )

        if result.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

    return {
        "message": "User updated successfully"
    }

@router.delete("/{user_id}")
def delete_user(user_id: int):

    with engine.begin() as conn:

        result = conn.execute(
            text("""
                DELETE FROM users
                WHERE user_id = :user_id
            """),
            {
                "user_id": user_id
            }
        )

        if result.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

    return {
        "message": "User deleted successfully"
    }