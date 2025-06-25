import "../dashboard.css";
import React, { useState } from "react";
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

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

function calcularIMC(peso, altura) {
  if (!peso || !altura) return 0;
  return peso / Math.pow(altura / 100, 2);
}

function formatearFecha(fecha) {
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const año = date.getFullYear();
  const hora = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${año} ${hora}:${min}`;
}

function formatearFechaCorta(fecha) {
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

export default function Home() {
  const [userData, setUserData] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    altura: "",
    pesoActual: "",
    metaPeso: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [tempUserData, setTempUserData] = useState(userData);
  const [pesosSemanal, setPesosSemanal] = useState([]);
  const [nuevoPeso, setNuevoPeso] = useState('');
  const [diasEjercicio, setDiasEjercicio] = useState({ totalMes: 0, totalAño: 0 });
  const [diasSemana, setDiasSemana] = useState(diasSemanaBase);

  const iniciarEdicion = () => {
    setTempUserData(userData);
    setEditMode(true);
  };

  const guardarCambios = () => {
    setUserData(tempUserData);
    setEditMode(false);
  };

  const cancelarEdicion = () => {
    setTempUserData(userData);
    setEditMode(false);
  };

  const cambiarDatoUsuario = (campo, valor) => {
    setTempUserData(prev => ({ ...prev, [campo]: valor }));
  };

  const agregarPeso = () => {
    if (nuevoPeso && parseFloat(nuevoPeso) > 0) {
      const now = new Date();
      const nuevaEntrada = {
        fecha: now,
        peso: parseFloat(nuevoPeso)
      };
      setPesosSemanal(prev => [...prev, nuevaEntrada]);
      setNuevoPeso('');
    }
  };

  const eliminarPesoEspecifico = idx => {
    setPesosSemanal(prev => prev.filter((_, i) => i !== idx));
  };

  const eliminarTodosPesos = () => {
    setPesosSemanal([]);
  };

  const cambiarDiaEjercicio = idx => {
    setDiasSemana(prev =>
      prev.map((dia, i) =>
        i === idx ? { ...dia, activo: !dia.activo } : dia
      )
    );
  };

  const iniciarNuevaSemana = () => {
    const diasActivos = diasSemana.filter(dia => dia.activo).length;
    setDiasEjercicio(prev => ({
      totalMes: prev.totalMes + diasActivos,
      totalAño: prev.totalAño + diasActivos
    }));
    setDiasSemana(diasSemanaBase);
  };

  const resetearMes = () => {
    setDiasEjercicio(prev => ({ ...prev, totalMes: 0 }));
  };

  const resetearAño = () => {
    setDiasEjercicio({ totalMes: 0, totalAño: 0 });
  };

  const diasActivosEstaSemana = diasSemana.filter(dia => dia.activo).length;
  const diferenciaPeso = userData.metaPeso && userData.pesoActual
    ? userData.metaPeso - userData.pesoActual
    : 0;

  // Datos para la gráfica de líneas
  const maxPeso = pesosSemanal.length > 0 ? Math.max(...pesosSemanal.map(p => p.peso)) : 100;
  const minPeso = pesosSemanal.length > 0 ? Math.min(...pesosSemanal.map(p => p.peso)) : 50;
  const rango = maxPeso - minPeso === 0 ? 10 : maxPeso - minPeso;
  const margenGrafica = rango * 0.1;
  const maxY = maxPeso + margenGrafica;
  const minY = Math.max(0, minPeso - margenGrafica);
  const rangoY = maxY - minY;

  // Configuración de la gráfica
  const anchoGrafica = 600;
  const altoGrafica = 300;
  const margenIzq = 60;
  const margenDer = 20;
  const margenTop = 20;
  const margenBot = 50;
  const anchoChart = anchoGrafica - margenIzq - margenDer;
  const altoChart = altoGrafica - margenTop - margenBot;


  const puntos = pesosSemanal.map((p, i) => {
    const x = margenIzq + (i / Math.max(1, pesosSemanal.length - 1)) * anchoChart;
    const y = margenTop + altoChart - ((p.peso - minY) / rangoY) * altoChart;
    return { x, y, peso: p.peso, fecha: p.fecha };
  });


  const pathLinea = puntos.length > 1
    ? `M ${puntos[0].x} ${puntos[0].y} ` +
    puntos.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';


  const pathArea = puntos.length > 1
    ? `M ${puntos[0].x} ${margenTop + altoChart} ` +
    `L ${puntos[0].x} ${puntos[0].y} ` +
    puntos.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') +
    ` L ${puntos[puntos.length - 1].x} ${margenTop + altoChart} Z`
    : '';

  // Líneas de la cuadrícula
  const lineasGrid = [];
  const numLineas = 5;
  for (let i = 0; i <= numLineas; i++) {
    const y = margenTop + (i / numLineas) * altoChart;
    const valor = maxY - (i / numLineas) * rangoY;
    lineasGrid.push({ y, valor: valor.toFixed(1) });
  }

  // Prompt para el chatbot
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
  }
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="home-bg">
      <div className="home-main-grid">
        <div className="home-col">
          <div className="home-block">
            <div className="home-block-header">
              <span className="home-block-title">👤 Datos Personales</span>
              {!editMode ? (
                <button onClick={iniciarEdicion} className="home-btn home-btn-edit">Editar</button>
              ) : (
                <div>
                  <button onClick={guardarCambios} className="home-btn home-btn-save">Guardar</button>
                  <button onClick={cancelarEdicion} className="home-btn home-btn-cancel">Cancelar</button>
                </div>
              )}
            </div>
            {editMode ? (
              <div className="home-form-grid">
                <div>
                  <label className="home-label">Nombre</label>
                  <input
                    type="text"
                    value={tempUserData.nombre}
                    onChange={e => cambiarDatoUsuario('nombre', e.target.value)}
                    className="home-input"
                  />
                </div>
                <div>
                  <label className="home-label">Apellido</label>
                  <input
                    type="text"
                    value={tempUserData.apellido}
                    onChange={e => cambiarDatoUsuario('apellido', e.target.value)}
                    className="home-input"
                  />
                </div>
                <div>
                  <label className="home-label">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={tempUserData.fechaNacimiento}
                    onChange={e => cambiarDatoUsuario('fechaNacimiento', e.target.value)}
                    className="home-input"
                  />
                </div>
                <div>
                  <label className="home-label">Altura (cm)</label>
                  <input
                    type="number"
                    value={tempUserData.altura}
                    onChange={e => cambiarDatoUsuario('altura', e.target.value)}
                    className="home-input"
                  />
                </div>
                <div>
                  <label className="home-label">Peso Actual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempUserData.pesoActual}
                    onChange={e => cambiarDatoUsuario('pesoActual', e.target.value)}
                    className="home-input"
                  />
                </div>
                <div>
                  <label className="home-label">Meta de Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempUserData.metaPeso}
                    onChange={e => cambiarDatoUsuario('metaPeso', e.target.value)}
                    className="home-input"
                  />
                </div>
              </div>
            ) : (
              <div className="home-summary-grid">
                <div>
                  <div className="home-summary-label">Edad</div>
                  <div className="home-summary-value">{calcularEdad(userData.fechaNacimiento)} años</div>
                </div>
                <div>
                  <div className="home-summary-label">Altura</div>
                  <div className="home-summary-value">{userData.altura} cm</div>
                </div>
                <div>
                  <div className="home-summary-label">Peso Actual</div>
                  <div className="home-summary-value">{userData.pesoActual} kg</div>
                </div>
                <div>
                  <div className="home-summary-label">Meta de Peso</div>
                  <div className="home-summary-value">{userData.metaPeso} kg</div>
                </div>
                <div>
                  <div className="home-summary-label">Diferencia</div>
                  <div className={`home-summary-value ${diferenciaPeso > 0 ? 'text-green' : diferenciaPeso < 0 ? 'text-red' : ''}`}>
                    {diferenciaPeso > 0 ? '+' : ''}{Number(diferenciaPeso).toFixed(1)} kg
                  </div>
                </div>
                <div>
                  <div className="home-summary-label">IMC</div>
                  <div className="home-summary-value">
                    {userData.altura > 0 && userData.pesoActual > 0 ? calcularIMC(userData.pesoActual, userData.altura).toFixed(1) : 0} kg/m²
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="home-block">
            <div className="home-block-header">
              <span className="home-block-title">📈 Progreso de Peso</span>
              <button onClick={eliminarTodosPesos} className="home-btn home-btn-delete">Eliminar Todo</button>
            </div>
            <div className="home-row mb-2">
              <input
                type="number"
                step="0.1"
                placeholder="Peso (kg)"
                value={nuevoPeso}
                onChange={e => setNuevoPeso(e.target.value)}
                className="home-input"
                style={{ maxWidth: 120 }}
                onKeyDown={e => e.key === 'Enter' && agregarPeso()}
              />
              <button onClick={agregarPeso} className="home-btn home-btn-add">Agregar Peso</button>
            </div>
            <div className="home-graph-container">
              {pesosSemanal.length > 0 ? (
                <div className="home-line-chart">
                  <svg
                    viewBox={`0 0 ${anchoGrafica} ${altoGrafica}`}
                    className="home-chart-svg"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Cuadrícula */}
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6a92d4" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#b347c6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#b347c6" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6a92d4" />
                        <stop offset="100%" stopColor="#b347c6" />
                      </linearGradient>
                    </defs>


                    {lineasGrid.map((linea, i) => (
                      <g key={i}>
                        <line
                          x1={margenIzq}
                          y1={linea.y}
                          x2={margenIzq + anchoChart}
                          y2={linea.y}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                        />
                        <text
                          x={margenIzq - 10}
                          y={linea.y + 4}
                          textAnchor="end"
                          fontSize="12"
                          fill="#6b7280"
                        >
                          {linea.valor}
                        </text>
                      </g>
                    ))}


                    {pathArea && (
                      <path
                        d={pathArea}
                        fill="url(#areaGradient)"
                      />
                    )}


                    {pathLinea && (
                      <path
                        d={pathLinea}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}


                    {puntos.map((punto, i) => (
                      <g key={i}>
                        <circle
                          cx={punto.x}
                          cy={punto.y}
                          r="6"
                          fill="#fff"
                          stroke="#b347c6"
                          strokeWidth="3"
                          className="home-chart-point"
                        />

                        <text
                          x={punto.x}
                          y={margenTop + altoChart + 20}
                          textAnchor="middle"
                          fontSize="11"
                          fill="#6b7280"
                        >
                          {formatearFechaCorta(punto.fecha)}
                        </text>
                      </g>
                    ))}

                    {/* Línea de meta */}
                    {userData.metaPeso && !isNaN(Number(userData.metaPeso)) && (
                      <g>
                        <line
                          x1={margenIzq}
                          y1={margenTop + altoChart - ((Number(userData.metaPeso) - minY) / rangoY) * altoChart}
                          x2={margenIzq + anchoChart}
                          y2={margenTop + altoChart - ((Number(userData.metaPeso) - minY) / rangoY) * altoChart}
                          stroke="#e11d48" 
                          strokeWidth="3"
                          strokeDasharray="8,4"
                        />
                        <text
                          x={margenIzq + anchoChart - 5}
                          y={margenTop + altoChart - ((Number(userData.metaPeso) - minY) / rangoY) * altoChart - 5}
                          textAnchor="end"
                          fontSize="14"
                          fill="e11d48"
                          fontWeight="600"
                        >
                          Meta: {userData.metaPeso} kg
                        </text>
                      </g>
                    )}

                    {/* Etiqueta del eje Y */}
                    <text
                      x="20"
                      y="9"
                      fontSize="12"
                      fill="#6b7280"
                      fontWeight="600"
                    >
                      Peso (kg)
                    </text>
                  </svg>
                </div>
              ) : (
                <div className="home-graph-empty">
                  <span role="img" aria-label="weight" style={{ fontSize: 48 }}>⚖️</span>
                  <p>No hay datos de peso. Agrega tu primer peso arriba.</p>
                </div>
              )}
            </div>

            {/* Lista de registros */}
            {pesosSemanal.length > 0 && (
              <div className="home-list">
                <div className="home-list-title">Registros de Peso:</div>
                {pesosSemanal.map((entrada, idx) => (
                  <div key={idx} className="home-list-item">
                    <span>
                      <b>{formatearFecha(entrada.fecha)}</b> — <b>{entrada.peso} kg</b>
                    </span>
                    <button
                      onClick={() => eliminarPesoEspecifico(idx)}
                      className="home-btn home-btn-delete"
                      title="Eliminar esta entrada"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="home-col">
          <div className="home-block">
            <div className="home-block-header">
              <span className="home-block-title">🏃‍♂️ Días de Ejercicio</span>
            </div>
            <div className="home-habit-grid mb-2">
              {diasSemana.map((dia, idx) => (
                <button
                  key={idx}
                  onClick={() => cambiarDiaEjercicio(idx)}
                  className={`home-habit-btn ${dia.activo ? 'home-habit-activo' : ''}`}
                >
                  <span className="home-habit-text">{dia.dia}</span>
                </button>
              ))}
            </div>
            <div className="home-habit-count">
              <span>{diasActivosEstaSemana}/7</span>
              <span className="home-habit-label">días esta semana</span>
            </div>
            <button onClick={iniciarNuevaSemana} className="home-btn home-btn-habit">
              Completar Semana
            </button>
          </div>
          <div className="home-block">
            <div className="home-block-header">
              <span className="home-block-title">📅 Estadísticas Totales</span>
            </div>
            <div className="home-stats">
              <div className="home-stat-row home-stat-moradoazul">
                <span>Esta Semana</span>
                <span className="home-stat-num">{diasActivosEstaSemana}</span>
              </div>
              <div className="home-stat-row home-stat-moradoazul">
                <span>Este Mes</span>
                <div>
                  <span className="home-stat-num">{diasEjercicio.totalMes}</span>
                  <button
                    onClick={resetearMes}
                    className="home-btn home-btn-reset"
                    title="Resetear mes"
                  >❌</button>
                </div>
              </div>
              <div className="home-stat-row home-stat-moradoazul">
                <span>Este Año</span>
                <div>
                  <span className="home-stat-num">{diasEjercicio.totalAño}</span>
                  <button
                    onClick={resetearAño}
                    className="home-btn home-btn-reset"
                    title="Resetear año"
                  >❌</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      {/* Prompt para el chatbot */}
      <div className="chatbot-prompt">
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
