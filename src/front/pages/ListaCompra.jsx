import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, X } from "lucide-react";
import "../css/ListaCompra.css";

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Carnes");
  const [searchTerm, setSearchTerm] = useState("");
  const categories = ["Carnes", "Bebidas", "Frutas", "Verduras", "Condimentos", "Otros"];

  const token = localStorage.getItem("token");
  const API_URL = "https://animated-broccoli-975xq66wrqpq2x44-5000.app.github.dev"; // cambia si estás en local

  // Obtener items del usuario al cargar
  useEffect(() => {
    fetch(`${API_URL}/api/shopping`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setItems(data))
      .catch((err) => console.error("Error cargando items:", err.message));
  }, []);

  // Agregar item a la base de datos y al estado
  function addItem() {
    if (input.trim() === "") return;

    const newItem = {
      text: input.trim(),
      category: selectedCategory,
    };

    fetch(`${API_URL}/api/shopping`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newItem),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (data.item) {
          setItems([...items, data.item]);
          setInput("");
        }
      })
      .catch((err) => console.error("Error al agregar item:", err.message));
  }

  // Eliminar item
  function removeItem(id) {
    fetch(`${API_URL}/api/shopping/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setItems(items.filter((item) => item.id !== id));
        }
      })
      .catch((err) => console.error("Error al eliminar item:", err));
  }

  // Filtrar por categoría y búsqueda
  function getItemsByCategory(category) {
    return items.filter((item) => {
      const matchesCategory = item.category === category;
      const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  function countItemsByCategory(category) {
    return items.filter((item) => item.category === category).length;
  }

  return (
    <div className="shopping-container">
      {/* Título principal */}
      <div className="header">
        <ShoppingCart className="header-icon" />
        <h1 className="main-title">Lista de Compras</h1>
      </div>

      {/* Sección para agregar items */}
      <div className="add-section">
        <div className="input-group">
          <input
            type="text"
            placeholder="¿Qué necesitas comprar?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            className="text-input"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button onClick={addItem} className="add-button">
            <Plus size={20} />
            Agregar
          </button>
        </div>
      </div>

      {/* Categorías */}
      <div className="categories-grid">
        {categories.map((category) => {
          const categoryItems = getItemsByCategory(category);
          const totalItems = countItemsByCategory(category);

          return (
            <div key={category} className="category-section">
              <div className="category-header">
                <h2 className="category-title">{category}</h2>
                <span className="items-count">({totalItems} items)</span>
              </div>

              <div className="items-list">
                {categoryItems.length === 0 ? (
                  <div className="empty-message">
                    <p>Lista de {category.toLowerCase()} vacía</p>
                  </div>
                ) : (
                  categoryItems.map((item) => (
                    <div key={item.id} className="item-card">
                      <span className="item-text">{item.text}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="remove-button"
                        title="Eliminar item"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}