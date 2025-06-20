
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [sucess, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || "Error al registrar usuario");
                return;
            }

            const data = await res.json();
            setSuccess("Registro exitoso. Por favor, inicia sesión.");
            console.log("Register response:", data);

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error("Error during register:", error);
            setError("Error al registrar usuario. Por favor, inténtalo de nuevo más tarde.");
        }
    };

    return (
        <div className="auth-page register-page">
            <h1 className="hero-title">Crear cuenta</h1>
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
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit" className="cta-button">Registrarse</button>
            </form>
        </div>
    );
};

export default Register;
