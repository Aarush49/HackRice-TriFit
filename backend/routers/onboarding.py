import json
from typing import Optional
from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor

from database import get_db
from schemas import OnboardingData

router = APIRouter(tags=["onboarding"])

@router.post("/onboarding")
@router.post("/api/onboarding")
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

@router.get("/onboarding")
@router.get("/api/onboarding")
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
