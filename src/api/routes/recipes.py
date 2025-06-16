from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Recipe, User
from ..db import db

api_recipes = Blueprint("api_recipes", __name__)

@api_recipes.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response

@api_recipes.route("/recipes", methods=["GET"])
@jwt_required()
def get_recipes():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify([r.serialize() for r in user.recipes])

@api_recipes.route("/recipes", methods=["POST"])
@jwt_required()
def create_recipe():
    user_id = get_jwt_identity()
    data = request.get_json()
    recipe = Recipe(
        title=data.get("title"),
        description=data.get("description"),
        user_id=user_id
    )
    db.session.add(recipe)
    db.session.commit()
    return jsonify(recipe.serialize()), 201

@api_recipes.route("/recipes/favorite", methods=["POST"])
@jwt_required()
def toggle_favorite():
    user_id = get_jwt_identity()
    data = request.get_json()
    recipe = Recipe.query.get(data.get("recipe_id"))
    if not recipe or recipe.user_id != user_id:
        return jsonify({"msg": "No autorizado o receta no encontrada"}), 404
    recipe.favorite = not recipe.favorite
    db.session.commit()
    return jsonify(recipe.serialize())