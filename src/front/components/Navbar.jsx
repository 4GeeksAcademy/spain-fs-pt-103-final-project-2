import React from "react";
import { Link, useLocation } from "react-router-dom";


export const Navbar = () => {
  const location = useLocation();

	return (
		<nav className="navbar navbar-light bg-light">
			 <img
            src="/src/front/assets/img/SmartRecipe.png"
            alt="SmartRecipe logo"
            className="logo-img"
          />
		  <div className="auth-buttons">
            <Link to="/" className="btn">Home</Link>
            <Link to="/ListaCompra" className="btn">Lista de la compra</Link>
            <Link to="/Login" className="btn">Iniciar sesión</Link>
            <Link to="/Register" className="btn">Registrarse</Link>
          </div>
		</nav>
	);p
};
