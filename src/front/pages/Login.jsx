
import React, { useState } from "react";
import { API_URL } from "../config";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            console.log("Login response:", data);
        } catch (error) {
            console.error("Error during login:", error);
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

export default Login;
