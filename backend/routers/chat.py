import json
import base64
import urllib.parse
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from psycopg2.extras import RealDictCursor
from database import get_db
from schemas import CoachChatRequest, CoachVoiceRequest
from services.gemini_service import (
    generate_gemini_chat_response,
    transcribe_audio_with_elevenlabs,
    clean_markdown_for_speech
)
from services.tts_service import generate_tts_stream

router = APIRouter(tags=["Coach Jim AI Chat"])

def get_athlete_context(username: str):
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

    system_instruction = f"""You are Coach Jim, the friendly, athletic, charismatic capybara mascot and elite AI endurance, triathlon, and longevity coach for TriFit.
Your personality is encouraging, scientifically grounded, charismatic, supportive, and direct. You have a relaxed, unflappable capybara calmness paired with high-performance endurance expertise.

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
1. Speak directly, warmly, and enthusiastically to the athlete (e.g., "Hey {athlete_name}! 🦫").
2. Answer questions thoroughly using sports science: explain aerobic base (Zone 2), lactate threshold, HR pacing, nutrition/fueling, hydration, tendon health, recovery, and race preparation.
3. Reference their biometrics (readiness, HRV, sleep, target race) when relevant to contextualize your advice.
4. Format responses cleanly for mobile & voice: use short, focused paragraphs, clear highlights, and energetic encouragement.
5. Use emojis tastefully (🦫, 🏃‍♂️, 🫀, ⚡, 🧬, 🥑, 🚴‍♂️, 🏊‍♂️, 🏋️‍♂️).
6. Keep responses focused and digestible (around 2 to 3 concise paragraphs max)."""

    return {
        "athlete_name": athlete_name,
        "race_type": race_type,
        "readiness": readiness,
        "hrv": hrv,
        "workout_name": workout_name,
        "system_instruction": system_instruction,
    }

@router.post("/api/coach/chat")
@router.post("/api/chat")
def chat_with_coach_jim(data: CoachChatRequest):
    username = data.username or "DemoAccount"
    user_msg = data.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    ctx = get_athlete_context(username)

    # Build multi-turn messages array
    gemini_messages = []
    if data.history:
        for msg in data.history[-6:]:
            role = "user" if msg.sender == "user" else "model"
            gemini_messages.append({
                "role": role,
                "parts": [{"text": msg.text}]
            })

    gemini_messages.append({
        "role": "user",
        "parts": [{"text": user_msg}]
    })

    try:
        reply_text = generate_gemini_chat_response(
            messages=gemini_messages,
            system_instruction=ctx["system_instruction"]
        )
        return {
            "success": True,
            "reply": reply_text,
            "coach": "Coach Jim",
            "timestamp": "Just now"
        }
    except Exception as e:
        print(f"[CHAT ERROR] Gemini generation error: {e}")
        fallback_reply = (
            f"Hey {ctx['athlete_name']}! 🦫 Coach Jim here! I'm analyzing your {ctx['race_type']} training plan and telemetry (Readiness: {ctx['readiness']}%, HRV: {ctx['hrv']}ms). "
            f"For today's {ctx['workout_name']} session, focus on smooth aerobic rhythm and nasal breathing to build mitochondrial density. "
            "Let me know if you need pacing targets or recovery advice!"
        )
        return {
            "success": True,
            "reply": fallback_reply,
            "coach": "Coach Jim",
            "timestamp": "Just now",
            "fallback": True
        }

@router.post("/api/coach/voice")
@router.post("/api/coach-maya-voice")
def voice_with_coach_maya(data: CoachVoiceRequest):
    """
    1. Transcribes incoming base64 audio with ElevenLabs Speech-to-Text.
    2. Generates personalized Coach Maya advice via Gemma 4 26B.
    3. Converts Coach Maya's reply to speech via ElevenLabs TTS.
    4. Streams MP3 back with X-Maya-Transcription & X-Maya-Reply headers.
    """
    username = data.username or "DemoAccount"
    if not data.audio_base64 or not data.audio_base64.strip():
        raise HTTPException(status_code=400, detail="Audio base64 data cannot be empty.")

    # 1. Decode audio bytes
    raw_b64 = data.audio_base64.strip()
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]

    try:
        audio_bytes = base64.b64decode(raw_b64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 audio: {e}")

    print(f"[VOICE] Received {len(audio_bytes)} bytes of audio, base64 length={len(raw_b64)}")

    # Guard: reject recordings that are too small to contain real audio
    if len(audio_bytes) < 1000:
        print(f"[VOICE] Audio too short ({len(audio_bytes)} bytes) — likely empty recording from frontend")
        # Instead of sending garbage to ElevenLabs, use a default prompt
        transcription = "How should I approach my training today?"
        print(f"[VOICE] Using default prompt: '{transcription}'")
    else:
        # 2. Transcribe with ElevenLabs STT
        mime_type = data.mime_type or "audio/webm"
        transcription = transcribe_audio_with_elevenlabs(audio_bytes, mime_type=mime_type)

    if not transcription or len(transcription.strip()) < 2:
        transcription = "How should I approach my training and pacing today?"

    # 3. Generate Coach Maya response with athlete context
    ctx = get_athlete_context(username)
    gemini_messages = []
    if data.history:
        for msg in data.history[-4:]:
            role = "user" if msg.sender == "user" else "model"
            gemini_messages.append({
                "role": role,
                "parts": [{"text": msg.text}]
            })

    gemini_messages.append({
        "role": "user",
        "parts": [{"text": transcription}]
    })

    try:
        reply_text = generate_gemini_chat_response(
            messages=gemini_messages,
            system_instruction=ctx["system_instruction"]
        )
    except Exception as e:
        print(f"[VOICE CHAT ERROR] Gemini error: {e}")
        reply_text = (
            f"Hey {ctx['athlete_name']}! For your {ctx['workout_name']} session today, keep your heart rate in Zone 2 to preserve tendon integrity and optimize aerobic capacity."
        )

    clean_speech_text = clean_markdown_for_speech(reply_text)

    # 4. Generate ElevenLabs TTS audio stream
    try:
        audio_stream = generate_tts_stream(clean_speech_text)
        
        encoded_transcription = urllib.parse.quote(transcription)
        encoded_reply = urllib.parse.quote(reply_text)

        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=maya_voice.mp3",
                "X-Maya-Transcription": encoded_transcription,
                "X-Maya-Reply": encoded_reply,
                "Access-Control-Expose-Headers": "X-Maya-Transcription, X-Maya-Reply, Content-Disposition"
            }
        )
    except Exception as e:
        print(f"[VOICE TTS ERROR] ElevenLabs error: {e}")
        # If ElevenLabs fails, fallback to JSON with text
        return {
            "success": True,
            "transcription": transcription,
            "reply": reply_text,
            "coach": "Coach Maya",
            "audio_error": str(e)
        }
