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
    model: str = "gemini-flash-latest"
) -> str:
    """
    Generates text using Google Gemini API given a prompt and optional system instruction.
    """
    if not gemini_client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
    
    config = types.GenerateContentConfig(system_instruction=system_instruction) if (types and system_instruction) else None

    models_to_try = [model, "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview", "gemini-flash-latest"]
    # De-duplicate while preserving order
    models_to_try = list(dict.fromkeys(models_to_try))

    last_err = None
    for m in models_to_try:
        try:
            response = gemini_client.models.generate_content(
                model=m,
                contents=prompt,
                config=config
            )
            if response and response.text:
                return response.text
        except Exception as e:
            last_err = e
            continue

    raise HTTPException(status_code=500, detail=f"Gemini API error: {str(last_err)}")
