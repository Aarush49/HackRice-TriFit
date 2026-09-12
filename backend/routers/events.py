import bcrypt
from typing import Optional
from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor

from database import get_db
from schemas import CompleteEventRequest, UncompleteEventRequest, SeedEventsRequest
from services.plan_service import get_default_sport_plan
from services.event_service import seed_month_events_in_db

router = APIRouter(prefix="/api/events", tags=["events"])

@router.get("")
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

@router.post("/seed")
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

@router.post("/complete")
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

@router.post("/uncomplete")
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
