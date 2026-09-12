import os
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor
import bcrypt
import jwt

from database import get_db, init_db

SECRET_KEY = os.getenv("JWT_SECRET", "trifit_super_secure_jwt_secret_key_2026_timescaledb")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

# Initialize ElevenLabs client if API key is present
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
eleven_client = ElevenLabs(api_key=ELEVENLABS_API_KEY) if ELEVENLABS_API_KEY else None

# Initialize Gemini client if API key is present
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

app = FastAPI(title="TriFit API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# --- Password & JWT Helpers ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_token(username: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": username, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

# --- Request Models ---
class UserCredentials(BaseModel):
    username: str
    password: str

# ==========================================
# 3 ENDPOINTS: SIGNUP, LOGIN, GET USER
# ==========================================

# 1. SIGNUP
@app.post("/signup")
def signup(data: UserCredentials):
    username = data.username.strip()
    password = data.password.strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE username = %s;", (username,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Username already exists")

            hashed = hash_password(password)
            cur.execute(
                "INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING username;",
                (username, hashed)
            )
            conn.commit()

            token = create_token(username)
            return {
                "message": "Signup successful",
                "username": username,
                "access_token": token
            }
    finally:
        conn.close()

# 2. LOGIN
@app.post("/login")
def login(data: UserCredentials):
    username = data.username.strip()
    password = data.password.strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT password_hash FROM users WHERE username = %s;", (username,))
            user = cur.fetchone()

            if not user or not verify_password(password, user["password_hash"]):
                raise HTTPException(status_code=401, detail="Invalid username or password")

            token = create_token(username)
            return {
                "message": "Login successful",
                "username": username,
                "access_token": token
            }
    finally:
        conn.close()

security = HTTPBearer()

# 3. GET USER INFO
@app.get("/user")
def get_user_info(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials.strip().strip('"').strip("'")
    if token.lower().startswith("bearer "):
        token = token[7:].strip()

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"username": username}
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

# Helper function to generate response using Gemini API
def generate_gemini_response(prompt: str, model: str = "gemini-2.5-flash") -> str:
    """
    Generates text using Google Gemini API given a prompt.
    """
    if not gemini_client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
    
    response = gemini_client.models.generate_content(
        model=model,
        contents=prompt,
    )
    return response.text
