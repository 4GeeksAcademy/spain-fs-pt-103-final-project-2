import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
	const { store, dispatch } = useGlobalReducer();

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file");

			const response = await fetch(backendUrl + "/api/hello");
			const data = await response.json();

			if (response.ok) dispatch({ type: "set_hello", payload: data.message });

			return data;
		} catch (error) {
			if (error.message)
				throw new Error(
					`Could not fetch the message from the backend. Please check if the backend is running and the backend port is public.`
				);
		}
	};

	useEffect(() => {
		loadMessage();
	}, []);

	return (
		<div>
			<Navbar />
			{/* Presentacion */}
			<section className="hero">
				<div className="hero-container">
					<h1 className="hero-title">Cocina Inteligente con IA</h1>
					<p className="hero-subtitle">
						Transforma tus ingredientes en recetas deliciosas y personalizadas con el poder de la inteligencia artificial
					</p>
					<Link to="/register" className="btn free">Empezar Gratis</Link>
				</div>
			</section>

			{/* Contenido */}
			<section className="content">
				<div className="content-container">
					<h2 className="section-title">¿Por qué elegir RecipeAI?</h2>

					<div className="features-grid">
						<div className="feature">
							<div className="feature-icon">🥘</div>
							<h3>Recetas Personalizadas</h3>
							<p>Crea platos únicos basados en los ingredientes que tienes en casa y tus preferencias alimentarias</p>
						</div>

						<div className="feature">
							<div className="feature-icon">📊</div>
							<h3>Control Nutricional</h3>
							<p>Monitorea tu progreso con análisis detallados y gráficas de tu consumo nutricional diario</p>
						</div>

						<div className="feature">
							<div className="feature-icon">❤️</div>
							<h3>Recetas Favoritas</h3>
							<p>Guarda y organiza las recetas que más te gustan para tenerlas siempre a mano</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};