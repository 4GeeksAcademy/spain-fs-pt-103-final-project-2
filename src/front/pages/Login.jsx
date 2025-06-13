import React from "react";

const Login = () => {
    return (
        <div className="auth-page login-page">
            <h1 className="hero-title">Iniciar sesión</h1>
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
                <button type="submit" className="cta-button">Entrar</button>
            </form>
        </div>
    );
};

export default Login;