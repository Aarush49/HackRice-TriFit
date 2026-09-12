from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from schemas import TTSRequest
from services.gemini_service import clean_markdown_for_speech
from services.tts_service import generate_tts_stream

router = APIRouter(tags=["tts"])

@router.post("/api/tts")
@router.post("/tts")
def text_to_speech(data: TTSRequest):
    """
    Converts given text to speech using ElevenLabs API and streams the MP3 audio back.
    """
    clean_text = clean_markdown_for_speech(data.text)
    if not clean_text:
        raise HTTPException(status_code=400, detail="Text is empty")

    audio_stream = generate_tts_stream(clean_text, voice_id=data.voice_id)

    return StreamingResponse(
        audio_stream,
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=speech.mp3"}
    )
