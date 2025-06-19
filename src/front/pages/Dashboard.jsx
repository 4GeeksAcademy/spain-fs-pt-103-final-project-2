
import React, { useState } from "react";
import { API_URL } from "../config";

export default function Dashboard() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePrompt = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/openai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();
            setResponse(data.response || "Sin respuesta");
        } catch (error) {
            console.error("Error al consultar OpenAI:", error);
            setResponse("Error al conectar con el backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <h1>Panel de control</h1>
            <form onSubmit={handlePrompt}>
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Escribe tu pregunta para la IA..."
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Consultando..." : "Enviar a OpenAI"}
                </button>
            </form>
            {response && (
                <div className="ai-response">
                    <h2>Respuesta:</h2>
                    <p>{response}</p>
                </div>
            )}
        </div>
    );
}
