from flask import Blueprint, request, jsonify, current_app as app
from functools import wraps
import jwt
from api.models import db, ShoppingItem

shopping_bp = Blueprint("shopping", __name__)

# --- DECORADOR JWT CORREGIDO -----------------------------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"message": "Token requerido"}), 403

        try:
            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user_id = int(data["sub"])
        except Exception as e:
            return jsonify({"message": "Token inválido", "error": str(e)}), 403

        # 👉 👉  DEVUELVE el resultado de la vista
        return f(current_user_id, *args, **kwargs)

    # 👉 👉  ¡Devuelve la función decorada!
    return decorated
# ---------------------------------------------------------------------------


# Obtener todos los ítems del usuario
@shopping_bp.route("/api/shopping", methods=["GET"])
@token_required
def get_items(current_user_id):
    items = ShoppingItem.query.filter_by(user_id=current_user_id).all()
    return jsonify(
        [{"id": i.id, "text": i.text, "category": i.category} for i in items]
    ), 200


# Agregar un nuevo ítem
@shopping_bp.route("/api/shopping", methods=["POST"])
@token_required
def add_item(current_user_id):
    data = request.get_json() or {}
    text = data.get("text")
    category = data.get("category")

    if not text or not category:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    item = ShoppingItem(text=text, category=category, user_id=current_user_id)
    db.session.add(item)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Item agregado",
                "item": {"id": item.id, "text": item.text, "category": item.category},
            }
        ),
        201,
    )


# Eliminar ítem
@shopping_bp.route("/api/shopping/<int:item_id>", methods=["DELETE"])
@token_required
def delete_item(current_user_id, item_id):
    item = ShoppingItem.query.filter_by(
        id=item_id, user_id=current_user_id
    ).first()
    if not item:
        return jsonify({"error": "Item no encontrado"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item eliminado"}), 200
