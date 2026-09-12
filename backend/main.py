import os
import re
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
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
    from google.genai import types
except ImportError:
    genai = None
    types = None

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
def generate_gemini_response(
    prompt: str,
    system_instruction: Optional[str] = None,
    model: str = "gemini-flash-latest"
) -> str:
    """
    Generates text using Google Gemini API given a prompt and optional system instruction.
    """
    if not gemini_client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
    
    config = types.GenerateContentConfig(system_instruction=system_instruction) if (types and system_instruction) else None

    models_to_try = [model, "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-2.5-pro"]
    # De-duplicate while preserving order
    models_to_try = list(dict.fromkeys(models_to_try))

    last_err = None
    for m in models_to_try:
        try:
            response = gemini_client.models.generate_content(
                model=m,
                contents=prompt,
                config=config
            )
            if response and response.text:
                return response.text
        except Exception as e:
            last_err = e
            continue

    raise HTTPException(status_code=500, detail=f"Gemini API error: {str(last_err)}")

def clean_markdown_for_speech(text: str) -> str:
    # Remove markdown formatting characters (*, _, ~, `, #)
    text = re.sub(r'[*_~`#]', '', text)
    # Remove bullet markers at line starts
    text = re.sub(r'^\s*[-+*]\s+', '', text, flags=re.MULTILINE)
    # Normalize space & newline sequences
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

@app.post("/training-plan")
@app.post("/api/training-plan")
@app.get("/training-plan")
@app.get("/api/training-plan")
def generate_training_plan(
    data: Optional[OnboardingData] = None,
    username: Optional[str] = None
):
    """
    Generates a custom triathlon training plan using Gemini API based on athlete profile,
    converts it to audio via ElevenLabs TTS API, and streams the audio back in the HTTP response.
    """
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API key is missing or client is not initialized.")
    
    if not eleven_client:
        raise HTTPException(status_code=500, detail="ElevenLabs API key is missing or client is not initialized.")

    # 1. Retrieve profile details if not fully passed in request
    target_username = username or (data.username if data else None)
    profile_info = {}

    if target_username or not data or not data.race_type:
        conn = get_db()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if target_username:
                    cur.execute("SELECT * FROM athlete_profiles WHERE username = %s;", (target_username,))
                else:
                    cur.execute("SELECT * FROM athlete_profiles ORDER BY id DESC LIMIT 1;")
                db_profile = cur.fetchone()
                if db_profile:
                    profile_info = dict(db_profile)
        except Exception as e:
            print(f"[DB WARN] Could not fetch athlete profile for training plan: {e}")
        finally:
            conn.close()

    # Consolidate attributes from request data or DB profile
    race_type = (data.race_type if data and data.race_type else None) or profile_info.get("race_type", "Sprint Triathlon")
    race_date = (data.race_date if data and data.race_date else None) or profile_info.get("race_date", "Upcoming")
    fitness_level = (data.fitness_level if data and data.fitness_level else None) or profile_info.get("fitness_level", "Intermediate")
    training_days = (data.training_days if data and data.training_days else None) or profile_info.get("training_days", 4)
    is_first_time = (data.is_first_time if data and data.is_first_time else None) or profile_info.get("is_first_time", "No")
    previous_time = (data.previous_time if data and data.previous_time else None) or profile_info.get("previous_time", "N/A")
    equipment = (data.equipment if data and data.equipment else None) or profile_info.get("equipment", [])
    baseline_metrics = (data.baseline_metrics if data and data.baseline_metrics else None) or profile_info.get("baseline_metrics", {})
    sleep_hours = (data.sleep_hours if data and data.sleep_hours else None) or profile_info.get("sleep_hours", "7-8 hours")
    stress_level = (data.stress_level if data and data.stress_level else None) or profile_info.get("stress_level", "Moderate")
    injuries = (data.injuries if data and data.injuries else None) or profile_info.get("injuries", "None")

    # 2. Build system instruction and user prompt tailored for spoken audio
    system_instruction = """You are an expert AI Personal Trainer and Triathlon Coach for TriFit. 
Your goal is to provide encouraging, high-energy, and personalized audio training advice directly to athletes. 
Never use markdown syntax (such as *, #, _, ~, or bullet points) in your response because your response will be converted directly into spoken audio using Text-to-Speech."""

    prompt = f"""Create a personalized 1-week audio training plan summary for an athlete with the following profile:

- Race Target: {race_type} (Target Date/Timeline: {race_date})
- Fitness Level: {fitness_level}
- Target Training Days/Week: {training_days}
- First Time Racer: {is_first_time} (Previous Time: {previous_time})
- Available Equipment: {equipment}
- Baseline Metrics: {baseline_metrics}
- Sleep & Stress: {sleep_hours}, Stress Level: {stress_level}
- Current Injuries/Limitations: {injuries}

Instructions:
1. Speak directly to the athlete in a friendly, encouraging, professional, and coaching voice.
2. Provide a structured overview of their weekly training split (swim, bike, run, and rest/recovery days tailored to their available equipment and fitness level).
3. Include specific actionable advice regarding pace, effort zones, and injury prevention based on their profile.
4. Keep the text concise (around 150 to 250 words) so it makes a great 1-minute audio coaching message.
"""

    # 3. Call Gemini API with system instruction
    gemini_text = generate_gemini_response(prompt, system_instruction=system_instruction)
    clean_text = clean_markdown_for_speech(gemini_text)

    # 4. Convert text to TTS audio using ElevenLabs API and stream back to client
    voice_id = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default Rachel voice
    
    try:
        audio_stream = eleven_client.text_to_speech.convert(
            voice_id=voice_id,
            text=clean_text,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128"
        )
        
        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=training_plan.mp3",
                "X-Training-Plan-Text": clean_text
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ElevenLabs TTS generation failed: {str(e)}")

