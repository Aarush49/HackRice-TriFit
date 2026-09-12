import json
from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from database import get_db
from schemas import CoachChatRequest
from services.gemini_service import generate_gemini_chat_response

router = APIRouter(tags=["Coach Maya AI Chat"])

@router.post("/api/coach/chat")
@router.post("/api/chat")
def chat_with_coach_maya(data: CoachChatRequest):
    username = data.username or "DemoAccount"
    user_msg = data.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    profile_info = {}
    wearable_info = {}
    today_event = {}

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # 1. Fetch user profile
            cur.execute("SELECT * FROM athlete_profiles WHERE username = %s;", (username,))
            p_row = cur.fetchone()
            if p_row:
                profile_info = dict(p_row)

            # 2. Fetch latest wearable metrics
            cur.execute("""
                SELECT * FROM wearable_metrics 
                WHERE username = %s 
                ORDER BY synced_at DESC LIMIT 1;
            """, (username,))
            w_row = cur.fetchone()
            if w_row:
                wearable_info = dict(w_row)

            # 3. Fetch today's scheduled event (September 12, 2026)
            cur.execute("""
                SELECT * FROM scheduled_events 
                WHERE username = %s AND event_date = '2026-09-12';
            """, (username,))
            e_row = cur.fetchone()
            if e_row:
                today_event = dict(e_row)
    except Exception as e:
        print(f"[CHAT WARN] Database context fetch error: {e}")
    finally:
        conn.close()

    # Athlete variables
    athlete_name = username
    race_type = profile_info.get("race_type") or "Hyrox Open / Pro"
    race_date = profile_info.get("race_date") or "November 15, 2026"
    fitness_level = profile_info.get("fitness_level") or "Intermediate Endurance"
    training_days = profile_info.get("training_days") or 4
    equipment = profile_info.get("equipment") or ["GPS Watch", "Running Shoes", "Dumbbells"]
    baseline_metrics = profile_info.get("baseline_metrics") or {}
    injuries = profile_info.get("injuries") or "None"

    # Wearable biometrics
    readiness = wearable_info.get("readiness_score") or 88
    hrv = wearable_info.get("hrv_ms") or 64
    sleep = wearable_info.get("sleep_hours") or 8.2
    resting_hr = wearable_info.get("resting_hr") or 52
    zone2_mins = wearable_info.get("zone2_minutes") or 45

    # Today's event
    workout_name = today_event.get("workout_type") or "Compromised Run"
    workout_desc = today_event.get("description") or "4 x 800m run with 100 Wall Balls (6kg) buy-in"

    system_instruction = f"""You are Coach Maya, the elite AI endurance, triathlon, and longevity coach for TriFit.
Your personality is encouraging, scientifically grounded, high-energy, empathetic, and direct.

CURRENT ATHLETE PROFILE & BIOMETRICS:
- Athlete Name: {athlete_name}
- Target Event: {race_type} (Target Date: {race_date})
- Fitness Level: {fitness_level}
- Training Frequency: {training_days} days/week
- Equipment Available: {equipment}
- Baseline Performance: {baseline_metrics}
- Injuries / Limitations: {injuries}

LIVE BIOMETRIC TELEMETRY:
- Daily Readiness Score: {readiness}% ({"Optimal Prime State" if readiness >= 80 else "Recovery Focus"})
- Heart Rate Variability (HRV): {hrv} ms
- Sleep: {sleep} hours
- Resting Heart Rate: {resting_hr} bpm
- Zone 2 Time Today: {zone2_mins} minutes
- Today's Scheduled Session: {workout_name} ({workout_desc})

COACHING RULES:
1. Speak directly, warmly, and enthusiastically to the athlete (e.g., "Hey {athlete_name}!").
2. Answer questions thoroughly using sports science: explain aerobic base (Zone 2), lactate threshold, HR pacing, nutrition/fueling, hydration, tendon health, recovery, and race preparation.
3. Reference their biometrics (readiness, HRV, sleep, target race) when relevant to contextualize your advice.
4. Format responses cleanly for mobile: use short paragraphs, clear bullet points or bold highlights where helpful.
5. Use emojis tastefully (🏃‍♀️, 🫀, ⚡, 🧬, 🥑, 🚴‍♂️, 🏊‍♂️, 🏋️‍♂️).
6. Keep responses focused and digestible (around 2 to 4 concise paragraphs max)."""

    # Build multi-turn messages array
    gemini_messages = []

    if data.history:
        for msg in data.history[-6:]:
            role = "user" if msg.sender == "user" else "model"
            gemini_messages.append({
                "role": role,
                "parts": [{"text": msg.text}]
            })

    # Append current user message
    gemini_messages.append({
        "role": "user",
        "parts": [{"text": user_msg}]
    })

    try:
        reply_text = generate_gemini_chat_response(
            messages=gemini_messages,
            system_instruction=system_instruction,
            model="gemini-2.5-flash"
        )
        return {
            "success": True,
            "reply": reply_text,
            "coach": "Coach Maya",
            "timestamp": "Just now"
        }
    except Exception as e:
        print(f"[CHAT ERROR] Gemini generation error: {e}")
        # Graceful fallback response if API is unreachable
        fallback_reply = (
            f"Hey {athlete_name}! 🏃‍♀️ I'm analyzing your {race_type} training plan and telemetry (Readiness: {readiness}%, HRV: {hrv}ms). "
            f"For today's {workout_name} session, focus on smooth aerobic rhythm and nasal breathing to build mitochondrial density. "
            "Let me know if you need pacing targets or recovery advice!"
        )
        return {
            "success": True,
            "reply": fallback_reply,
            "coach": "Coach Maya",
            "timestamp": "Just now",
            "fallback": True
        }
