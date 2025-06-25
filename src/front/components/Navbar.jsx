import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { store, actions } = useGlobalReducer();

  const isLoggedIn = store.token !== null && store.token !== "";

  const handleLogout = () => {
    actions.logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-light bg-light">
      <img
        src="/src/front/assets/img/SmartRecipe.png"
        alt="SmartRecipe logo"
        className="logo-img"
      />
      <div className="auth-buttons">
        <Link to="/" className="btn">Home</Link>

        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="btn">Dashboard</Link>
            <Link to="/ListaCompra" className="btn">Lista de la compra</Link>
            <button onClick={handleLogout} className="btn">Cerrar sesión</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn">Iniciar sesión</Link>
            <Link to="/register" className="btn">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};