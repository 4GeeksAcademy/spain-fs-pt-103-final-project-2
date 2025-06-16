from flask import Blueprint, request, jsonify
from models import User
from models import db
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash

api_auth = Blueprint("api_auth", __name__)

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

@api_auth.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña requeridos"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "El usuario ya existe"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario registrado correctamente"}), 201

@api_auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)
        return jsonify({"access_token": access_token, "user_id": user.id}), 200

    return jsonify({"msg": "Credenciales inválidas"}), 401