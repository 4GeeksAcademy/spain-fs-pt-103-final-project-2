from dotenv import load_dotenv
load_dotenv()

from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory,
    current_app,
)
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from functools import wraps
import os
import sys
import jwt

# --- Rutas y modelos de tu proyecto -----------------------------------------
from api.admin import setup_admin
from api.models import db, ShoppingItem
from api.routes.openai_chat import chat_api
from api.routes.auth import api_auth
from api.routes.recipes import api_recipes
from api.routes.users import api_users
from api.routes.pesoejercicio import (
    peso_api,
    ejercicio_api,
    usuario_api,
    estadisticas_api,
)
from api.utils import generate_sitemap
# ---------------------------------------------------------------------------

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app = Flask(__name__)

# --------------------- CONFIGURACIÓN BASE -----------------------------------
app.config.update(
    SQLALCHEMY_DATABASE_URI="sqlite:///database.db",
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY", "super-secret-key"),  # cambia en prod
    FLASK_ADMIN_SWATCH="cerulean",
)

# ----------------------- EXTENSIONES ----------------------------------------
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
)

db.init_app(app)
Migrate(app, db, compare_type=True)
JWTManager(app)
setup_admin(app)

# ------------------------ BLUEPRINTS ----------------------------------------
app.register_blueprint(api_users, url_prefix="/api")
app.register_blueprint(api_recipes, url_prefix="/api")
app.register_blueprint(api_auth, url_prefix="/api")
app.register_blueprint(peso_api, url_prefix="/api")
app.register_blueprint(ejercicio_api, url_prefix="/api")
app.register_blueprint(usuario_api, url_prefix="/api")
app.register_blueprint(estadisticas_api, url_prefix="/api")
app.register_blueprint(chat_api)  # ya lleva su propio prefijo

# ----------------------- PÁGINA RAÍZ / SITEMAP ------------------------------
@app.route("/")
def root():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(STATIC_DIR, "index.html")

# -------------------- AUTH DECORATOR (corregido) ----------------------------

def token_required(f):
    """Extrae `sub` del JWT y lo pasa como primer arg. Devuelve 403 en error."""

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"message": "Token requerido"}), 403

        token = auth_header.split(" ", 1)[1]
        try:
            data = jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
            current_user_id = data.get("sub")
            if current_user_id is None:
                raise jwt.InvalidTokenError("Campo 'sub' faltante")
        except jwt.PyJWTError as err:
            return jsonify({"message": "Token inválido", "error": str(err)}), 403

        return f(current_user_id, *args, **kwargs)

    return decorated

# --------------------------- RUTAS SHOPPING ---------------------------------

@app.route("/api/shopping", methods=["GET"])
@token_required
def get_items(current_user_id):
    items = ShoppingItem.query.filter_by(user_id=current_user_id).all()
    return (
        jsonify([{"id": i.id, "text": i.text, "category": i.category} for i in items]),
        200,
    )


@app.route("/api/shopping", methods=["POST"])
@token_required
def add_item(current_user_id):
    data = request.get_json() or {}
    text = data.get("text", "").strip()
    category = data.get("category", "").strip()

    if not text or not category:
        return jsonify({"error": "Faltan datos"}), 400

    item = ShoppingItem(text=text, category=category, user_id=current_user_id)
    db.session.add(item)
    db.session.commit()

    return (
        jsonify({
            "message": "Item agregado",
            "item": {"id": item.id, "text": item.text, "category": item.category},
        }),
        201,
    )


@app.route("/api/shopping/<int:item_id>", methods=["DELETE"])
@token_required
def delete_item(current_user_id, item_id):
    item = ShoppingItem.query.filter_by(id=item_id, user_id=current_user_id).first()
    if not item:
        return jsonify({"error": "Item no encontrado"}), 404

    db.session.delete(item)
    db.session.commit()
    return "", 204  # 204 No Content (mejor que 200 para DELETE)

# --------------------------- MAIN ------------------------------------------

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
