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
  // HTTPS por defecto: Codespace o .env
  const API_URL = import.meta.env.VITE_API_URL ?? "https://animated-broccoli-975xq66wrqpq2x44-3001.app.github.dev";

  /** Normaliza _id → id */
  const normalizeItem = (raw) => ({ ...raw, id: raw.id ?? raw._id });

  /** Cargar items */
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/shopping`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setItems(Array.isArray(data) ? data.map(normalizeItem) : []);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Error cargando items:", err.message);
      }
    })();
    return () => controller.abort();
  }, [token, API_URL]);

  /** Agregar item */
  async function addItem() {
    if (!input.trim() || !token) return;

    const newItem = { text: input.trim(), category: selectedCategory };

    try {
      const res = await fetch(`${API_URL}/api/shopping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.item) {
        setItems((prev) => [...prev, normalizeItem(data.item)]);
        setInput("");
      }
    } catch (err) {
      console.error("Error al agregar item:", err.message);
    }
  }

  /** Eliminar */
  async function removeItem(id) {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/shopping/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems((prev) => prev.filter((item) => item.id !== id));
      else console.error("El servidor respondió", res.status);
    } catch (err) {
      console.error("Error al eliminar item:", err.message);
    }
  }

  /** Filtros */
  const getItemsByCategory = (category) =>
    items.filter(
      (item) => item.category === category && item.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  const countItemsByCategory = (category) => items.filter((item) => item.category === category).length;

  return (
    <div className="shopping-container">
      <div className="header">
        <ShoppingCart className="header-icon" />
        <h1 className="main-title">Lista de Compras</h1>
      </div>

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
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button onClick={addItem} className="add-button">
            <Plus size={20} /> Agregar
          </button>
        </div>
      </div>

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
