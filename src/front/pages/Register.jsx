import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../index.css";

export const Register = () => {
    const { register } = useGlobalReducer();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const success = await register(email, password);
        if (success) {
            setRegisterSuccess(true);
            setTimeout(() => navigate("/login"), 1000);
        } else {
            alert("Error al registrar usuario");
        }
    };

    return (
        <div className="auth-page register-page">
            <h1 className="hero-title">Registro</h1>
            <form className="auth-form" onSubmit={handleRegister}>
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
                <button type="submit" className="cta-button">Registrarse</button>
            </form>
            {registerSuccess && (
                <div className="dialog success-dialog">
                    <p>✅ Usuario registrado correctamente</p>
                </div>
            )}
        </div>
    );
};
