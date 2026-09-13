import re
from typing import Optional
from fastapi import HTTPException
from config import gemini_client, types

def clean_markdown_for_speech(text: str) -> str:
    """Removes markdown symbols, emojis, and normalizes whitespace for TTS speech engines."""
    if not text:
        return ""
    # Remove markdown formatting characters (*, _, ~, `, #)
    text = re.sub(r'[*_~`#]', '', text)
    # Remove bullet markers at line starts
    text = re.sub(r'^\s*[-+*]\s+', '', text, flags=re.MULTILINE)
    # Remove emojis and special unicode symbols
    text = re.sub(r'[\U00010000-\U0010ffff\u2600-\u27ff\u2300-\u23ff\u2000-\u206f\u2b00-\u2bff]', '', text)
    # Normalize space & newline sequences
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def generate_gemini_response(
    prompt: str,
    system_instruction: Optional[str] = None,
) -> str:
    """
    Generates text using Google Gemma 4 26B / Gemini API given a prompt and optional system instruction.
    """
    if not gemini_client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
    
    config = types.GenerateContentConfig(system_instruction=system_instruction) if (types and system_instruction) else None

    try:
        response = gemini_client.models.generate_content(
            model="gemma-4-26b-a4b-it",
            contents=prompt,
            config=config
        )
        if response and response.text:
            return response.text
        raise HTTPException(status_code=500, detail="Gemini API returned empty response.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

def generate_gemini_chat_response(
    messages: list,
    system_instruction: Optional[str] = None,
) -> str:
    """
    Generates dynamic multi-turn chat response using Google Gemma 4 26B / Gemini API.
    """
    if not gemini_client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
    
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.7,
    ) if (types and system_instruction) else None

    try:
        response = gemini_client.models.generate_content(
            model="gemma-4-26b-a4b-it",
            contents=messages,
            config=config
        )
        if response and response.text:
            return response.text
        raise HTTPException(status_code=500, detail="Gemini Chat API returned empty response.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Chat API error: {str(e)}")

def transcribe_audio_with_elevenlabs(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    """
    Transcribes spoken audio bytes using ElevenLabs Speech-to-Text API.
    """
    from io import BytesIO
    from config import eleven_client

    if not eleven_client:
        raise HTTPException(status_code=500, detail="ELEVENLABS_API_KEY is not configured.")

    # Detect actual audio format from magic bytes
    clean_mime = mime_type or "audio/webm"
    if len(audio_bytes) >= 12:
        header = audio_bytes[:12]
        if header.startswith(b"\x1a\x45\xdf\xa3"):
            clean_mime = "audio/webm"
        elif header.startswith(b"RIFF"):
            clean_mime = "audio/wav"
        elif header.startswith(b"ID3") or header.startswith(b"\xff\xfb") or header.startswith(b"\xff\xf3"):
            clean_mime = "audio/mp3"
        elif b"ftyp" in header:
            clean_mime = "audio/mp4"
        elif header.startswith(b"OggS"):
            clean_mime = "audio/ogg"

    # Map mime type to file extension
    mime_to_ext = {
        "audio/webm": "audio.webm",
        "audio/wav": "audio.wav",
        "audio/mp3": "audio.mp3",
        "audio/mpeg": "audio.mp3",
        "audio/mp4": "audio.mp4",
        "audio/ogg": "audio.ogg",
    }
    filename = mime_to_ext.get(clean_mime, "audio.webm")

    print(f"[STT] Transcribing {len(audio_bytes)} bytes, detected mime={clean_mime}, filename={filename}")

    try:
        audio_file = BytesIO(audio_bytes)

        result = eleven_client.speech_to_text.convert(
            model_id="scribe_v1",
            file=(filename, audio_file, clean_mime),
            language_code="en",
        )

        transcription = (result.text or "").strip()
        # Clean any extraneous quotes
        if transcription.startswith('"') and transcription.endswith('"'):
            transcription = transcription[1:-1].strip()
        print(f"[STT] Transcription result: '{transcription[:100]}'")
        return transcription
    except Exception as e:
        print(f"[TRANSCRIBE ERROR] ElevenLabs STT error: {e}")

    return ""

