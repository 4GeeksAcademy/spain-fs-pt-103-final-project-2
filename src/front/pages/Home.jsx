import React, { useEffect } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	useEffect(() => {
		loadMessage()
	}, [])

	return (
		 <div className="container mt-5">
            <div className="row align-items-center">
                {/* Explicación de la app */}
                <div className="col-md-6 mb-4 mb-md-0">
                    <h1 className="display-5 mb-3">¡Crea recetas personalizadas!</h1>
                    <p className="lead">
                        Nuestra aplicación genera recetas únicas a partir de los parámetros que tú eliges: ingredientes, tipo de cocina, tiempo disponible y mucho más.
                    </p>
                    <ul className="list-unstyled mb-4">
                        <li>🍅 Elige tus ingredientes favoritos</li>
                        <li>⏱️ Indica el tiempo que tienes</li>
                        <li>🌎 Selecciona el tipo de cocina</li>
                        <li>✨ ¡Recibe una receta adaptada a ti!</li>
                    </ul>
                    <div className="alert alert-info">
                        {store.message ? (
                            <span>{store.message}</span>
                        ) : (
                            <span className="text-danger">
                                Cargando mensaje del backend (asegúrate de que tu backend Python 🐍 está en marcha)...
                            </span>
                        )}
                    </div>
                </div>
                {/* Login / Registro */}
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="card-title mb-4 text-center">Inicia sesión o regístrate</h2>
                            <form>
                                <div className="form-group mb-3">
                                    <label htmlFor="email">Email</label>
                                    <input type="email" className="form-control" id="email" placeholder="Introduce tu email" required />
                                </div>
                                <div className="form-group mb-4">
                                    <label htmlFor="password">Contraseña</label>
                                    <input type="password" className="form-control" id="password" placeholder="Introduce tu contraseña" required />
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary">Iniciar sesión</button>
                                    <button type="button" className="btn btn-outline-secondary mt-2">Registrarse</button>
                                </div>
                            </form>
                            <div className="text-center mt-3">
                                <img src={rigoImageUrl} className="img-fluid rounded-circle" alt="Rigo Baby" width="80" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>	
	);
}; 