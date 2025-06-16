import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from api.models import db
from api.routes.users import api_users
from api.routes.recipes import api_recipes
from api.routes.auth import api_auth
from api.routes.openai_chat import chat_api
from api.admin import setup_admin  # Admin panel

def create_app():
    app = Flask(__name__)

    # Configuración general
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = "super-secret-key"  # Cámbiala en producción
    app.config["FLASK_ADMIN_SWATCH"] = "cerulean"

    # Inicializaciones
    db.init_app(app)
    JWTManager(app)
    CORS(app)

    # Panel Admin
    setup_admin(app)

    # Blueprints API
    app.register_blueprint(api_users, url_prefix="/api")
    app.register_blueprint(api_recipes, url_prefix="/api")
    app.register_blueprint(api_auth, url_prefix="/api")
    app.register_blueprint(chat_api, url_prefix="/api")

    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)