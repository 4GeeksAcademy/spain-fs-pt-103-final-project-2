import React, { useState, useEffect } from "react";
import "../dashboard.css";
import { API_URL } from "../config";

const diasSemanaBase = [
  { dia: 'Lun', activo: false },
  { dia: 'Mar', activo: false },
  { dia: 'Mié', activo: false },
  { dia: 'Jue', activo: false },
  { dia: 'Vie', activo: false },
  { dia: 'Sáb', activo: false },
  { dia: 'Dom', activo: false },
];

export default function Dashboard() {
  const [pesos, setPesos] = useState([]);
  const [nuevoPeso, setNuevoPeso] = useState("");
  const [ejercicios, setEjercicios] = useState([]);
  const [diasSemana, setDiasSemana] = useState(diasSemanaBase);
  const [mensaje, setMensaje] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPesos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pesos`);
      const data = await res.json();
      setPesos(data);
    } catch (error) {
      console.error("Error al obtener pesos:", error);
    }
  };

  const fetchEjercicios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ejercicio`);
      const data = await res.json();
      setEjercicios(data);
    } catch (error) {
      console.error("Error al obtener ejercicios:", error);
    }
  };

  useEffect(() => {
    fetchPesos();
    fetchEjercicios();
  }, []);

  const guardarPeso = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pesos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peso: parseFloat(nuevoPeso), fecha: new Date().toISOString() })
      });
      if (res.ok) {
        setNuevoPeso("");
        fetchPesos();
        setMensaje("Peso guardado correctamente");
      }
    } catch (error) {
      console.error("Error al guardar peso:", error);
    }
  };

  const marcarEjercicio = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ejercicio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha: new Date().toISOString() })
      });
      if (res.ok) {
        fetchEjercicios();
        setMensaje("Día de ejercicio guardado correctamente");
      }
    } catch (error) {
      console.error("Error al guardar ejercicio:", error);
    }
  };

  const handlePromptSend = async () => {
    setLoading(true);
    console.log("Enviando prompt a OpenAI:", prompt);
    console.log("API_URL:", API_URL);

    try {
      const res = await fetch(`${API_URL}/api/openai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });
      console.log("Status de OpenAI:", res.status)
      console.log("Headers de OpenAI:", res.headers);
      const data = await res.json();
      console.log("Datos recibidos de backend:", data);
      console.log("Campo Reply:", data.reply);
      setResponse(data.reply || "Sin respuesta");
    } catch (err) {
      console.error("Error al consultar OpenAI:", err);
      setResponse("Error al conectar con el backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {mensaje && <p className="mensaje-ok">{mensaje}</p>}

      <div className="peso-section">
        <h2>Registro de Peso</h2>
        <input
          type="number"
          value={nuevoPeso}
          onChange={(e) => setNuevoPeso(e.target.value)}
          placeholder="Introduce tu peso"
        />
        <button onClick={guardarPeso}>Guardar Peso</button>
        <svg width="600" height="300">
          <polyline
            fill="none"
            stroke="blue"
            strokeWidth="3"
            points={pesos
              .map((p, i) => `${i * 30},${300 - (p.peso * 2)}`)
              .join(" ")}
          />
        </svg>
      </div>

      <div className="ejercicio-section">
        <h2>Seguimiento de Ejercicio</h2>
        <button onClick={marcarEjercicio}>Marcar Día de Ejercicio</button>
        <svg width="600" height="100">
          {ejercicios.map((e, i) => (
            <circle
              key={e.id || i}
              cx={i * 30 + 10}
              cy={50}
              r={8}
              fill="green"
            />
          ))}
        </svg>
      </div>

      <div className="chat-section">
        <h2>Chat con la IA</h2>
        <form onSubmit={(e) => { e.preventDefault(); handlePromptSend(); }}>
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
            <h3>Respuesta:</h3>
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
