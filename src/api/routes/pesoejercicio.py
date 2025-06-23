from flask import Blueprint, request, jsonify
from datetime import datetime

peso_api = Blueprint("peso_api", __name__)
ejercicio_api = Blueprint("ejercicio_api", __name__)

# Simulación de base de datos temporal en memoria
PESOS_DB = []
EJERCICIO_DB = []

@peso_api.route("/pesos", methods=["GET"])
def obtener_pesos():
    return jsonify(PESOS_DB), 200

@peso_api.route("/pesos", methods=["POST"])
def guardar_peso():
    data = request.get_json()
    peso = data.get("peso")
    fecha = data.get("fecha", datetime.utcnow().isoformat())

    if peso is None:
        return jsonify({"error": "El campo 'peso' es obligatorio."}), 400

    entrada = {"peso": peso, "fecha": fecha}
    PESOS_DB.append(entrada)
    return jsonify({"message": "Peso registrado correctamente.", "data": entrada}), 201

@ejercicio_api.route("/ejercicio", methods=["GET"])
def obtener_ejercicio():
    return jsonify(EJERCICIO_DB), 200

@ejercicio_api.route("/ejercicio", methods=["POST"])
def guardar_ejercicio():
    data = request.get_json()
    dia = data.get("dia")
    fecha = data.get("fecha", datetime.utcnow().isoformat())

    if dia is None:
        return jsonify({"error": "El campo 'dia' es obligatorio."}), 400

    entrada = {"dia": dia, "fecha": fecha}
    EJERCICIO_DB.append(entrada)
    return jsonify({"message": "Día de ejercicio registrado correctamente.", "data": entrada}), 201