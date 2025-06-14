import React from "react";

export const Register = () => {
    return (
        <div className="auth-page register-page">
            <h1 className="hero-title">Crear cuenta</h1>
            <form className="auth-form">
                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmar contraseña"
                    required
                />
                <button type="submit" className="cta-button">Registrarse</button>
            </form>
        </div>
    );
};

export default Register;
