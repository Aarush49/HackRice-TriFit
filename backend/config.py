import os
from pathlib import Path
from dotenv import load_dotenv

# Search for environment files in current and parent directory
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

# Authentication & JWT settings
SECRET_KEY = os.getenv("JWT_SECRET", "trifit_super_secure_jwt_secret_key_2026_timescaledb")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

# Optional: ElevenLabs
try:
    from elevenlabs import ElevenLabs
except ImportError:
    ElevenLabs = None

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
eleven_client = ElevenLabs(api_key=ELEVENLABS_API_KEY) if (ElevenLabs and ELEVENLABS_API_KEY) else None
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default Rachel voice

# Optional: Google Gemini
try:
    import logging
    # Suppress internal AFC direct use warnings from google-genai
    logging.getLogger("google_genai").setLevel(logging.ERROR)
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if (genai and GEMINI_API_KEY) else None
