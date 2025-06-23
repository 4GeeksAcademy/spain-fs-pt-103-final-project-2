from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import Recipe, User
from ..db import db

api_recipes = Blueprint("api_recipes", __name__)


@api_recipes.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response


@api_recipes.route("/recipes", methods=["OPTIONS"])
def recipes_options():
    return '', 204


@api_recipes.route("/recipes", methods=["GET"])
@jwt_required()
def get_recipes():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    return jsonify([r.serialize() for r in user.recipes]), 200


@api_recipes.route("/recipes", methods=["POST"])
@jwt_required()
def create_recipe():
    user_id = get_jwt_identity()
    data = request.get_json()

    title = data.get("title")
    description = data.get("description")

    if not title or not description:
        return jsonify({"msg": "Faltan campos obligatorios (title, description)"}), 400

    recipe = Recipe(
        title=title,
        description=description,
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
    recipe_id = data.get("recipe_id")

    if not recipe_id:
        return jsonify({"msg": "recipe_id es obligatorio"}), 400

    recipe = Recipe.query.get(recipe_id)

    if not recipe or recipe.user_id != user_id:
        return jsonify({"msg": "No autorizado o receta no encontrada"}), 404

    recipe.favorite = not recipe.favorite
    db.session.commit()
    return jsonify(recipe.serialize()), 200
