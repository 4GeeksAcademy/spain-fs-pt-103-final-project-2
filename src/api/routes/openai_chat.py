import os
import openai
from flask import Blueprint, request, jsonify

chat_api = Blueprint("chat_api", __name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

@chat_api.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response

@chat_api.route("/chat", methods=["OPTIONS"])
def chat_options():
    return '', 204

@chat_api.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"reply": "El mensaje está vacío."}), 400

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un chef profesional experto en nutrición. Da recetas sanas y personalizadas según los gustos y alergias del usuario."
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            max_tokens=500,
            temperature=0.7
        )

        ai_reply = response.choices[0].message.content
        return jsonify({"reply": ai_reply})

    except Exception as e:
        print("OpenAI error:", e)
        return jsonify({"reply": "Error al conectar con OpenAI."}), 500