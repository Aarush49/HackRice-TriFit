import random
from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor

from database import get_db
from schemas import WearableIngressRequest

router = APIRouter(prefix="/api/wearables", tags=["wearables"])

@router.post("/ingress")
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

@router.get("/current")
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

@router.post("/sync-simulated")
def sync_simulated_wearable_data(username: str = "testuser2"):
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
