
from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path
import uuid

from database import init_db, save_chat_message, search_knowledge

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "digital.doctor"

app = Flask(__name__)


@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}

    message = str(data.get("message", "")).strip()
    language = data.get("language", "en")
    crop = data.get("crop") or None
    conversation_id = str(
        data.get("conversation_id") or uuid.uuid4()
    )

    if not message:
        return jsonify({"error": "Please enter a message."}), 400

    if len(message) > 4000:
        return jsonify({"error": "Message is too long."}), 400

    if language not in ("en", "hi"):
        language = "en"

    try:
        save_chat_message(
            conversation_id, "user", message,
            language=language, crop=crop
        )

        answer = None

        # Search verified agricultural knowledge.
        words = list(dict.fromkeys(
            word.strip(".,?!:;()").lower()
            for word in message.split()
            if len(word.strip(".,?!:;()")) >= 4
        ))

        for word in words:
            results = search_knowledge(word, crop=crop, limit=3)
            if results:
                item = results[0]
                answer = (
                    item["recommended_actions"]
                    or item["possible_causes"]
                    or item["prevention"]
                )
                if answer:
                    break

        if not answer:
            if language == "hi":
                answer = (
                    "Maaf kijiye, is sawaal ka verified jawab "
                    "database mein nahi mila. Apni fasal ka naam, "
                    "lakshan aur problem kab se hai, batayein. "
                    "Sahi salah ke liye krishi visheshagya se bhi "
                    "sampark karein."
                )
            else:
                answer = (
                    "I couldn't find a verified answer in the "
                    "agriculture database. Please share your crop, "
                    "symptoms, and when the problem started. "
                    "Consult an agricultural expert for reliable advice."
                )

        save_chat_message(
            conversation_id, "assistant", str(answer),
            language=language, crop=crop
        )

        return jsonify({
            "reply": str(answer),
            "conversation_id": conversation_id
        })

    except Exception:
        app.logger.exception("Chat request failed")
        return jsonify({
            "error": "Chat failed. Please check the server terminal."
        }), 500


@app.route("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)

@app.route("/test")
def test():
    return "KisanCare backend is working!"


if __name__ == "__main__":
    init_db()
    print("KisanCare server starting...")
    app.run(debug=True)
