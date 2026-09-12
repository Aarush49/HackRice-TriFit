import sys
from database import get_db

def clear_database():
    """Truncates all data tables (users, athlete_profiles, training_plans)."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Truncate tables with CASCADE to clean dependent tables as well
            cur.execute("TRUNCATE TABLE training_plans, athlete_profiles, users RESTART IDENTITY CASCADE;")
            conn.commit()
            print("[DB CLEAR SUCCESS] All tables (training_plans, athlete_profiles, users) have been cleared and IDs reset.")
    except Exception as e:
        conn.rollback()
        print(f"[DB CLEAR ERROR] Failed to clear database: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    confirm = input("Are you sure you want to clear all data in the database? (y/N): ").strip().lower()
    if confirm == "y":
        clear_database()
    else:
        print("Operation cancelled.")
