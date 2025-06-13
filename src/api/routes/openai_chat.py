from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import openai
import os

api_openai = Blueprint("api_openai", __name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

@api_openai.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response

@api_openai.route("/openai", methods=["POST"])
@jwt_required()
def chat_with_openai():
    data = request.get_json()
    prompt = data.get("prompt", "")

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Eres un experto en cocina saludable"},
                {"role": "user", "content": prompt}
            ]
        )
        return jsonify({"response": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500