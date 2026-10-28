
import logging
import sys
import uuid
from pathlib import Path

import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# -----------------------------
# Logging
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -----------------------------
# Database import and path
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent
BACKNED_DIR = BASE_DIR.parent / "backened"

print("Database folder path:", BACKNED_DIR)
print("Folder exists:", BACKNED_DIR.is_dir())
print("Database file exists:", (BACKNED_DIR / "database.py").is_file())

if not (BACKNED_DIR / "database.py").is_file():
    raise FileNotFoundError(
        f"database.py not found. Expected location: {BACKNED_DIR}"
    )

if str(BASE_DIR.parent) not in sys.path:
    sys.path.insert(0, str(BASE_DIR.parent))

from backened.database import init_db, save_chat_message

# -----------------------------
# FastAPI application
# -----------------------------
app = FastAPI(title="KisanCare Farmer Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Ollama configuration
# -----------------------------
OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
OLLAMA_MODEL = "qwen2.5:3b"


# -----------------------------
# Request model

# -----------------------------
class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    crop: str = ""
    location: str = ""
    conversation_id: str = ""


# -----------------------------
# Database helper
# -----------------------------
def store_message(
    conversation_id: str,
    role: str,
    message: str,
    language: str,
    crop: str,
) -> None:
    """Save one message without interrupting the chatbot if saving fails."""
    try:
        save_chat_message(
            conversation_id=conversation_id,
            role=role,
            message=message,
            language=language,
            crop=crop or None,
        )
    except Exception:
        logger.exception("Failed to save %s message to database", role)


# -----------------------------
# Initialize database
# -----------------------------
@app.on_event("startup")
def startup_event():
    init_db()
    logger.info("Database initialized successfully.")


# -----------------------------
# Home endpoint
# -----------------------------
@app.get("/")
def home():
    return {
        "status": "running",
        "message": "KisanCare Farmer Assistant backend is ready.",
    }


# -----------------------------
# Health endpoint
# -----------------------------
@app.get("/api/health")
def health():
    return {"status": "ok"}


# -----------------------------
# Chat endpoint
# -----------------------------
@app.post("/api/chat")
def chat(request: ChatRequest):
    message = request.message.strip()

    conversation_id = (
        request.conversation_id.strip()
        if request.conversation_id.strip()
        else str(uuid.uuid4())
    )

    language = "hi" if request.language.lower() == "hi" else "en"
    response_language = "Hindi" if language == "hi" else "English"

    if not message:
        return {
            "reply": "कृपया अपना सवाल लिखें।" if language == "hi"
            else "Please enter a question.",
            "conversation_id": conversation_id,
        }

    # Save the farmer's question first.
    store_message(
        conversation_id=conversation_id,
        role="user",
        message=message,
        language=language,
        crop=request.crop,
    )

    system_prompt = f"""
You are KisanCare, a helpful agricultural assistant for farmers in India.

Reply in {response_language}.
If the farmer asks in Hindi, use clear, natural Hindi in Devanagari script.
If the farmer asks in English, use simple English.

Help with crop health, common plant symptoms, soil care, irrigation,
weather-related farming decisions, and general agricultural practices.

Give practical, easy-to-understand guidance.
Ask follow-up questions when important information is missing.

Do not claim that you can confirm a crop disease from text alone.
Do not invent soil test results, weather observations, or diagnoses.
Do not recommend dangerous pesticide mixtures or unsupported chemical doses.
For serious or spreading crop damage, recommend contacting a local Krishi
Vigyan Kendra (KVK) or qualified agriculture officer.

Crop: {request.crop or "Not specified"}
Farmer's location: {request.location or "Not specified"}
"""

    # Ask Ollama for the answer.
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                "stream": False,
            },
            timeout=120,
        )

        response.raise_for_status()
        data = response.json()
        answer = data.get("message", {}).get("content", "").strip()

        if not answer:
            answer = (
                "मैं जवाब तैयार नहीं कर पाया। कृपया दोबारा कोशिश करें।"
                if language == "hi"
                else "I could not prepare an answer. Please try again."
            )

    except requests.exceptions.ConnectionError:
        answer = (
            "AI सेवा चालू नहीं है। कृपया Ollama चालू करके दोबारा कोशिश करें।"
            if language == "hi"
            else "Ollama is not running. Please start Ollama and try again."
        )

    except requests.exceptions.Timeout:
        answer = (
            "जवाब आने में अधिक समय लग रहा है। कृपया दोबारा कोशिश करें।"
            if language == "hi"
            else "The response timed out. Please try again."
        )

    except requests.exceptions.RequestException:
        logger.exception("Error while contacting Ollama")
        answer = (
            "AI सेवा से संपर्क करने में समस्या हुई। कृपया दोबारा कोशिश करें।"
            if language == "hi"
            else "There was a problem contacting Ollama. Please try again."
        )

    except (ValueError, TypeError):
        logger.exception("Invalid response received from Ollama")
        answer = (
            "AI का जवाब पढ़ने में समस्या हुई। कृपया दोबारा कोशिश करें।"
            if language == "hi"
            else "There was a problem reading the AI response. Please try again."
        )

    # Save the assistant's reply.
    store_message(
        conversation_id=conversation_id,
        role="assistant",
        message=answer,
        language=language,
        crop=request.crop,
    )

    return {
        "reply": answer,
        "conversation_id": conversation_id,
    }


# -----------------------------
# Run directly with Python
# -----------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
    )
