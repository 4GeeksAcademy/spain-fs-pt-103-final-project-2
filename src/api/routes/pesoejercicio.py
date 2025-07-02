from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, Peso, Ejercicio, UserData

# Blueprints
peso_api = Blueprint("peso_api", __name__)
ejercicio_api = Blueprint("ejercicio_api", __name__)
usuario_api = Blueprint("usuario_api", __name__)
estadisticas_api = Blueprint("estadisticas_api", __name__)

# Simulaciones en memoria
# USUARIOS_DB = {}       # user_id: {edad, altura_cm, peso_actual, meta_peso}
# PESOS_DB = {}          # user_id: [ {peso, fecha} ]
# EJERCICIO_DB = {}      # user_id: [ {dia, fecha} ]


# --- DATOS PERSONALES ---

@usuario_api.route("/usuario/datos", methods=["GET"])
@jwt_required()
def obtener_datos_usuario():
    user_id = get_jwt_identity()
    datos = UserData.query.filter_by(user_id=user_id).first()
    if not datos:
        return jsonify({"error": "Usuario no encontrado"}), 404

    altura_m = datos.altura_cm / 100
    imc = round(datos.peso_actual / (altura_m ** 2), 1)
    diferencia = round(datos.meta_peso - datos.peso_actual, 1)

    return jsonify({
        "edad": datos.edad,
        "altura": datos.altura_cm,
        "peso_actual": datos.peso_actual,
        "meta_peso": datos.meta_peso,
        "imc": imc,
        "diferencia": diferencia
    }), 200

# --- REGISTRO DE PESO ---


@peso_api.route("/pesos", methods=["GET"])
@jwt_required()
def obtener_pesos():
    user_id = get_jwt_identity()
    pesos = Peso.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "peso": p.peso,
        "fecha": p.fecha.isoformat()
    } for p in pesos]), 200


@peso_api.route("/pesos", methods=["POST"])
@jwt_required()
def guardar_peso():
    user_id = get_jwt_identity()
    data = request.get_json()
    peso = data.get("peso")
    fecha = data.get("fecha")

    if peso is None:
        return jsonify({"error": "El campo 'peso' es obligatorio."}), 400

    try:
        fecha_obj = datetime.fromisoformat(
            fecha) if fecha else datetime.utcnow()
    except ValueError:
        return jsonify({"error": "Formato de fecha inválido."}), 400

    nuevo_peso = Peso(peso=peso, fecha=fecha_obj, user_id=user_id)
    db.session.add(nuevo_peso)

    datos = UserData.query.filter_by(user_id=user_id).first()
    if datos:
        datos.peso_actual = peso
    db.session.commit()

    return jsonify({
        "message": "Peso registrado correctamente.",
        "data": {
            "peso": nuevo_peso.peso,
            "fecha": nuevo_peso.fecha.isoformat()
        }
    }), 201


# --- DÍAS DE EJERCICIO ---

@ejercicio_api.route("/ejercicio", methods=["GET"])
@jwt_required()
def obtener_ejercicio():
    user_id = get_jwt_identity()
    ejercicios = Ejercicio.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "dia": e.dia,
        "fecha": e.fecha.isoformat()
    } for e in ejercicios]), 200


@ejercicio_api.route("/ejercicio", methods=["POST"])
@jwt_required()
def guardar_ejercicio():
    user_id = get_jwt_identity()
    data = request.get_json()
    dia = data.get("dia")
    fecha = data.get("fecha")

    if dia is None:
        return jsonify({"error": "El campo 'dia' es obligatorio."}), 400
    try:
        fecha_obj = datetime.fromisoformat(
            fecha) if fecha else datetime.utcnow()
    except ValueError:
        return jsonify({"error": "Formato de fecha inválido."}), 400

    nuevo = Ejercicio(dia=dia, fecha=fecha_obj, user_id=user_id)
    db.session.add(nuevo)
    db.session.commit()

    return jsonify({
        "message": "Día de ejercicio registrado correctamente.",
        "data": {
            "dia": nuevo.dia,
            "fecha": nuevo.fecha.isoformat()
        }
    }), 201


# --- ESTADÍSTICAS ---

@estadisticas_api.route("/estadisticas/totales", methods=["GET"])
@jwt_required()
def obtener_estadisticas_totales():
    user_id = get_jwt_identity()
    ejercicios = Ejercicio.query.filter_by(user_id=user_id).all()

    ahora = datetime.now(timezone.utc)
    semana_actual = ahora.isocalendar().week
    mes_actual = ahora.month
    año_actual = ahora.year

    semana = mes = año = 0
    for e in ejercicios:
        fecha = e.fecha
        if fecha.isocalendar().week == semana_actual and fecha.year == año_actual:
            semana += 1
        if fecha.month == mes_actual and fecha.year == año_actual:
            mes += 1
        if fecha.year == año_actual:
            año += 1

    return jsonify({
        "esta_semana": semana,
        "este_mes": mes,
        "este_año": año
    }), 200
