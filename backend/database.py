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
            """)
            conn.commit()
            print("[DB] Users, Athlete Profiles, and Training Plans tables initialized successfully.")
    except Exception as e:
        conn.rollback()
        print(f"[DB ERROR] {e}")
        raise e
    finally:
        conn.close()
