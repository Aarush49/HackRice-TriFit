import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

app = FastAPI(title="TriFit Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ElevenLabs client if API key is present
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
eleven_client = ElevenLabs(api_key=ELEVENLABS_API_KEY) if ELEVENLABS_API_KEY else None

@app.get("/")
def read_root():
    return {
        "message": "Welcome to TriFit Backend API",
        "elevenlabs_status": "configured" if ELEVENLABS_API_KEY else "api_key_missing"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
