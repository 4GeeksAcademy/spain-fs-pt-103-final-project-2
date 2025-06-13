import React from "react";
import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo-container" aria-label="Ir a inicio">
          <img
            src="/src/front/assets/img/SmartRecipe.png"
            alt="SmartRecipe logo"
            className="logo-img"
          />
        </Link>

        {location.pathname !== "/login" && location.pathname !== "/register" && (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-login">Iniciar Sesión</Link>
            <Link to="/register" className="btn btn-register">Registrarse</Link>
          </div>
        )}
        {(location.pathname === "/login" || location.pathname === "/register") && (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-login">Iniciar Sesión</Link>
            <Link to="/register" className="btn btn-register">Registrarse</Link>
          </div>
        )}
      </div>
    </nav>
  );
};
