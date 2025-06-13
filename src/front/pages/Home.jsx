import React from "react";
import rigoImageUrl from "../assets/img/rigo-baby.jpg";


export const Home = () => {
    return (
        <div className="landing-bg min-vh-100 d-flex align-items-center">
            <div className="container py-5">
                <div className="row g-5 align-items-center">
               
                    <div className="col-lg-7">
                        <div className="p-4 rounded-4 shadow-lg glass-bg">
                            <h1 className="mb-3 titulo-gradiente-horizontal display-4 fw-bold text-uppercase">
                                ¡Genera tu receta personalizada!
                            </h1>
                            <p className="lead text-white mb-4">
                                Selecciona tus preferencias y restricciones. Nuestra aplicación generará una receta adaptada a tus elecciones. ¡Descubre nuevas ideas saludables y deliciosas!
                            </p>
                            <form>
                                <div className="mb-3">
                                    <label className="label-blanco-bold mb-1">Proteínas</label>
                                    <select className="form-select">
                                        <option>Pollo</option>
                                        <option>Ternera</option>
                                        <option>Pescado</option>
                                        <option>Tofu</option>
                                        <option>Huevo</option>
                                        <option>Sin proteína</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="label-blanco-bold mb-1">Verduras</label>
                                    <select className="form-select" multiple>
                                        <option>Espinaca</option>
                                        <option>Brócoli</option>
                                        <option>Zanahoria</option>
                                        <option>Pimiento</option>
                                        <option>Calabacín</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="label-blanco-bold mb-1">Frutas</label>
                                    <select className="form-select" multiple>
                                        <option>Manzana</option>
                                        <option>Plátano</option>
                                        <option>Fresa</option>
                                        <option>Naranja</option>
                                        <option>Uva</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="label-blanco-bold mb-1">Alergias</label>
                                    <select className="form-select" multiple>
                                        <option>Gluten</option>
                                        <option>Lácteos</option>
                                        <option>Frutos secos</option>
                                        <option>Soja</option>
                                        <option>Mariscos</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="label-blanco-bold mb-1">Cantidad de calorías</label>
                                    <input type="number" className="form-control" placeholder="Ej: 500" min="100" max="3000" />
                                </div>
                                <button type="submit" className="btn btn-success w-100 py-2 fs-5 shadow-sm">
                                    Generar receta
                                </button>
                            </form>
                            <div className="mt-4">
                                <h4 className="text-white">Tu receta personalizada</h4>
                                <div className="card mt-2 glass-bg border-0">
                                    <div className="card-body">
                                        <p className="card-text text-muted">
                                            Selecciona tus parámetros y pulsa "Generar receta" para ver una receta adaptada a tus elecciones.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                   
                    {/* <div className="col-lg-5">
                        <div className="p-4 rounded-4 shadow-lg glass-bg text-center">
                            <h2 className="mb-4 text-white fw-bold">Inicia sesión o regístrate</h2>
                            <form>
                                <div className="mb-3 text-start">
                                    <label htmlFor="email" className="label-blanco-bold mb-1">Email</label>
                                    <input type="email" className="form-control" id="email" placeholder="Introduce tu email" required />
                                </div>
                                <div className="mb-3 text-start">
                                    <label htmlFor="password" className="label-blanco-bold mb-1">Contraseña</label>
                                    <input type="password" className="form-control" id="password" placeholder="Introduce tu contraseña" required />
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary">Iniciar sesión</button>
                                    <button type="button" className="btn btn-outline-light mt-2">Registrarse</button>
                                </div>
                            </form>
                            <div className="text-center mt-4">
                                <img src={rigoImageUrl} className="img-fluid rounded-circle border border-3 border-white shadow" alt="Rigo Baby" width="90" />
                            </div>
                            <div className="alert alert-info mt-4 glass-bg border-0">
                                <span>¡Bienvenido! Prueba la generación de recetas personalizadas.</span>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};