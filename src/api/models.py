from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from api.models import db
db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    datos = db.relationship("UserData", backref="user", uselist=False)
    pesos = db.relationship("Peso", backref="user", lazy=True)
    ejercicios = db.relationship("Ejercicio", backref="user", lazy=True)

    # Nuevos campos
    nombre = db.Column(db.String(120), nullable=True)
    apellido = db.Column(db.String(120), nullable=True)
    fecha_nacimiento = db.Column(db.Date, nullable=True)
    altura = db.Column(db.Float, nullable=True)
    peso_actual = db.Column(db.Float, nullable=True)
    meta_peso = db.Column(db.Float, nullable=True)

    # Relación con ítems de compra
    shopping_items = db.relationship('ShoppingItem', backref='user', lazy=True)


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


class Peso(db.Model):
    __tablename__ = 'pesos'
    id = db.Column(db.Integer, primary_key=True)
    peso = db.Column(db.Float, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)



class Ejercicio(db.Model):
    __tablename__ = 'ejercicios'
    id = db.Column(db.Integer, primary_key=True)
    dia = db.Column(db.String(20), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship("User", backref="ejercicios")


class UserData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    edad = db.Column(db.Integer)
    altura = db.Column(db.Float)
    peso = db.Column(db.Float)
    meta_peso = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


def serialize(self):
    return {

        'id': self.id,
        'edad': self.edad,
        'altura': self.altura,
        'altura_cm': self.altura * 100,
        'peso_actual': self.peso,
        'meta_peso': self.meta_peso,
        'fecha': self.fecha.isoformat() if self.fecha else None,
        'peso': self.peso,
        'urecipe_id': self.user_id,
        'user_id': self.user_id
    }


# ✅ NUEVO: Modelo para ítems de la lista de compras
class ShoppingItem(db.Model):
    __tablename__ = 'shopping_items'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def serialize(self):
        return {
            'id': self.id,
            'text': self.text,
            'category': self.category,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat()
        
        }