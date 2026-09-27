from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import text
from database import engine

router = APIRouter()


# =========================
# REQUEST MODELS
# =========================

class RegisterRequest(BaseModel):
    first_name:   str
    last_name:    str
    email:        str
    password:     str
    phone_number: str = ""
    dob:          str = "2000-01-01"
    role:         str = "community_user"   # fixed: must match DB enum


class LoginRequest(BaseModel):
    email:    str
    password: str


class UpdateUserRequest(BaseModel):
    first_name: str
    last_name:  str
    email:      str
    role:       str


class CreateUserRequest(BaseModel):
    """Used by admin Add-User modal (full_name split here)."""
    full_name: str
    email:     str
    password:  str = "ResQMate2024!"   # temp default
    role:      str = "community_user"


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
                "user_id":   row.user_id,
                "full_name": row.full_name,
                "email":     row.email,
                "role":      row.role
            })

    return users


# =========================
# REGISTER USER (public signup)
# =========================

@router.post("/register")
def register_user(data: RegisterRequest):

    # Map display role to DB enum value
    role_map = {
        "community_user": "community_user",
        "community":      "community_user",
        "staff":          "staff",
        "admin":          "admin"
    }
    db_role = role_map.get(data.role, "community_user")

    with engine.begin() as conn:

        existing = conn.execute(
            text("SELECT user_id FROM users WHERE email = :email"),
            {"email": data.email}
        ).fetchone()

        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        result = conn.execute(
            text("""
                INSERT INTO users
                    (first_name, last_name, email, password, role, phone_number, dob)
                VALUES
                    (:first_name, :last_name, :email, :password, :role, :phone_number, :dob)
            """),
            {
                "first_name":   data.first_name,
                "last_name":    data.last_name,
                "email":        data.email,
                "password":     data.password,
                "role":         db_role,
                "phone_number": data.phone_number,
                "dob":          data.dob
            }
        )

        user_id = result.lastrowid

    return {
        "message":    "User registered successfully",
        "user_id":    user_id,
        "first_name": data.first_name,
        "last_name":  data.last_name,
        "full_name":  f"{data.first_name} {data.last_name}",
        "email":      data.email,
        "role":       db_role
    }


# =========================
# CREATE USER (admin panel)
# Accepts full_name and splits it
# =========================

@router.post("/create")
def create_user(data: CreateUserRequest):

    role_map = {
        "community_user": "community_user",
        "community":      "community_user",
        "staff":          "staff",
        "admin":          "admin"
    }
    db_role = role_map.get(data.role, "community_user")

    parts      = data.full_name.strip().split(" ", 1)
    first_name = parts[0]
    last_name  = parts[1] if len(parts) > 1 else ""

    with engine.begin() as conn:

        existing = conn.execute(
            text("SELECT user_id FROM users WHERE email = :email"),
            {"email": data.email}
        ).fetchone()

        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        result = conn.execute(
            text("""
                INSERT INTO users
                    (first_name, last_name, email, password, role, phone_number, dob)
                VALUES
                    (:first_name, :last_name, :email, :password, :role, '', '2000-01-01')
            """),
            {
                "first_name": first_name,
                "last_name":  last_name,
                "email":      data.email,
                "password":   data.password,
                "role":       db_role
            }
        )

        user_id = result.lastrowid

    return {
        "message":  "User created successfully",
        "user_id":  user_id,
        "full_name": data.full_name,
        "email":    data.email,
        "role":     db_role
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
            {"email": data.email}
        ).fetchone()

    if not result:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if result.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message":  "Login successful",
        "user_id":  result.user_id,
        "full_name": result.full_name,
        "email":    result.email,
        "role":     result.role
    }


# =========================
# UPDATE USER
# =========================

@router.put("/{user_id}")
def update_user(user_id: int, data: UpdateUserRequest):

    role_map = {
        "community_user": "community_user",
        "community":      "community_user",
        "staff":          "staff",
        "admin":          "admin"
    }
    db_role = role_map.get(data.role, "community_user")

    with engine.begin() as conn:

        result = conn.execute(
            text("""
                UPDATE users
                SET
                    first_name = :first_name,
                    last_name  = :last_name,
                    email      = :email,
                    role       = :role
                WHERE user_id = :user_id
            """),
            {
                "user_id":    user_id,
                "first_name": data.first_name,
                "last_name":  data.last_name,
                "email":      data.email,
                "role":       db_role
            }
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User updated successfully"}


# =========================
# DELETE USER
# =========================

@router.delete("/{user_id}")
def delete_user(user_id: int):

    with engine.begin() as conn:

        result = conn.execute(
            text("DELETE FROM users WHERE user_id = :user_id"),
            {"user_id": user_id}
        )

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}
