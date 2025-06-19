from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from ..db import db

api_users = Blueprint("api_users", __name__)

@api_users.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response

@api_users.route("/user", methods=["OPTIONS"])
@api_users.route("/login", methods=["OPTIONS"])
@api_users.route("/register", methods=["OPTIONS"])
def options():
    return '', 204


@api_users.route("/user", methods=["GET"])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    return jsonify({"id": user.id, "email": user.email}), 200


@api_users.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña son obligatorios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "El email ya está registrado"}), 409

    new_user = User(email=email, password=generate_password_hash(password))
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario registrado correctamente"}), 201


@api_users.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Credenciales incorrectas"}), 401

    token = create_access_token(identity=user.id)
    return jsonify({"access_token": token}), 200


@api_users.route("/user", methods=["PUT"])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if email:
        user.email = email
    if password:
        user.password = generate_password_hash(password)

    db.session.commit()
    return jsonify({"msg": "Perfil actualizado"}), 200

# Eliminar cuenta
@api_users.route("/user", methods=["DELETE"])
@jwt_required()
def delete_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "Cuenta eliminada"}), 200