import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

# Search for tiger-cloud-trifit-credentials.env or .env in current and parent directory
_current_dir = Path(__file__).resolve().parent
_parent_dir = _current_dir.parent

for _env_file in [
    _current_dir / "tiger-cloud-trifit-credentials.env",
    _parent_dir / "tiger-cloud-trifit-credentials.env",
    _current_dir / ".env",
    _parent_dir / ".env",
]:
    if _env_file.exists():
        load_dotenv(dotenv_path=str(_env_file))

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
    """Create the users table if it does not exist."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(255),
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            print("[DB] Users table initialized successfully.")
    except Exception as e:
        conn.rollback()
        print(f"[DB ERROR] {e}")
        raise e
    finally:
        conn.close()
