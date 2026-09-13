from typing import Optional, List, Dict, Any
from pydantic import BaseModel

# --- Auth & User Schemas ---
class SignupRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    password: str

class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

class UpdateStatsRequest(BaseModel):
    username: str
    xp_to_add: Optional[int] = 0
    increment_streak: Optional[bool] = False

# --- Onboarding Schemas ---
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

# --- Training Plan Schemas ---
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

# --- Event Schemas ---
class CompleteEventRequest(BaseModel):
    username: str
    event_date: Optional[str] = None
    day_number: Optional[int] = None
    xp_awarded: Optional[int] = 120

class UncompleteEventRequest(BaseModel):
    username: str
    event_date: Optional[str] = None
    day_number: Optional[int] = None
    xp_to_remove: Optional[int] = 120

class SeedEventsRequest(BaseModel):
    username: str
    year: Optional[int] = 2026
    month: Optional[int] = 9
    reset_all: Optional[bool] = False

# --- Wearable Schemas ---
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

# --- TTS Schemas ---
class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None

# --- Coach Jim Chat Schemas ---
class ChatMessage(BaseModel):
    sender: Optional[str] = "user"
    text: str
    time: Optional[str] = None

class CoachChatRequest(BaseModel):
    username: Optional[str] = "DemoAccount"
    message: str
    history: Optional[List[ChatMessage]] = []
    user_context: Optional[dict] = {}

class CoachVoiceRequest(BaseModel):
    username: Optional[str] = "DemoAccount"
    audio_base64: str
    mime_type: Optional[str] = "audio/webm"
    history: Optional[List[ChatMessage]] = []
    user_context: Optional[dict] = {}

