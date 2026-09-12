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
