import os
from typing import Optional
from fastapi import HTTPException
from config import eleven_client, ELEVENLABS_VOICE_ID

def generate_tts_stream(text: str, voice_id: Optional[str] = None):
    """
    Generates an ElevenLabs MP3 audio stream for the provided text.
    """
    if not eleven_client:
        raise HTTPException(status_code=500, detail="ElevenLabs API key is missing or client is not initialized.")
    
    target_voice = voice_id or ELEVENLABS_VOICE_ID

    try:
        audio_stream = eleven_client.text_to_speech.convert(
            voice_id=target_voice,
            text=text,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128"
        )
        return audio_stream
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ElevenLabs TTS generation failed: {str(e)}")
