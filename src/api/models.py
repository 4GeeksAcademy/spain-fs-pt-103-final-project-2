from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Mapped, mapped_column
db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    recipes = db.relationship('Recipe', backref='user', lazy=True)


class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    favorite = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "favorite": self.favorite,
            "user_id": self.user_id
        }

class Favorite(db.Model):
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipe_id: Mapped[int] = mapped_column(
        db.Integer, db.ForeignKey('recipe.id'), nullable=False)


user = db.relationship('User', backref='favorites')
recipe = db.relationship('Recipe')


def serialize(self):
    return {
        'id': self.id,
        'user_id': self.user_id,
        'urecipe_id': self.recipe_id
    }
