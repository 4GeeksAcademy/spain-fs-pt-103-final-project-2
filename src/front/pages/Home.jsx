import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
/*import "../index.css";*/
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
	const { store, dispatch } = useGlobalReducer();

	return (
		<div>
			<Navbar />
			{/* Presentacion */}
			<section className="hero">
				<div className="hero-container">
					<h1 className="hero-title">Cocina Inteligente con IA</h1>
					<p className="hero-subtitle">
						Crea nuevas recetas con la ayuda de la IA y prueba los nuevos y deliciosos platos para cada ocasión.
					</p>
					<Link to="/register" className="btn free">Empezar Gratis</Link>
				</div>
			</section>

			{/* Contenido */}
			<section className="content">
				<div className="content-container">
					<h2 className="section-title">¿Por qué elegir SmartRecipe?</h2>

					<div className="features-grid">
						<div className="feature">
							<div className="feature-icon">🍳</div>
							<h3>Recetas Personalizadas</h3>
							<p>Crea platos únicos basados en los ingredientes que tienes en casa y tus preferencias alimentarias</p>
						</div>

						<div className="feature">
							<div className="feature-icon">📊</div>
							<h3>Control Nutricional</h3>
							<p>Monitorea tu progreso con análisis detallados y gráficas de tu consumo nutricional diario</p>
						</div>

						<div className="feature">
							<div className="feature-icon">🛒</div>
							<h3>Lista de la compra</h3>
							<p>Guarda y organiza tu lista de la compra para tenerla siempre a mano</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};