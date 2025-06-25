from flask import Blueprint, request, jsonify
from datetime import datetime

peso_api = Blueprint("peso_api", __name__)
ejercicio_api = Blueprint("ejercicio_api", __name__)
usuario_api = Blueprint("usuario_api", __name__)
estadisticas_api = Blueprint("estadisticas_api", __name__)

# --- Simulaciones en memoria ---
USUARIOS_DB = {}       # user_id: {edad, altura_cm, peso_actual, meta_peso}
PESOS_DB = {}          # user_id: [ {peso, fecha} ]
EJERCICIO_DB = {}      # user_id: [ {dia, fecha} ]


# --- Función auxiliar para identificar usuario ---
def get_user_id():
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return None
    return user_id


# --- DATOS PERSONALES ---

@usuario_api.route("/usuario/datos", methods=["GET"])
def obtener_datos_usuario():
    user_id = get_user_id()
    if not user_id or user_id not in USUARIOS_DB:
        return jsonify({"error": "Usuario no encontrado"}), 404

    usuario = USUARIOS_DB[user_id]
    altura_m = usuario["altura_cm"] / 100
    imc = round(usuario["peso_actual"] / (altura_m ** 2), 1)
    diferencia = round(usuario["meta_peso"] - usuario["peso_actual"], 1)

    return jsonify({
        "edad": usuario["edad"],
        "altura": usuario["altura_cm"],
        "peso_actual": usuario["peso_actual"],
        "meta_peso": usuario["meta_peso"],
        "imc": imc,
        "diferencia": diferencia
    }), 200

@usuario_api.route("/usuario/datos", methods=["POST"])
def actualizar_datos_usuario():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Falta X-User-Id"}), 400

    data = request.get_json()
    required_fields = ["edad", "altura_cm", "peso_actual", "meta_peso"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    USUARIOS_DB[user_id] = {
        "edad": data["edad"],
        "altura_cm": data["altura_cm"],
        "peso_actual": data["peso_actual"],
        "meta_peso": data["meta_peso"]
    }

    return jsonify({"message": "Datos personales actualizados correctamente."}), 200


# --- REGISTRO DE PESO ---

@peso_api.route("/pesos", methods=["GET"])
def obtener_pesos():
    user_id = get_user_id()
    if not user_id:
        return jsonify([]), 200
    return jsonify(PESOS_DB.get(user_id, [])), 200

@peso_api.route("/pesos", methods=["POST"])
def guardar_peso():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Falta X-User-Id"}), 400

    data = request.get_json()
    peso = data.get("peso")
    fecha = data.get("fecha", datetime.utcnow().isoformat())

    if peso is None:
        return jsonify({"error": "El campo 'peso' es obligatorio."}), 400

    entrada = {"peso": peso, "fecha": fecha}
    PESOS_DB.setdefault(user_id, []).append(entrada)

    if user_id in USUARIOS_DB:
        USUARIOS_DB[user_id]["peso_actual"] = peso

    return jsonify({"message": "Peso registrado correctamente.", "data": entrada}), 201


# --- DÍAS DE EJERCICIO ---

@ejercicio_api.route("/ejercicio", methods=["GET"])
def obtener_ejercicio():
    user_id = get_user_id()
    if not user_id:
        return jsonify([]), 200
    return jsonify(EJERCICIO_DB.get(user_id, [])), 200

@ejercicio_api.route("/ejercicio", methods=["POST"])
def guardar_ejercicio():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Falta X-User-Id"}), 400

    data = request.get_json()
    dia = data.get("dia")
    fecha = data.get("fecha", datetime.utcnow().isoformat())

    if dia is None:
        return jsonify({"error": "El campo 'dia' es obligatorio."}), 400

    entrada = {"dia": dia, "fecha": fecha}
    EJERCICIO_DB.setdefault(user_id, []).append(entrada)
    return jsonify({"message": "Día de ejercicio registrado correctamente.", "data": entrada}), 201


# --- ESTADÍSTICAS ---

@estadisticas_api.route("/estadisticas/totales", methods=["GET"])
def obtener_estadisticas_totales():
    user_id = get_user_id()
    if not user_id or user_id not in EJERCICIO_DB:
        return jsonify({
            "esta_semana": 0,
            "este_mes": 0,
            "este_año": 0
        }), 200

    ahora = datetime.utcnow()
    semana_actual = ahora.isocalendar().week
    mes_actual = ahora.month
    año_actual = ahora.year

    semana = mes = año = 0
    for e in EJERCICIO_DB[user_id]:
        fecha = datetime.fromisoformat(e["fecha"])
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