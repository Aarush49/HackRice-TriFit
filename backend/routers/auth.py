from typing import Optional
from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor

from database import get_db
from schemas import SignupRequest, LoginRequest, UpdateStatsRequest
from services.auth_service import hash_password, verify_password, create_token

router = APIRouter(tags=["auth"])

@router.post("/signup")
@router.post("/api/register")
def signup(data: SignupRequest):
    username = (data.username or (data.email.split("@")[0] if data.email else None) or data.name or "").strip()
    email = data.email.strip() if data.email else None
    password = data.password.strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username/Email and password are required")
    if len(password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id FROM users WHERE username = %s OR (email IS NOT NULL AND email = %s);",
                (username, email)
            )
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="An account with this username or email already exists")

            hashed = hash_password(password)
            cur.execute(
                """
                INSERT INTO users (username, email, password_hash)
                VALUES (%s, %s, %s)
                RETURNING id, username, email, created_at;
                """,
                (username, email, hashed)
            )
            new_user = cur.fetchone()
            conn.commit()

            token = create_token(new_user["username"])
            return {
                "success": True,
                "message": "Signup successful",
                "username": new_user["username"],
                "access_token": token,
                "user": {
                    "id": new_user["id"],
                    "username": new_user["username"],
                    "email": new_user["email"],
                    "created_at": str(new_user["created_at"])
                }
            }
    finally:
        conn.close()

@router.post("/login")
@router.post("/api/login")
def login(data: LoginRequest):
    identifier = (data.username or data.email or "").strip()
    password = data.password.strip()

    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Username/Email and password are required")

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, username, email, password_hash, created_at FROM users WHERE username = %s OR email = %s;",
                (identifier, identifier)
            )
            user = cur.fetchone()

            if not user or not verify_password(password, user["password_hash"]):
                raise HTTPException(status_code=401, detail="Invalid username/email or password")

            token = create_token(user["username"])
            return {
                "success": True,
                "message": "Login successful",
                "username": user["username"],
                "access_token": token,
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "email": user["email"],
                    "created_at": str(user["created_at"])
                }
            }
    finally:
        conn.close()

@router.get("/user")
@router.get("/api/user-stats")
def get_user_stats(username: Optional[str] = None):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if not username:
                cur.execute("SELECT id, username, email, xp, streak_days, created_at FROM users ORDER BY id DESC LIMIT 1;")
            else:
                cur.execute("SELECT id, username, email, xp, streak_days, created_at FROM users WHERE username = %s;", (username,))
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Also get athlete profile if available
            cur.execute("SELECT * FROM athlete_profiles WHERE username = %s;", (user["username"],))
            profile = cur.fetchone()

            return {
                "success": True,
                "user": user,
                "profile": profile or {}
            }
    finally:
        conn.close()

@router.post("/api/add-xp")
def add_xp(data: UpdateStatsRequest):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            streak_sql = ", streak_days = streak_days + 1" if data.increment_streak else ""
            cur.execute(
                f"""
                UPDATE users
                SET xp = COALESCE(xp, 0) + %s {streak_sql}
                WHERE username = %s
                RETURNING id, username, xp, streak_days;
                """,
                (data.xp_to_add or 0, data.username)
            )
            updated = cur.fetchone()
            conn.commit()
            if not updated:
                raise HTTPException(status_code=404, detail="User not found")
            return {"success": True, "user": updated}
    finally:
        conn.close()
