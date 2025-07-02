from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from api.models import db, User, UserData
from datetime import datetime

api_users = Blueprint("api_users", __name__)

# CORS Headers


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

# Usuario


@api_users.route("/user", methods=["GET"])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    return jsonify({"id": user.id, "email": user.email}), 200

# Registro de usuario


@api_users.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Faltan datos"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "El usuario ya existe"}), 409

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado exitosamente"}), 201

# Login de usuario


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

# Perfil de usuario


@api_users.route("/user", methods=["GET"])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    return jsonify({"id": user.id, "email": user.email}), 200


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

# Datos del usuario


@api_users.route('/user/data', methods=['GET'])
@jwt_required()
def obtener_datos_usuario():
    user_id = get_jwt_identity()
    datos = UserData.query.filter_by(user_id=user_id).first()
    if not datos:
        return jsonify({"message": "Datos no encontrados"}), 404

    altura_m = datos.altura_cm / 100
    imc = round(datos.peso_actual / (altura_m ** 2), 1)
    diferencia = round(datos.meta_peso - datos.peso_actual, 1)

    return jsonify({
        "edad": datos.edad,
        "altura_cm": datos.altura_cm,
        "peso_actual": datos.peso_actual,
        "meta_peso": datos.meta_peso,
        "diferencia": diferencia,
        "imc": imc
    }), 200


@api_users.route('/user/data', methods=['POST'])
@jwt_required()
def actualizar_datos_usuario():
    user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ('edad', 'altura_cm', 'peso_actual', 'meta_peso')
    if not data or not all(key in data for key in required_fields):
        return jsonify({"message": "Datos incompletos"}), 400

    try:
        edad = int(data['edad'])
        altura_cm = float(data['altura_cm'])
        peso_actual = float(data['peso_actual'])
        meta_peso = float(data['meta_peso'])
    except (ValueError, TypeError):
        return jsonify({"message": "Los datos deben ser numéricos válidos"}), 400

    datos = UserData.query.filter_by(user_id=user_id).first()

    if datos:
        datos.edad = edad
        datos.altura_cm = altura_cm
        datos.peso_actual = peso_actual
        datos.meta_peso = meta_peso
    else:
        datos = UserData(
            edad=edad,
            altura_cm=altura_cm,
            peso_actual=peso_actual,
            meta_peso=meta_peso,
            user_id=user_id
        )
        db.session.add(datos)

    db.session.commit()
    return jsonify({"message": "Datos actualizados correctamente"}), 200
