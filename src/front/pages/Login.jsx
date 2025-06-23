import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Login = () => {
    const { login } = useGlobalReducer();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            navigate("/dashboard");
        } else {
            alert("Credenciales inválidas");
        }
    };

    return (
        <div className="auth-page login-page">
            <h1 className="hero-title">Iniciar sesión</h1>
            <form className="auth-form" onSubmit={handleLogin}>
                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="cta-button">Entrar</button>
            </form>
        </div>
    );
};

