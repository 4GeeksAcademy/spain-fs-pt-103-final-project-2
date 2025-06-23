from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Recipe, Favorite


# Agregamos una receta a favoritos
@app.route('/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    recipe_id = data.get('recipe_id')

    if not Recipe.query.get(recipe_id):
        return jsonify({"msg": "Receta no encontrada"}), 404

    existing = Favorite.query.filter_by(
        user_id=current_user_id, recipe_id=recipe_id).first()
    if existing:
        return jsonify({"msg": "Receta ya en favoritos"}), 400

    fav = Favorite(user_id=current_user_id, recipe_id=recipe_id)
    db.session.add(fav)
    db.session.commit()

    return jsonify({"msg": "Receta agregada a favoritos"}), 201


# Eliminamos una receta de favoritos
@app.route('/favorites/<int:recipe_id>', methods=['DELETE'])
@jwt_required()
def remove_favorite(recipe_id):
    current_user_id = get_jwt_identity()
    favorite = Favorite.query.filter_by(
        user_id=current_user_id, recipe_id=recipe_id).first()

    if not favorite:
        return jsonify({"msg": "Favorito no encontrado"}), 404

    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"msg": "Favorito eliminado"}), 200


# Obtenemos las recetas favoritas del usuario
@app.route('/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    current_user_id = get_jwt_identity()
    favorites = Favorite.query.filter_by(user_id=current_user_id).all()
    result = [fav.recipe.serialize()
              for fav in favorites]
    return jsonify(result), 200
