from flask import Blueprint, request, jsonify
from api.models import User
from api.models import db
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
import re

api_auth = Blueprint("api_auth", __name__)

# --- CORS para permitir peticiones cruzadas ---
@api_auth.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response


@api_auth.route("/register", methods=["OPTIONS"])
@api_auth.route("/login", methods=["OPTIONS"])
def options():
    return '', 204


# --- Validación de contraseña robusta ---
def is_valid_password(password):
    pattern = r'^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$'
    return re.match(pattern, password) is not None


# --- Registro ---
@api_auth.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña requeridos"}), 400

    if not is_valid_password(password):
        return jsonify({
            "msg": "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo"
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "El usuario ya existe"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario registrado correctamente"}), 201


# --- Login ---
@api_auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña requeridos"}), 400

    if not is_valid_password(password):
        return jsonify({
            "msg": "Formato de contraseña inválido. Debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo"
        }), 400

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)
        return jsonify({"access_token": access_token, "user_id": user.id}), 200

    return jsonify({"msg": "Credenciales inválidas"}), 401