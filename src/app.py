from api.admin import setup_admin
from dotenv import load_dotenv
load_dotenv() 
from api.routes.openai_chat import chat_api
from api.routes.auth import api_auth
from api.routes.recipes import api_recipes
from api.routes.users import api_users
from api.models import db, ShoppingItem, User
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask import Flask, request, jsonify, send_from_directory
from api.routes.pesoejercicio import peso_api
from api.routes.pesoejercicio import ejercicio_api
from api.routes.pesoejercicio import usuario_api
from api.routes.pesoejercicio import estadisticas_api
import os
import sys
import jwt
from functools import wraps
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from flask_migrate import Migrate
from api.utils import generate_sitemap, APIException

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')

app = Flask(__name__)

# Configuración general
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"  # Cámbiala en producción
app.config["FLASK_ADMIN_SWATCH"] = "cerulean"

# Inicializaciones
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)
JWTManager(app)
CORS(app)

# Panel Admin
setup_admin(app)

# Blueprints API
app.register_blueprint(api_users, url_prefix="/api")
app.register_blueprint(api_recipes, url_prefix="/api")
app.register_blueprint(api_auth, url_prefix="/api")
app.register_blueprint(peso_api, url_prefix="/api")
app.register_blueprint(ejercicio_api, url_prefix="/api")
app.register_blueprint(usuario_api, url_prefix="/api")
app.register_blueprint(estadisticas_api, url_prefix="/api")
# OpenAI Chat API
app.register_blueprint(chat_api)

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace("Bearer ", "")
        if not token:
            return jsonify({"message": "Token requerido"}), 403

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['sub']
        except:
            return jsonify({"message": "Token inválido"}), 403

        return f(current_user_id, *args, **kwargs)

    return decorated

# Obtener todos los ítems del usuario
@app.route("/api/shopping", methods=["GET"])
@token_required
def get_items(current_user_id):
    items = ShoppingItem.query.filter_by(user_id=current_user_id).all()
    return jsonify([
        {"id": i.id, "text": i.text, "category": i.category}
        for i in items
    ])

# Agregar un nuevo ítem
@app.route("/api/shopping", methods=["POST"])
@token_required
def add_item(current_user_id):
    data = request.get_json()
    text = data.get("text")
    category = data.get("category")

    if not text or not category:
        return jsonify({"error": "Faltan datos"}), 400

    item = ShoppingItem(text=text, category=category, user_id=current_user_id)
    db.session.add(item)
    db.session.commit()

    return jsonify({
        "message": "Item agregado",
        "item": {"id": item.id, "text": item.text, "category": item.category}
    }), 201

# Eliminar un ítem
@app.route("/api/shopping/<int:item_id>", methods=["DELETE"])
@token_required
def delete_item(current_user_id, item_id):
    item = ShoppingItem.query.filter_by(id=item_id, user_id=current_user_id).first()
    if not item:
        return jsonify({"error": "Item no encontrado"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item eliminado"}), 200

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)