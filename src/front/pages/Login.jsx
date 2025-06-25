import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../index.css";

export const Login = () => {
    const { login } = useGlobalReducer();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginSuccess, setLoginSuccess] = useState(false);
    const navigate = useNavigate();

    const isValidPassword = (password) => {
        const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return pattern.test(password);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!isValidPassword(password)) {
            alert("Formato de contraseña inválido. Debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.");
            return;
        }

        const successLogin = await login(email, password);
        if (successLogin) {
            setLoginSuccess(true);
            setTimeout(() => navigate("/dashboard"), 1000);
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
            {loginSuccess && (
                <div className="dialog success-dialog">
                    <p>✅ Usuario logueado correctamente</p>
                </div>
            )}
        </div>
    );
};