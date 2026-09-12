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

    models_to_try = [model, "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview", "gemini-flash-latest"]
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
    # Remove emojis and special unicode symbols
    text = re.sub(r'[\U00010000-\U0010ffff\u2600-\u27ff\u2300-\u23ff\u2000-\u206f\u2b00-\u2bff]', '', text)
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

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None

@app.post("/api/tts")
@app.post("/tts")
def text_to_speech(data: TTSRequest):
    """
    Converts given text to speech using ElevenLabs API and streams the MP3 audio back.
    """
    if not eleven_client:
        raise HTTPException(status_code=500, detail="ElevenLabs API key is missing or client is not initialized.")
    
    clean_text = clean_markdown_for_speech(data.text)
    if not clean_text:
        raise HTTPException(status_code=400, detail="Text is empty")

    voice_id = data.voice_id or os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default Rachel voice

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
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ElevenLabs TTS generation failed: {str(e)}")

class PlanAdjustmentRequest(BaseModel):
    username: str
    feedback: str
    race_type: Optional[str] = None
    race_date: Optional[str] = None

class SavePlanRequest(BaseModel):
    username: str
    race_type: Optional[str] = None
    race_date: Optional[str] = None
    plan_data: dict

def get_default_sport_plan(race_type: str = "Hyrox Open / Pro", race_date: str = "November 15, 2026"):
    r = (race_type or "").lower()
    if "marathon" in r:
        return {
            "goal": f"Prepare for {race_type} by {race_date}",
            "weeks": [
                {
                    "week_number": 1,
                    "focus": "Aerobic Volume & Base Pacing",
                    "days": [
                        {"day": "Monday", "workout_type": "Easy Run", "description": "6 km easy recovery pace + 4 x 100m strides"},
                        {"day": "Tuesday", "workout_type": "Marathon Pace Tempo", "description": "8 km continuous at target marathon pace"},
                        {"day": "Wednesday", "workout_type": "Threshold Intervals", "description": "5 x 1,000m at Zone 4 with 2m jog recovery"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Active recovery walk & tendon mobility"},
                        {"day": "Friday", "workout_type": "Mid-Week Run", "description": "10 km steady Zone 2 endurance"},
                        {"day": "Saturday", "workout_type": "Strength & Core", "description": "Glute, hip & core stabilization drills"},
                        {"day": "Sunday", "workout_type": "Long Run (LSD)", "description": "18 km progressive aerobic long run"}
                    ]
                },
                {
                    "week_number": 2,
                    "focus": "Lactate Threshold & Pacing Specificity",
                    "days": [
                        {"day": "Monday", "workout_type": "Easy Run", "description": "7 km easy aerobic effort"},
                        {"day": "Tuesday", "workout_type": "Tempo Intervals", "description": "3 x 3 km at half-marathon pace"},
                        {"day": "Wednesday", "workout_type": "Zone 2 Base", "description": "8 km conversational recovery run"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Sleep & cellular repair protocol"},
                        {"day": "Friday", "workout_type": "Hill Repeats", "description": "8 x 90s uphill strides for power"},
                        {"day": "Saturday", "workout_type": "Cross-Training", "description": "45 min low-impact spin or swim"},
                        {"day": "Sunday", "workout_type": "Long Run", "description": "22 km sustained endurance run"}
                    ]
                },
                {
                    "week_number": 3,
                    "focus": "Peak Volume & Glycogen Adaptation",
                    "days": [
                        {"day": "Monday", "workout_type": "Recovery Run", "description": "6 km recovery jog"},
                        {"day": "Tuesday", "workout_type": "Marathon Pace", "description": "12 km with 8 km at goal pace"},
                        {"day": "Wednesday", "workout_type": "Speed Intervals", "description": "6 x 800m VO2 max repeats"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Foam rolling & hydration focus"},
                        {"day": "Friday", "workout_type": "Easy Run", "description": "8 km easy with strides"},
                        {"day": "Saturday", "workout_type": "Shakeout", "description": "5 km relaxed shakeout"},
                        {"day": "Sunday", "workout_type": "Peak Long Run", "description": "26 km marathon simulation with fueling"}
                    ]
                },
                {
                    "week_number": 4,
                    "focus": "Taper & Carbohydrate Loading",
                    "days": [
                        {"day": "Monday", "workout_type": "Rest", "description": "Full rest & hydration"},
                        {"day": "Tuesday", "workout_type": "Sharpening Run", "description": "6 km with 3 x 1km at race pace"},
                        {"day": "Wednesday", "workout_type": "Easy Run", "description": "5 km very light jog"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Electrolytes & sleep priority"},
                        {"day": "Friday", "workout_type": "Pre-Race Shakeout", "description": "3 km easy + 3 strides"},
                        {"day": "Saturday", "workout_type": "Rest", "description": "Carb loading & gear check"},
                        {"day": "Sunday", "workout_type": "Race Day", "description": "Marathon Target • Pacing strategy executed"}
                    ]
                }
            ]
        }
    elif "tri" in r or "ironman" in r:
        return {
            "goal": f"Prepare for {race_type} by {race_date}",
            "weeks": [
                {
                    "week_number": 1,
                    "focus": "Multi-Sport Base & Brick Foundations",
                    "days": [
                        {"day": "Monday", "workout_type": "Technique Swim", "description": "1,500m stroke mechanics & catch drills"},
                        {"day": "Tuesday", "workout_type": "Cadence Aero Bike", "description": "60 min high-cadence power intervals"},
                        {"day": "Wednesday", "workout_type": "Brick Session", "description": "45 min Tempo Bike + 20 min Transition Run"},
                        {"day": "Thursday", "workout_type": "Recovery Swim", "description": "1,000m pull buoy & mobility reset"},
                        {"day": "Friday", "workout_type": "Threshold Run", "description": "8 km with 3 x 1 mile repeats"},
                        {"day": "Saturday", "workout_type": "Long Endurance Bike", "description": "2.5 hours Zone 2 with nutrition practice"},
                        {"day": "Sunday", "workout_type": "Long Base Run", "description": "14 km sustained pace on soft trails"}
                    ]
                },
                {
                    "week_number": 2,
                    "focus": "Threshold Power & Open Water Pacing",
                    "days": [
                        {"day": "Monday", "workout_type": "Endurance Swim", "description": "2,000m continuous pacing set"},
                        {"day": "Tuesday", "workout_type": "FTP Intervals Bike", "description": "75 min with 4 x 8m at Sweet Spot"},
                        {"day": "Wednesday", "workout_type": "Tempo Run", "description": "10 km progressive pacing"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Full recovery & tissue mobilization"},
                        {"day": "Friday", "workout_type": "Brick Session", "description": "60 min Bike + 30 min Run at 70.3 pace"},
                        {"day": "Saturday", "workout_type": "Long Ride", "description": "3 hours Zone 2 aerodynamic position"},
                        {"day": "Sunday", "workout_type": "Half Marathon Run", "description": "16 km steady aerobic rhythm"}
                    ]
                },
                {
                    "week_number": 3,
                    "focus": "Race Simulation & Brick Volume",
                    "days": [
                        {"day": "Monday", "workout_type": "Fast Swim", "description": "1,800m with 10 x 100m race pace"},
                        {"day": "Tuesday", "workout_type": "Climbing Bike", "description": "70 min hilly route low cadence"},
                        {"day": "Wednesday", "workout_type": "Brick Simulation", "description": "75 min Race Pace Bike + 5 km Run"},
                        {"day": "Thursday", "workout_type": "Recovery Swim", "description": "1,200m easy drill work"},
                        {"day": "Friday", "workout_type": "Pacing Run", "description": "8 km with race pace surges"},
                        {"day": "Saturday", "workout_type": "Long Ride", "description": "80 km Zone 2 aero check"},
                        {"day": "Sunday", "workout_type": "Long Run", "description": "18 km negative split finish"}
                    ]
                },
                {
                    "week_number": 4,
                    "focus": "Taper & Transition Mastery",
                    "days": [
                        {"day": "Monday", "workout_type": "Rest", "description": "Rest & hydration"},
                        {"day": "Tuesday", "workout_type": "Taper Swim", "description": "1,200m with short accelerations"},
                        {"day": "Wednesday", "workout_type": "Taper Spin", "description": "40 min easy spin + 3 sprints"},
                        {"day": "Thursday", "workout_type": "Taper Run", "description": "4 km easy jog with 4 strides"},
                        {"day": "Friday", "workout_type": "Rest", "description": "Bike transition setup & electrolytes"},
                        {"day": "Saturday", "workout_type": "Mini Shakeout", "description": "15m swim + 10m jog"},
                        {"day": "Sunday", "workout_type": "Race Day", "description": "Triathlon 70.3 Target Event!"}
                    ]
                }
            ]
        }
    elif "5k" in r or "10k" in r or "speed" in r:
        return {
            "goal": f"Prepare for {race_type} by {race_date}",
            "weeks": [
                {
                    "week_number": 1,
                    "focus": "VO2 Max & Neuromuscular Speed",
                    "days": [
                        {"day": "Monday", "workout_type": "Recovery Run", "description": "5 km easy + 5 x 100m accelerations"},
                        {"day": "Tuesday", "workout_type": "Track Repeats", "description": "6 x 800m at 5k goal pace (90s rest)"},
                        {"day": "Wednesday", "workout_type": "VO2 Max Intervals", "description": "8 x 400m hard effort with equal jog rest"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "25 min mobility & core stability"},
                        {"day": "Friday", "workout_type": "Threshold Tempo", "description": "6 km continuous at 10k race pace"},
                        {"day": "Saturday", "workout_type": "Easy Run", "description": "7 km relaxed aerobic base"},
                        {"day": "Sunday", "workout_type": "Long Run", "description": "12 km building finish"}
                    ]
                },
                {
                    "week_number": 2,
                    "focus": "Lactate Tolerance & Turnover",
                    "days": [
                        {"day": "Monday", "workout_type": "Easy Run", "description": "6 km with strides"},
                        {"day": "Tuesday", "workout_type": "1km Repeats", "description": "5 x 1,000m at 5k pace (2m rest)"},
                        {"day": "Wednesday", "workout_type": "Aerobic Recovery", "description": "6 km easy conversational pace"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Tendon recovery & sleep"},
                        {"day": "Friday", "workout_type": "Tempo Run", "description": "7 km threshold pace"},
                        {"day": "Saturday", "workout_type": "Speed Play", "description": "Fartlek 8 x 1m on/off"},
                        {"day": "Sunday", "workout_type": "Long Run", "description": "14 km steady Zone 2"}
                    ]
                },
                {
                    "week_number": 3,
                    "focus": "Speed Endurance & Pacing Lock",
                    "days": [
                        {"day": "Monday", "workout_type": "Recovery Run", "description": "5 km relaxed"},
                        {"day": "Tuesday", "workout_type": "Ladder Track", "description": "400m - 800m - 1200m - 800m - 400m"},
                        {"day": "Wednesday", "workout_type": "Easy Run", "description": "6 km easy"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Mobility drills"},
                        {"day": "Friday", "workout_type": "Race Pace Tempo", "description": "5 km at exact goal race pace"},
                        {"day": "Saturday", "workout_type": "Shakeout", "description": "5 km easy"},
                        {"day": "Sunday", "workout_type": "Long Run", "description": "11 km with fast finish"}
                    ]
                },
                {
                    "week_number": 4,
                    "focus": "Taper & Peak Freshness",
                    "days": [
                        {"day": "Monday", "workout_type": "Rest", "description": "Full recovery"},
                        {"day": "Tuesday", "workout_type": "Sharpening", "description": "4 x 400m fast with 2m rest"},
                        {"day": "Wednesday", "workout_type": "Easy Jog", "description": "4 km very easy"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Hydration & mental prep"},
                        {"day": "Friday", "workout_type": "Pre-Race Strides", "description": "3 km jog + 4 strides"},
                        {"day": "Saturday", "workout_type": "Rest", "description": "Rest & fueling"},
                        {"day": "Sunday", "workout_type": "Race Day", "description": "5K / 10K Target PR Effort!"}
                    ]
                }
            ]
        }
    else:
        # Default: Hyrox Open / Pro
        return {
            "goal": f"Prepare for {race_type} by {race_date}",
            "weeks": [
                {
                    "week_number": 1,
                    "focus": "Compromised Running & Stations",
                    "days": [
                        {"day": "Monday", "workout_type": "Sled & Strength", "description": "1km Run + 80m Sled Push (125kg) + 400m recovery runs"},
                        {"day": "Tuesday", "workout_type": "Zone 2 Base", "description": "40 min steady aerobic nasal breathing run"},
                        {"day": "Wednesday", "workout_type": "Hyrox Simulation", "description": "1km Run + 50m Sled Pull & 80m Burpee Broad Jumps"},
                        {"day": "Thursday", "workout_type": "Rest & Mobility", "description": "Hip flexors, ankles & hamstring release"},
                        {"day": "Friday", "workout_type": "Erg Intervals", "description": "5 x 500m SkiErg & 5 x 500m Row at target race pace"},
                        {"day": "Saturday", "workout_type": "Compromised Run", "description": "4 x 800m run with 100 Wall Balls (6kg) buy-in"},
                        {"day": "Sunday", "workout_type": "Long Aerobic Run", "description": "60 min conversational pace endurance run"}
                    ]
                },
                {
                    "week_number": 2,
                    "focus": "Lactate Threshold & Heavy Carry Resilience",
                    "days": [
                        {"day": "Monday", "workout_type": "Farmers Carry & Lunges", "description": "200m Farmers Carry (2x24kg) + 100m Sandbag Lunges"},
                        {"day": "Tuesday", "workout_type": "Tempo Threshold Run", "description": "35 min Zone 3/4 sustained running"},
                        {"day": "Wednesday", "workout_type": "Station Speedwork", "description": "1,000m SkiErg into 80m Sled Push sprint sets"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Cold plunge, hydration & cellular repair"},
                        {"day": "Friday", "workout_type": "Compromised Intervals", "description": "5 x 1km runs with 20 burpees between intervals"},
                        {"day": "Saturday", "workout_type": "Full Hyrox Half-Sim", "description": "4 stations back-to-back with 1km runs"},
                        {"day": "Sunday", "workout_type": "Zone 2 Recovery", "description": "50 min easy recovery jog or cycle"}
                    ]
                },
                {
                    "week_number": 3,
                    "focus": "Grip Endurance & Pacing Simulation",
                    "days": [
                        {"day": "Monday", "workout_type": "Sled Heavy Overload", "description": "Sled Push @ 150kg + Sled Pull @ 100kg"},
                        {"day": "Tuesday", "workout_type": "Interval Runs", "description": "6 x 800m fast with heavy dumbbell holds"},
                        {"day": "Wednesday", "workout_type": "Row & Wall Ball Blast", "description": "1,000m Row + 100 Wall Balls for time"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Deep tissue foam rolling & electrolytes"},
                        {"day": "Friday", "workout_type": "Race Pacing Drill", "description": "Simulate Stations 1-8 at 85% race intensity"},
                        {"day": "Saturday", "workout_type": "Sandbag & Lunge Grind", "description": "200m Sandbag Lunges (20kg) + 1km recovery runs"},
                        {"day": "Sunday", "workout_type": "Long Aerobic Run", "description": "65 min Zone 2 aerobic base"}
                    ]
                },
                {
                    "week_number": 4,
                    "focus": "Taper & Movement Efficiency",
                    "days": [
                        {"day": "Monday", "workout_type": "Rest", "description": "Rest & central nervous system reset"},
                        {"day": "Tuesday", "workout_type": "Sharpening Stations", "description": "Short 250m SkiErg & light sled technique"},
                        {"day": "Wednesday", "workout_type": "Easy Jog", "description": "25 min relaxed jog + 4 strides"},
                        {"day": "Thursday", "workout_type": "Rest", "description": "Carb loading & sleep optimization"},
                        {"day": "Friday", "workout_type": "Shakeout Drill", "description": "15 min light movement & wall ball form check"},
                        {"day": "Saturday", "workout_type": "Rest", "description": "Rest, hydration & race strategy review"},
                        {"day": "Sunday", "workout_type": "Race Day", "description": "Hyrox Competition • All stations locked in!"}
                    ]
                }
            ]
        }

@app.post("/api/plan/save")
def save_training_plan(data: SavePlanRequest):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE username = %s;", (data.username,))
            user_row = cur.fetchone()
            if not user_row:
                hashed = bcrypt.hashpw('demo123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cur.execute(
                    "INSERT INTO users (username, email, password_hash, xp, streak_days) VALUES (%s, %s, %s, 2450, 7) RETURNING id;",
                    (data.username, f"{data.username.lower()}@trifit.io", hashed)
                )
                user_row = cur.fetchone()
            user_id = user_row["id"]

            if data.race_type or data.race_date:
                cur.execute("""
                    INSERT INTO athlete_profiles (user_id, username, race_type, race_date, updated_at)
                    VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (username) DO UPDATE SET
                        race_type = COALESCE(EXCLUDED.race_type, athlete_profiles.race_type),
                        race_date = COALESCE(EXCLUDED.race_date, athlete_profiles.race_date),
                        updated_at = CURRENT_TIMESTAMP;
                """, (user_id, data.username, data.race_type, data.race_date))

            cur.execute("""
                INSERT INTO training_plans (user_id, username, plan_data, updated_at)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (username) DO UPDATE SET
                    plan_data = EXCLUDED.plan_data,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *;
            """, (user_id, data.username, json.dumps(data.plan_data)))
            saved = cur.fetchone()
            try:
                update_future_events_in_db(cur, data.username, data.plan_data, "2026-09-12")
            except Exception as ev_err:
                print(f"[DB WARN] Failed to update future scheduled events on plan save: {ev_err}")
            conn.commit()
            return {"success": True, "plan": saved}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save plan: {e}")
    finally:
        conn.close()

@app.post("/api/plan/generate")
def generate_json_training_plan(username: str, race_type: Optional[str] = None, race_date: Optional[str] = None):
    conn = get_db()
    profile_info = {}
    user_id = None
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE username = %s;", (username,))
            u_row = cur.fetchone()
            if u_row:
                user_id = u_row["id"]
            cur.execute("SELECT * FROM athlete_profiles WHERE username = %s;", (username,))
            db_profile = cur.fetchone()
            if db_profile:
                profile_info = dict(db_profile)
    except Exception as e:
        print(f"[DB WARN] error fetching profile: {e}")
    finally:
        conn.close()

    target_race = race_type or profile_info.get('race_type', 'Hyrox Open / Pro')
    target_date = race_date or profile_info.get('race_date', 'November 15, 2026')

    plan_data = None
    if gemini_client:
        system_instruction = "You are an expert AI Personal Trainer and Triathlon Coach. Your goal is to generate structured training plans in valid JSON format. Always return ONLY a JSON object and no surrounding text or markdown blocks."
        prompt = f"""Create a personalized 4-week training plan for an athlete targeting {target_race} by {target_date}. The plan should be formatted as a valid JSON object.
Ensure the output is strictly valid JSON with goal and 4 weeks array, each with week_number, focus, and 7 days (day, workout_type, description)."""
        try:
            gemini_text = generate_gemini_response(prompt, system_instruction=system_instruction, model="gemini-3.5-flash")
            cleaned_json = gemini_text.strip()
            if cleaned_json.startswith("```json"):
                cleaned_json = cleaned_json[7:]
            if cleaned_json.startswith("```"):
                cleaned_json = cleaned_json[3:]
            if cleaned_json.endswith("```"):
                cleaned_json = cleaned_json[:-3]
            plan_data = json.loads(cleaned_json.strip())
        except Exception as e:
            print(f"[AI WARN] Gemini generation fallback to default template: {e}")
            plan_data = None

    if not plan_data:
        plan_data = get_default_sport_plan(target_race, target_date)

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if not user_id:
                cur.execute("SELECT id FROM users WHERE username = %s;", (username,))
                u_row = cur.fetchone()
                if u_row:
                    user_id = u_row["id"]
                else:
                    hashed = bcrypt.hashpw('demo123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    cur.execute(
                        "INSERT INTO users (username, email, password_hash, xp, streak_days) VALUES (%s, %s, %s, 2450, 7) RETURNING id;",
                        (username, f"{username.lower()}@trifit.io", hashed)
                    )
                    user_id = cur.fetchone()["id"]

            cur.execute(
                """
                INSERT INTO training_plans (user_id, username, plan_data, updated_at)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (username) DO UPDATE SET
                    plan_data = EXCLUDED.plan_data,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *;
                """,
                (user_id, username, json.dumps(plan_data))
            )
            saved_plan = cur.fetchone()
            conn.commit()
            return {"success": True, "plan": saved_plan}
    finally:
        conn.close()

@app.get("/api/plan/current")
def get_current_plan(username: str):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM training_plans WHERE username = %s;", (username,))
            plan = cur.fetchone()
            if plan:
                return {"success": True, "plan": plan}
            
            cur.execute("SELECT race_type, race_date FROM athlete_profiles WHERE username = %s;", (username,))
            prof = cur.fetchone()
            race_type = prof["race_type"] if prof else "Hyrox Open / Pro"
            race_date = prof["race_date"] if prof else "November 15, 2026"
            default_plan = get_default_sport_plan(race_type, race_date)

            cur.execute("SELECT id FROM users WHERE username = %s;", (username,))
            u_row = cur.fetchone()
            if not u_row:
                hashed = bcrypt.hashpw('demo123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cur.execute(
                    "INSERT INTO users (username, email, password_hash, xp, streak_days) VALUES (%s, %s, %s, 2450, 7) RETURNING id;",
                    (username, f"{username.lower()}@trifit.io", hashed)
                )
                u_row = cur.fetchone()

            cur.execute("""
                INSERT INTO training_plans (user_id, username, plan_data, updated_at)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (username) DO UPDATE SET plan_data = EXCLUDED.plan_data
                RETURNING *;
            """, (u_row["id"], username, json.dumps(default_plan)))
            saved = cur.fetchone()
            conn.commit()
            return {"success": True, "plan": saved}
    finally:
        conn.close()

@app.post("/api/plan/adjust")
def adjust_training_plan(data: PlanAdjustmentRequest):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM training_plans WHERE username = %s;", (data.username,))
            plan_row = cur.fetchone()
            current_plan = plan_row["plan_data"] if plan_row else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        conn.close()

    new_race = data.race_type
    if not new_race and "target event to" in data.feedback.lower():
        parts = data.feedback.split("target event to")
        if len(parts) > 1:
            new_race = parts[1].strip()

    if not current_plan or new_race:
        new_plan_data = get_default_sport_plan(new_race or "Hyrox Open / Pro", data.race_date or "November 15, 2026")
    else:
        new_plan_data = None
        if gemini_client:
            system_instruction = "You are an expert AI Personal Trainer. You output ONLY valid JSON objects and no surrounding text or markdown blocks."
            prompt = f"""The athlete has an existing training plan:
{json.dumps(current_plan)}

The athlete provided the following feedback/adjustment request:
"{data.feedback}"

Please adjust the training plan to accommodate this feedback while still keeping them on track for their overall goal.
Output the updated plan in the exact same JSON format as the original. Ensure it is strictly valid JSON."""
            try:
                gemini_text = generate_gemini_response(prompt, system_instruction=system_instruction, model="gemini-3.5-flash")
                cleaned_json = gemini_text.strip()
                if cleaned_json.startswith("```json"):
                    cleaned_json = cleaned_json[7:]
                if cleaned_json.startswith("```"):
                    cleaned_json = cleaned_json[3:]
                if cleaned_json.endswith("```"):
                    cleaned_json = cleaned_json[:-3]
                new_plan_data = json.loads(cleaned_json.strip())
            except Exception as e:
                print(f"[AI WARN] Gemini adjust fallback: {e}")
                new_plan_data = None

        if not new_plan_data:
            new_plan_data = current_plan

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE username = %s;", (data.username,))
            u_row = cur.fetchone()
            if not u_row:
                hashed = bcrypt.hashpw('demo123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cur.execute(
                    "INSERT INTO users (username, email, password_hash, xp, streak_days) VALUES (%s, %s, %s, 2450, 7) RETURNING id;",
                    (data.username, f"{data.username.lower()}@trifit.io", hashed)
                )
                u_row = cur.fetchone()

            if new_race or data.race_date:
                cur.execute("""
                    INSERT INTO athlete_profiles (user_id, username, race_type, race_date, updated_at)
                    VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (username) DO UPDATE SET
                        race_type = COALESCE(EXCLUDED.race_type, athlete_profiles.race_type),
                        race_date = COALESCE(EXCLUDED.race_date, athlete_profiles.race_date),
                        updated_at = CURRENT_TIMESTAMP;
                """, (u_row["id"], data.username, new_race, data.race_date))

            cur.execute(
                """
                INSERT INTO training_plans (user_id, username, plan_data, updated_at)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (username) DO UPDATE SET
                    plan_data = EXCLUDED.plan_data,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *;
                """,
                (u_row["id"], data.username, json.dumps(new_plan_data))
            )
            saved_plan = cur.fetchone()
            try:
                adaptation = None
                f_low = data.feedback.lower()
                if "walk" in f_low:
                    adaptation = "walk"
                elif "ease" in f_low:
                    adaptation = "ease"
                elif "rest" in f_low:
                    adaptation = "rest"
                update_future_events_in_db(cur, data.username, new_plan_data, "2026-09-12", adaptation=adaptation)
            except Exception as ev_err:
                print(f"[DB WARN] Failed to update future scheduled events on plan adjust: {ev_err}")
            conn.commit()
            return {"success": True, "plan": saved_plan}
    finally:
        conn.close()

# ==========================================
# SCHEDULED EVENTS & STREAKS API ENDPOINTS
# ==========================================

def get_workout_meta(workout_type: str):
    wtype = (workout_type or "").lower()
    if "rest" in wtype or "recovery" in wtype:
        return {"icon": "bed", "icon_type": "mc", "icon_color": "#64748b", "icon_bg": "#e2e8f0"}
    elif "walk" in wtype:
        return {"icon": "walk", "icon_type": "mc", "icon_color": "#0d9488", "icon_bg": "#ccfbf1"}
    elif "swim" in wtype:
        return {"icon": "swim", "icon_type": "mc", "icon_color": "#0284c7", "icon_bg": "#bae6fd"}
    elif "bike" in wtype or "cycle" in wtype:
        return {"icon": "bike", "icon_type": "mc", "icon_color": "#ea580c", "icon_bg": "#ffdbca"}
    elif "strength" in wtype or "gym" in wtype or "hyrox" in wtype or "sled" in wtype:
        return {"icon": "dumbbell", "icon_type": "mc", "icon_color": "#7c3aed", "icon_bg": "#ede9fe"}
    elif "interval" in wtype or "speed" in wtype or "tempo" in wtype:
        return {"icon": "lightning-bolt", "icon_type": "mc", "icon_color": "#d97706", "icon_bg": "#fef3c7"}
    elif "long" in wtype or "heart" in wtype:
        return {"icon": "heart", "icon_type": "mc", "icon_color": "#e11d48", "icon_bg": "#fce7f3"}
    else:
        return {"icon": "run", "icon_type": "mc", "icon_color": "#00685f", "icon_bg": "#89f5e7"}

def get_day_workout_from_plan(plan_data: dict, day_num: int):
    weeks = plan_data.get("weeks", []) if plan_data else []
    if not weeks:
        return {"workout_type": "Zone 2 Base Run", "description": "45 min steady aerobic nasal breathing run"}
    
    if 7 <= day_num <= 13:
        w_idx = 0
        d_idx = day_num - 7
    elif 1 <= day_num <= 6:
        w_idx = 0
        d_idx = day_num
    elif 14 <= day_num <= 20:
        w_idx = 1 if len(weeks) > 1 else 0
        d_idx = day_num - 14
    elif 21 <= day_num <= 27:
        w_idx = 2 if len(weeks) > 2 else len(weeks) - 1
        d_idx = day_num - 21
    else:
        w_idx = 3 if len(weeks) > 3 else len(weeks) - 1
        d_idx = day_num - 28

    week_obj = weeks[w_idx] if w_idx < len(weeks) else weeks[-1]
    days_arr = week_obj.get("days", [])
    if d_idx < len(days_arr):
        day_obj = days_arr[d_idx]
        return {
            "workout_type": day_obj.get("workout_type", "Zone 2 Base Run"),
            "description": day_obj.get("description", "45 min steady aerobic nasal breathing run")
        }
    return {"workout_type": "Easy Recovery Run", "description": "30 min light jog"}

def seed_month_events_in_db(cur, user_id: int, username: str, year: int = 2026, month: int = 9, plan_data: dict = None, reset_all: bool = False):
    if reset_all:
        cur.execute("DELETE FROM scheduled_events WHERE username = %s AND EXTRACT(YEAR FROM event_date) = %s AND EXTRACT(MONTH FROM event_date) = %s;", (username, year, month))
        existing = {}
    else:
        cur.execute("SELECT id, day_number, status FROM scheduled_events WHERE username = %s AND EXTRACT(YEAR FROM event_date) = %s AND EXTRACT(MONTH FROM event_date) = %s;", (username, year, month))
        existing = {r["day_number"]: r for r in cur.fetchall()}
    
    days_in_month = 30
    for day in range(1, days_in_month + 1):
        if day in existing:
            continue
        event_date_str = f"{year:04d}-{month:02d}-{day:02d}"
        workout = get_day_workout_from_plan(plan_data, day)
        meta = get_workout_meta(workout["workout_type"])
        cur.execute("""
            INSERT INTO scheduled_events 
            (user_id, username, event_date, day_number, workout_type, description, icon, icon_type, icon_color, icon_bg, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'planned')
            ON CONFLICT (username, event_date) DO NOTHING;
        """, (
            user_id, username, event_date_str, day,
            workout["workout_type"], workout["description"],
            meta["icon"], meta["icon_type"], meta["icon_color"], meta["icon_bg"]
        ))

def update_future_events_in_db(cur, username: str, plan_data: dict, from_date_str: str = "2026-09-12", adaptation: str = None):
    cur.execute("""
        SELECT id, event_date, day_number, status
        FROM scheduled_events
        WHERE username = %s AND event_date >= %s AND status != 'completed';
    """, (username, from_date_str))
    events_to_update = cur.fetchall()

    for ev in events_to_update:
        day_num = ev["day_number"]
        is_today = (str(ev["event_date"]) == from_date_str or day_num == 12)
        
        if is_today and adaptation:
            if adaptation == 'walk':
                wtype = "Active Walk & Form Recovery"
                wdesc = "Gentle outdoor walk to keep tendons supple"
            elif adaptation == 'ease':
                wtype = "Zone 1-2 Easy Aerobic Recovery"
                wdesc = "Dialed back 30% intensity for fresh legs"
            elif adaptation == 'rest':
                wtype = "Full Rest & Cellular Regeneration"
                wdesc = "Sleep, hydrate, and let mitochondria rebuild"
            else:
                workout = get_day_workout_from_plan(plan_data, day_num)
                wtype = workout["workout_type"]
                wdesc = workout["description"]
        else:
            workout = get_day_workout_from_plan(plan_data, day_num)
            wtype = workout["workout_type"]
            wdesc = workout["description"]

        meta = get_workout_meta(wtype)
        cur.execute("""
            UPDATE scheduled_events
            SET workout_type = %s, description = %s, icon = %s, icon_type = %s, icon_color = %s, icon_bg = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s;
        """, (wtype, wdesc, meta["icon"], meta["icon_type"], meta["icon_color"], meta["icon_bg"], ev["id"]))

class CompleteEventRequest(BaseModel):
    username: str
    event_date: Optional[str] = None
    day_number: Optional[int] = None
    xp_awarded: Optional[int] = 120

class UncompleteEventRequest(BaseModel):
    username: str
    event_date: Optional[str] = None
    day_number: Optional[int] = None

class SeedEventsRequest(BaseModel):
    username: str
    year: Optional[int] = 2026
    month: Optional[int] = 9
    reset_all: Optional[bool] = False

@app.get("/api/events")
def get_scheduled_events(username: str, year: int = 2026, month: int = 9):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE username = %s;", (username,))
            u_row = cur.fetchone()
            if not u_row:
                hashed = bcrypt.hashpw('demo123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cur.execute(
                    "INSERT INTO users (username, email, password_hash, xp, streak_days) VALUES (%s, %s, %s, 2450, 7) RETURNING id;",
                    (username, f"{username.lower()}@trifit.io", hashed)
                )
                u_row = cur.fetchone()
            user_id = u_row["id"]

            cur.execute("""
                SELECT * FROM scheduled_events
                WHERE username = %s AND EXTRACT(YEAR FROM event_date) = %s AND EXTRACT(MONTH FROM event_date) = %s
                ORDER BY day_number ASC;
            """, (username, year, month))
            events = cur.fetchall()

            if not events:
                cur.execute("SELECT plan_data FROM training_plans WHERE username = %s;", (username,))
                p_row = cur.fetchone()
                plan_data = p_row["plan_data"] if p_row else None
                if not plan_data:
                    cur.execute("SELECT race_type, race_date FROM athlete_profiles WHERE username = %s;", (username,))
                    prof = cur.fetchone()
                    race_type = prof["race_type"] if prof else "Hyrox Open / Pro"
                    race_date = prof["race_date"] if prof else "November 15, 2026"
                    plan_data = get_default_sport_plan(race_type, race_date)

                seed_month_events_in_db(cur, user_id, username, year, month, plan_data)
                conn.commit()

                cur.execute("""
                    SELECT * FROM scheduled_events
                    WHERE username = %s AND EXTRACT(YEAR FROM event_date) = %s AND EXTRACT(MONTH FROM event_date) = %s
                    ORDER BY day_number ASC;
                """, (username, year, month))
                events = cur.fetchall()

            for ev in events:
                if "event_date" in ev and ev["event_date"]:
                    ev["event_date"] = str(ev["event_date"])
                if "completed_at" in ev and ev["completed_at"]:
                    ev["completed_at"] = str(ev["completed_at"])
                if "created_at" in ev and ev["created_at"]:
                    ev["created_at"] = str(ev["created_at"])
                if "updated_at" in ev and ev["updated_at"]:
                    ev["updated_at"] = str(ev["updated_at"])

            return {"success": True, "events": events, "count": len(events)}
    finally:
        conn.close()

@app.post("/api/events/seed")
def seed_events(data: SeedEventsRequest):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE username = %s;", (data.username,))
            u_row = cur.fetchone()
            if not u_row:
                raise HTTPException(status_code=404, detail="User not found")
            user_id = u_row["id"]

            cur.execute("SELECT plan_data FROM training_plans WHERE username = %s;", (data.username,))
            p_row = cur.fetchone()
            plan_data = p_row["plan_data"] if p_row else None
            if not plan_data:
                cur.execute("SELECT race_type, race_date FROM athlete_profiles WHERE username = %s;", (data.username,))
                prof = cur.fetchone()
                race_type = prof["race_type"] if prof else "Hyrox Open / Pro"
                race_date = prof["race_date"] if prof else "November 15, 2026"
                plan_data = get_default_sport_plan(race_type, race_date)

            seed_month_events_in_db(cur, user_id, data.username, data.year or 2026, data.month or 9, plan_data, reset_all=data.reset_all)
            conn.commit()

            cur.execute("""
                SELECT * FROM scheduled_events
                WHERE username = %s AND EXTRACT(YEAR FROM event_date) = %s AND EXTRACT(MONTH FROM event_date) = %s
                ORDER BY day_number ASC;
            """, (data.username, data.year or 2026, data.month or 9))
            events = cur.fetchall()
            for ev in events:
                if "event_date" in ev and ev["event_date"]:
                    ev["event_date"] = str(ev["event_date"])
                if "completed_at" in ev and ev["completed_at"]:
                    ev["completed_at"] = str(ev["completed_at"])
            return {"success": True, "events": events, "count": len(events)}
    finally:
        conn.close()

@app.post("/api/events/complete")
def complete_event(data: CompleteEventRequest):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if data.event_date:
                cur.execute("""
                    UPDATE scheduled_events
                    SET status = 'completed', is_completed = TRUE, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                    WHERE username = %s AND event_date = %s
                    RETURNING *;
                """, (data.username, data.event_date))
            elif data.day_number:
                cur.execute("""
                    UPDATE scheduled_events
                    SET status = 'completed', is_completed = TRUE, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                    WHERE username = %s AND day_number = %s AND EXTRACT(MONTH FROM event_date) = 9
                    RETURNING *;
                """, (data.username, data.day_number))
            else:
                cur.execute("""
                    UPDATE scheduled_events
                    SET status = 'completed', is_completed = TRUE, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                    WHERE username = %s AND event_date = '2026-09-12'
                    RETURNING *;
                """, (data.username,))

            event = cur.fetchone()
            if not event:
                raise HTTPException(status_code=404, detail="Event not found to mark completed")

            xp_inc = data.xp_awarded if data.xp_awarded is not None else 120
            cur.execute("""
                UPDATE users
                SET xp = COALESCE(xp, 0) + %s, streak_days = COALESCE(streak_days, 0) + 1
                WHERE username = %s
                RETURNING id, username, xp, streak_days;
            """, (xp_inc, data.username))
            user_stats = cur.fetchone()
            conn.commit()

            if "event_date" in event and event["event_date"]:
                event["event_date"] = str(event["event_date"])
            if "completed_at" in event and event["completed_at"]:
                event["completed_at"] = str(event["completed_at"])

            return {"success": True, "event": event, "user": user_stats}
    finally:
        conn.close()

@app.post("/api/events/uncomplete")
def uncomplete_event(data: UncompleteEventRequest):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if data.event_date:
                cur.execute("""
                    UPDATE scheduled_events
                    SET status = 'planned', is_completed = FALSE, completed_at = NULL, updated_at = CURRENT_TIMESTAMP
                    WHERE username = %s AND event_date = %s
                    RETURNING *;
                """, (data.username, data.event_date))
            elif data.day_number:
                cur.execute("""
                    UPDATE scheduled_events
                    SET status = 'planned', is_completed = FALSE, completed_at = NULL, updated_at = CURRENT_TIMESTAMP
                    WHERE username = %s AND day_number = %s AND EXTRACT(MONTH FROM event_date) = 9
                    RETURNING *;
                """, (data.username, data.day_number))
            event = cur.fetchone()
            conn.commit()
            if event and "event_date" in event and event["event_date"]:
                event["event_date"] = str(event["event_date"])
            return {"success": True, "event": event}
    finally:
        conn.close()



# ==========================================
# OPEN WEARABLES API INTEGRATION ENDPOINTS
# ==========================================

class WearableIngressRequest(BaseModel):
    username: str
    provider: Optional[str] = "open_wearables"
    readiness_score: Optional[int] = 88
    hrv_ms: Optional[int] = 64
    sleep_hours: Optional[float] = 8.2
    resting_hr: Optional[int] = 52
    steps: Optional[int] = 6400
    active_calories: Optional[int] = 480
    zone2_minutes: Optional[int] = 45

@app.post("/api/wearables/ingress")
def ingest_wearable_data(data: WearableIngressRequest):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO wearable_metrics 
                (username, provider, readiness_score, hrv_ms, sleep_hours, resting_hr, steps, active_calories, zone2_minutes, synced_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                RETURNING *;
                """,
                (
                    data.username, data.provider, data.readiness_score, data.hrv_ms,
                    data.sleep_hours, data.resting_hr, data.steps, data.active_calories,
                    data.zone2_minutes
                )
            )
            inserted = cur.fetchone()
            conn.commit()
            return {"success": True, "wearable": inserted}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        conn.close()

@app.get("/api/wearables/current")
def get_current_wearable_data(username: str = "testuser2"):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM wearable_metrics WHERE username = %s ORDER BY synced_at DESC LIMIT 1;",
                (username,)
            )
            metrics = cur.fetchone()
            if not metrics:
                cur.execute(
                    """
                    INSERT INTO wearable_metrics (username, readiness_score, hrv_ms, sleep_hours, resting_hr, steps, active_calories, zone2_minutes)
                    VALUES (%s, 88, 64, 8.2, 52, 6400, 480, 45)
                    RETURNING *;
                    """,
                    (username,)
                )
                metrics = cur.fetchone()
                conn.commit()
            return {"success": True, "metrics": metrics}
    finally:
        conn.close()

@app.post("/api/wearables/sync-simulated")
def sync_simulated_wearable_data(username: str = "testuser2"):
    import random
    readiness = random.randint(75, 96)
    hrv = random.randint(55, 78)
    sleep = round(random.uniform(7.0, 8.8), 1)
    resting_hr = random.randint(48, 58)
    steps = random.randint(6000, 11000)
    calories = random.randint(400, 750)
    zone2 = random.randint(30, 60)
    
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO wearable_metrics 
                (username, provider, readiness_score, hrv_ms, sleep_hours, resting_hr, steps, active_calories, zone2_minutes, synced_at)
                VALUES (%s, 'open_wearables_live', %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                RETURNING *;
                """,
                (username, readiness, hrv, sleep, resting_hr, steps, calories, zone2)
            )
            inserted = cur.fetchone()
            conn.commit()
            return {"success": True, "wearable": inserted}
    finally:
        conn.close()
