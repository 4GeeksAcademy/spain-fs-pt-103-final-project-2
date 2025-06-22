import React, { useState } from "react";
import { ShoppingCart, Plus, X, Search } from "lucide-react";
import "../css/ListaCompra.css"

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Carnes");
  const [searchTerm, setSearchTerm] = useState("");
  const categories = ["Carnes", "Bebidas", "Frutas", "Verduras", "Condimentos", "Otros"];

  function addItem() {
    if (input.trim() === "") return;
    
    const newItem = {
      id: Date.now(),
      text: input.trim(),
      category: selectedCategory
    };
    
    setItems([...items, newItem]);
    setInput("");
  }

  // Eliminar un item
  function removeItem(id) {
    setItems(items.filter(item => item.id !== id));
  }

  // Filtrar items por categoria
  function getItemsByCategory(category) {
    return items.filter(item => {
      const matchesCategory = item.category === category;
      const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  // Contar items por categoría
  function countItemsByCategory(category) {
    return items.filter(item => item.category === category).length;
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
            {categories.map(category => (
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

      {/* Categorias de categorías */}
      <div className="categories-grid">
        {categories.map(category => {
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
                  categoryItems.map(item => (
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