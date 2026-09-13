import os
import json
import bcrypt
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from psycopg2.extras import RealDictCursor

from database import get_db
from config import gemini_client, eleven_client, ELEVENLABS_VOICE_ID
from schemas import OnboardingData, PlanAdjustmentRequest, SavePlanRequest
from services.gemini_service import generate_gemini_response, clean_markdown_for_speech
from services.plan_service import get_default_sport_plan
from services.event_service import update_future_events_in_db

router = APIRouter(tags=["plans"])

@router.post("/training-plan")
@router.post("/api/training-plan")
@router.get("/training-plan")
@router.get("/api/training-plan")
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
    voice_id = ELEVENLABS_VOICE_ID
    
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

@router.post("/api/plan/save")
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

@router.post("/api/plan/generate")
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
            gemini_text = generate_gemini_response(prompt, system_instruction=system_instruction)
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

@router.get("/api/plan/current")
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

@router.post("/api/plan/adjust")
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
                gemini_text = generate_gemini_response(prompt, system_instruction=system_instruction)
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
