import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor
import bcrypt
import jwt

from database import get_db, init_db

# Optional: ElevenLabs
try:
    from elevenlabs import ElevenLabs
except ImportError:
    ElevenLabs = None

# Optional: Google Gemini
try:
    from google import genai
except ImportError:
    genai = None

SECRET_KEY = os.getenv("JWT_SECRET", "trifit_super_secure_jwt_secret_key_2026_timescaledb")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

# Initialize ElevenLabs client if API key is present
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
eleven_client = ElevenLabs(api_key=ELEVENLABS_API_KEY) if (ElevenLabs and ELEVENLABS_API_KEY) else None

# Initialize Gemini client if API key is present
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if (genai and GEMINI_API_KEY) else None

app = FastAPI(title="TriFit API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# --- Password & JWT Helpers ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_token(username: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": username, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

import json

# --- Request Models ---
class SignupRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    password: str

class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

class OnboardingData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    race_type: Optional[str] = None
    race_date: Optional[str] = None
    is_first_time: Optional[str] = None
    previous_time: Optional[str] = None
    fitness_level: Optional[str] = None
    training_days: Optional[int] = 4
    equipment: Optional[list] = []
    baseline_metrics: Optional[dict] = {}
    sleep_hours: Optional[str] = None
    stress_level: Optional[str] = None
    injuries: Optional[str] = None

# ==========================================
# ENDPOINTS: SIGNUP, LOGIN, GET USER, ONBOARDING
# ==========================================

# 1. SIGNUP
@app.post("/signup")
@app.post("/api/register")
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

# 2. LOGIN
@app.post("/login")
@app.post("/api/login")
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

# 3. ONBOARDING (Save questionnaire answers into TimescaleDB)
@app.post("/onboarding")
@app.post("/api/onboarding")
def save_onboarding(data: OnboardingData):
    username = data.username
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if not username and data.user_id:
                cur.execute("SELECT username FROM users WHERE id = %s;", (data.user_id,))
                row = cur.fetchone()
                if row:
                    username = row["username"]
            elif not username:
                cur.execute("SELECT username, id FROM users ORDER BY id DESC LIMIT 1;")
                row = cur.fetchone()
                if row:
                    username = row["username"]
                    data.user_id = row["id"]

            if not username:
                raise HTTPException(status_code=400, detail="User not found for onboarding profile")

            if not data.user_id:
                cur.execute("SELECT id FROM users WHERE username = %s;", (username,))
                u_row = cur.fetchone()
                if u_row:
                    data.user_id = u_row["id"]

            cur.execute(
                """
                INSERT INTO athlete_profiles (
                    user_id, username, race_type, race_date, is_first_time, previous_time,
                    fitness_level, training_days, equipment, baseline_metrics,
                    sleep_hours, stress_level, injuries, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (username) DO UPDATE SET
                    race_type = EXCLUDED.race_type,
                    race_date = EXCLUDED.race_date,
                    is_first_time = EXCLUDED.is_first_time,
                    previous_time = EXCLUDED.previous_time,
                    fitness_level = EXCLUDED.fitness_level,
                    training_days = EXCLUDED.training_days,
                    equipment = EXCLUDED.equipment,
                    baseline_metrics = EXCLUDED.baseline_metrics,
                    sleep_hours = EXCLUDED.sleep_hours,
                    stress_level = EXCLUDED.stress_level,
                    injuries = EXCLUDED.injuries,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *;
                """,
                (
                    data.user_id,
                    username,
                    data.race_type,
                    data.race_date,
                    data.is_first_time,
                    data.previous_time,
                    data.fitness_level,
                    data.training_days,
                    json.dumps(data.equipment),
                    json.dumps(data.baseline_metrics),
                    data.sleep_hours,
                    data.stress_level,
                    data.injuries
                )
            )
            profile = cur.fetchone()
            conn.commit()
            return {"success": True, "message": "Onboarding answers saved to TimescaleDB", "profile": profile}
    finally:
        conn.close()

@app.get("/onboarding")
@app.get("/api/onboarding")
def get_onboarding(username: Optional[str] = None):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if username:
                cur.execute("SELECT * FROM athlete_profiles WHERE username = %s;", (username,))
            else:
                cur.execute("SELECT * FROM athlete_profiles ORDER BY id DESC LIMIT 1;")
            profile = cur.fetchone()
            if not profile:
                raise HTTPException(status_code=404, detail="No profile found")
            return {"success": True, "profile": profile}
    finally:
        conn.close()

security = HTTPBearer()

# 4. GET USER INFO & STATS
class UpdateStatsRequest(BaseModel):
    username: str
    xp_to_add: Optional[int] = 0
    increment_streak: Optional[bool] = False

@app.get("/user")
@app.get("/api/user-stats")
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

@app.post("/api/add-xp")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

# Helper function to generate response using Gemini API
def generate_gemini_response(prompt: str, model: str = "gemini-2.5-flash") -> str:
    """
    Generates text using Google Gemini API given a prompt.
    """
    if not gemini_client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
    
    response = gemini_client.models.generate_content(
        model=model,
        contents=prompt,
    )
    return response.text
