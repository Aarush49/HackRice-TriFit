import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

# Search for tiger-cloud-trifit-credentials.env or .env in current and parent directory
_current_dir = Path(__file__).resolve().parent
_parent_dir = _current_dir.parent

for _env_file in [
    _current_dir / "tests" / ".env",
    _current_dir / "tiger-cloud-trifit-credentials.env.local",
    _parent_dir / "tiger-cloud-trifit-credentials.env.local",
    _current_dir / "tiger-cloud-trifit-credentials.env",
    _parent_dir / "tiger-cloud-trifit-credentials.env",
    _current_dir / ".env.local",
    _parent_dir / ".env.local",
    _current_dir / ".env",
    _parent_dir / ".env",
]:
    if _env_file.exists():
        load_dotenv(dotenv_path=str(_env_file), override=True)

DATABASE_URL = os.getenv(
    "TIMESCALE_SERVICE_URL",
    os.getenv("DATABASE_URL")
)

def get_db():
    """Returns a new psycopg2 connection to TimescaleDB."""
    if not DATABASE_URL:
        raise ValueError("TIMESCALE_SERVICE_URL environment variable is missing!")
    return psycopg2.connect(DATABASE_URL)

def init_db():
    """Create the users and athlete_profiles tables if they do not exist."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(255),
                    password_hash VARCHAR(255) NOT NULL,
                    xp INT DEFAULT 0,
                    streak_days INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                -- Ensure columns exist if table was already created
                ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_days INT DEFAULT 0;

                CREATE TABLE IF NOT EXISTS athlete_profiles (
                    id SERIAL PRIMARY KEY,
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    race_type VARCHAR(100),
                    race_date VARCHAR(50),
                    is_first_time VARCHAR(10),
                    previous_time VARCHAR(50),
                    fitness_level VARCHAR(100),
                    training_days INT DEFAULT 4,
                    equipment JSONB,
                    baseline_metrics JSONB,
                    sleep_hours VARCHAR(50),
                    stress_level VARCHAR(100),
                    injuries TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS training_plans (
                    id SERIAL PRIMARY KEY,
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    plan_data JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS wearable_metrics (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) NOT NULL,
                    provider VARCHAR(50) DEFAULT 'open_wearables',
                    readiness_score INT DEFAULT 88,
                    hrv_ms INT DEFAULT 64,
                    sleep_hours NUMERIC(4,1) DEFAULT 8.2,
                    resting_hr INT DEFAULT 52,
                    steps INT DEFAULT 6400,
                    active_calories INT DEFAULT 480,
                    zone2_minutes INT DEFAULT 45,
                    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS scheduled_events (
                    id SERIAL PRIMARY KEY,
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    username VARCHAR(100) NOT NULL,
                    event_date DATE NOT NULL,
                    day_number INT NOT NULL,
                    workout_type VARCHAR(100) NOT NULL,
                    description TEXT,
                    icon VARCHAR(50) DEFAULT 'run',
                    icon_type VARCHAR(20) DEFAULT 'mc',
                    icon_color VARCHAR(30) DEFAULT '#00685f',
                    icon_bg VARCHAR(30) DEFAULT '#89f5e7',
                    status VARCHAR(20) DEFAULT 'planned',
                    completed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (username, event_date)
                );

                CREATE INDEX IF NOT EXISTS idx_scheduled_events_user_date ON scheduled_events(username, event_date);

                -- Ensure columns exist if table was already created
                ALTER TABLE scheduled_events ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'planned';
                ALTER TABLE scheduled_events ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'run';
                ALTER TABLE scheduled_events ADD COLUMN IF NOT EXISTS icon_type VARCHAR(20) DEFAULT 'mc';
                ALTER TABLE scheduled_events ADD COLUMN IF NOT EXISTS icon_color VARCHAR(30) DEFAULT '#00685f';
                ALTER TABLE scheduled_events ADD COLUMN IF NOT EXISTS icon_bg VARCHAR(30) DEFAULT '#89f5e7';
                ALTER TABLE scheduled_events ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

                -- Seed DemoAccount user and profile
                INSERT INTO users (username, email, password_hash, xp, streak_days)
                VALUES ('DemoAccount', 'demo@trifit.io', '$2b$12$eXAMP1eHashForDemoAccountAuthenticationOnly000', 2450, 7)
                ON CONFLICT (username) DO NOTHING;

                INSERT INTO athlete_profiles (user_id, username, race_type, race_date, fitness_level, training_days)
                SELECT id, 'DemoAccount', 'Hyrox Open / Pro', 'November 15, 2026', 'Intermediate', 5
                FROM users WHERE username = 'DemoAccount'
                ON CONFLICT (username) DO NOTHING;
            """)
            conn.commit()
            print("[DB] Users, Athlete Profiles, Training Plans, Scheduled Events, and Wearables tables initialized successfully.")
    except Exception as e:
        conn.rollback()
        print(f"[DB ERROR] {e}")
        raise e
    finally:
        conn.close()
