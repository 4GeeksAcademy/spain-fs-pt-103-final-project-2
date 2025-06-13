from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://user:password@localhost/recetario_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)

####### MODELS
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_vegan = db.Column(db.Boolean, default=False)
    is_halal = db.Column(db.Boolean, default=False)
    is_gluten_free = db.Column(db.Boolean, default=False)
    recipes = db.relationship("Recipe", backref="author", lazy=True)
    favorites = db.relationship("Favorite", backref="user", lazy=True)

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    image_url = db.Column(db.String(250))
    ingredients = db.Column(db.Text, nullable=False)
    instructions = db.Column(db.Text, nullable=False)
    is_vegan = db.Column(db.Boolean, default=False)
    is_halal = db.Column(db.Boolean, default=False)
    is_gluten_free = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    favorites = db.relationship("Favorite", backref="recipe", lazy=True)

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)

####### ENDPOINTS
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    new_user = User(
        username=data["username"],
        email=data["email"],
        password=hashed_pw,
        is_vegan=data.get("is_vegan", False),
        is_halal=data.get("is_halal", False),
        is_gluten_free=data.get("is_gluten_free", False)
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "Usuario registrado exitosamente"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data["email"]).first()
    if user and bcrypt.check_password_hash(user.password, data["password"]):
        access_token = create_access_token(identity=user.id, expires_delta=datetime.timedelta(days=1))
        return jsonify({"token": access_token, "username": user.username}), 200
    return jsonify({"msg": "Credenciales inválidas"}), 401

@app.route("/recipes", methods=["POST"])
@jwt_required()
def create_recipe():
    user_id = get_jwt_identity()
    data = request.get_json()
    recipe = Recipe(
        title=data["title"],
        image_url=data.get("image_url", ""),
        ingredients=data["ingredients"],
        instructions=data["instructions"],
        is_vegan=data.get("is_vegan", False),
        is_halal=data.get("is_halal", False),
        is_gluten_free=data.get("is_gluten_free", False),
        user_id=user_id
    )
    db.session.add(recipe)
    db.session.commit()
    return jsonify({"msg": "Receta creada"}), 201

@app.route("/recipes", methods=["GET"])
def get_recipes():
    recipes = Recipe.query.all()
    result = []
    for r in recipes:
        result.append({
            "id": r.id,
            "title": r.title,
            "image_url": r.image_url,
            "ingredients": r.ingredients,
            "instructions": r.instructions,
            "is_vegan": r.is_vegan,
            "is_halal": r.is_halal,
            "is_gluten_free": r.is_gluten_free,
            "author": r.author.username
        })
    return jsonify(result), 200

@app.route("/favorites", methods=["POST"])
@jwt_required()
def add_favorite():
    user_id = get_jwt_identity()
    data = request.get_json()
    fav = Favorite(user_id=user_id, recipe_id=data["recipe_id"])
    db.session.add(fav)
    db.session.commit()
    return jsonify({"msg": "Favorito agregado"}), 201

@app.route("/favorites", methods=["GET"])
@jwt_required()
def get_favorites():
    user_id = get_jwt_identity()
    favs = Favorite.query.filter_by(user_id=user_id).all()
    result = [
        {
            "recipe_id": f.recipe.id,
            "title": f.recipe.title,
            "image_url": f.recipe.image_url
        } for f in favs
    ]
    return jsonify(result), 200

if __name__ == '__main__':
    app.run(debug=True)
