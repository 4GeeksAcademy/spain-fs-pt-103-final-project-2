import "../dashboard.css";
import React, { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [tempUserData, setTempUserData] = useState(userData);
  const [pesosSemanal, setPesosSemanal] = useState([]);
  const [nuevoPeso, setNuevoPeso] = useState('');
  const [diasEjercicio, setDiasEjercicio] = useState({ totalMes: 0, totalAño: 0 });
  const [diasSemana, setDiasSemana] = useState(diasSemanaBase);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // Función para cargar datos del usuario
  const cargarDatosUsuario = async () => {
    try {
      const token = localStorage.getItem('token');

      console.log('Cargando datos - Token existe:', !!token);

      if (!token) {
        console.log('No hay token para cargar datos');
        return;
      }

      const response = await fetch(`${API_URL}/api/usuario/datos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Status carga datos:', response.status);

      if (response.ok) {
        const result = await response.json();
        const user = result.user || result;

        const datosUsuario = {
          nombre: user.nombre || "",
          apellido: user.apellido || "",
          fechaNacimiento: user.fecha_nacimiento || "",
          altura: user.altura_cm?.toString() || "",
          pesoActual: user.peso_actual?.toString() || "",
          metaPeso: user.meta_peso?.toString() || "",
        };

        setUserData(datosUsuario);
        setTempUserData(datosUsuario);
        console.log('✅ Datos del usuario cargados:', datosUsuario);
      } else {
        console.log('❌ Error cargando datos:', response.status);
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  };
  const cargarPesos = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch(`${API_URL}/api/pesos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setPesosSemanal(data);
    }
  };
  // Cambia cargarEjercicio para que NO marque días activos al cargar el Dashboard
  const cargarEjercicio = async () => {
    // Al cargar, deja todos los días desmarcados
    setDiasSemana(diasSemanaBase);
  };

  // Guardar día de ejercicio en el backend
  const guardarDiaEjercicio = async (dia) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const now = new Date();
    await fetch(`${API_URL}/api/ejercicio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dia, fecha: now.toISOString() })
    });
    // No recargues los días activos aquí
  };

  // Eliminar día de ejercicio en el backend
  const eliminarDiaEjercicio = async (dia) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_URL}/api/ejercicio`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dia })
    });
    // No recargues los días activos aquí
  };

  // Cuando el usuario marca un día, lo guardamos en el backend si lo activa
  const cambiarDiaEjercicio = idx => {
    setDiasSemana(prev => {
      const nuevoEstado = prev.map((dia, i) =>
        i === idx ? { ...dia, activo: !dia.activo } : dia
      );
      if (!prev[idx].activo) {
        // Si lo activamos, lo guardamos en el backend
        guardarDiaEjercicio(prev[idx].dia);
      } else {
        // Si lo desactivamos, lo eliminamos del backend
        eliminarDiaEjercicio(prev[idx].dia);
      }
      return nuevoEstado;
    });
  };

  const cargarEstadisticas = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch(`${API_URL}/api/estadisticas/totales`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setDiasEjercicio({
        totalMes: data.este_mes,
        totalAño: data.este_año
      });
      // Puedes usar data.esta_semana si lo necesitas
    }
  };

  // Cargar datos al montar el componente
  // ✅ useEffect para cargar datos al iniciar el componente
  useEffect(() => {
    cargarDatosUsuario();
    cargarPesos();
    cargarEjercicio();
    cargarEstadisticas();

    // Al desmontar, limpia los días activos
    return () => setDiasSemana(diasSemanaBase);
  }, []); // Array vacío = se ejecuta solo UNA vez al montar

  const iniciarEdicion = () => {
    setTempUserData(userData);
    setEditMode(true);
  };

  const guardarCambios = async () => {
    setIsLoading(true);

    try {
      // Obtener token de forma DIRECTA
      const token = localStorage.getItem('token');

      // Debug simple
      console.log('Token obtenido:', token ? 'SÍ EXISTE' : 'NO EXISTE');
      console.log('Primeros 20 caracteres:', token ? token.substring(0, 20) : 'N/A');

      // Si no hay token, mostrar alert Y continuar (para debuggear)
      if (!token) {
        console.log('❌ No se encontró token');
        alert('No hay token - esto es para debug, seguimos...');
        // NO hacemos return, seguimos para ver qué pasa
      }

      // Validar campos requeridos
      if (!tempUserData.altura || !tempUserData.pesoActual || !tempUserData.metaPeso) {
        alert('Error: Los campos altura, peso actual y meta de peso son obligatorios.');
        setIsLoading(false);
        return;
      }

      // Preparar datos para el backend
      const datosParaBackend = {
        nombre: tempUserData.nombre || "",
        apellido: tempUserData.apellido || "",
        fechaNacimiento: tempUserData.fechaNacimiento || "",
        edad: calcularEdad(tempUserData.fechaNacimiento),
        altura_cm: parseFloat(tempUserData.altura),
        peso_actual: parseFloat(tempUserData.pesoActual),
        meta_peso: parseFloat(tempUserData.metaPeso),
      };

      console.log('Enviando datos al backend:', datosParaBackend);

      // Hacer petición con token (si existe)
      const headers = {
        'Content-Type': 'application/json'
      };

      // Solo agregar Authorization si hay token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Headers a enviar:', headers);

      const response = await fetch(`${API_URL}/api/usuario/datos`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(datosParaBackend)
      });

      console.log('Status de respuesta:', response.status);
      const result = await response.json();
      console.log('Respuesta del backend:', result);

      if (response.ok) {
        // ✅ Éxito: actualizar estado local con datos del servidor
        const userFromServer = result.user;

        // Mapear campos del backend al frontend
        const datosActualizados = {
          nombre: userFromServer.nombre || "",
          apellido: userFromServer.apellido || "",
          fechaNacimiento: userFromServer.fecha_nacimiento || "",
          altura: userFromServer.altura_cm?.toString() || "",
          pesoActual: userFromServer.peso_actual?.toString() || "",
          metaPeso: userFromServer.meta_peso?.toString() || "",
        };

        setUserData(datosActualizados);
        setTempUserData(datosActualizados);
        setEditMode(false);

        alert('✅ Datos actualizados correctamente!');
      } else {
        // ❌ Error del servidor
        console.error('Error del servidor:', result);
        if (response.status === 401) {
          alert('❌ Error 401: Token inválido o expirado');
        } else {
          alert(`Error: ${result.error || 'No se pudieron guardar los datos'}`);
        }
      }

    } catch (error) {
      // ❌ Error de conexión
      console.error('Error al conectar con el servidor:', error);
      alert('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setTempUserData(userData);
    setEditMode(false);
  };

  const cambiarDatoUsuario = (campo, valor) => {
    setTempUserData(prev => ({ ...prev, [campo]: valor }));
  };

  const agregarPeso = async () => {
    if (nuevoPeso && parseFloat(nuevoPeso) > 0) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Debes iniciar sesión para guardar tu peso.");
        return;
      }
      const now = new Date();
      const nuevaEntrada = {
        peso: parseFloat(nuevoPeso),
        fecha: now.toISOString()
      };
      const res = await fetch(`${API_URL}/api/pesos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevaEntrada)
      });
      if (res.ok) {
        await cargarPesos(); // Recarga la lista desde el backend
        setNuevoPeso('');
      } else {
        alert("No se pudo guardar el peso. Intenta de nuevo.");
      }
    } else {
      alert("Introduce un peso válido.");
    }
  };

  const eliminarPesoEspecifico = idx => {
    setPesosSemanal(prev => prev.filter((_, i) => i !== idx));
  };

  const eliminarTodosPesos = () => {
    setPesosSemanal([]);
  };

  /* Eliminado: declaración duplicada de cambiarDiaEjercicio */

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

  // Función para el chatbot
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

  return (
    <div className="home-bg">
      <div className="home-main-grid">
        {/* Prompt para el chatbot */}
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
            <div className="chatbot-response">
              <strong>Respuesta:</strong>
              <div>{response}</div>
            </div>
          )}
        </div>

        <div className="home-col">
          <div className="home-block">
            <div className="home-block-header">
              <span className="home-block-title">👤 Datos Personales</span>
              {!editMode ? (
                <button onClick={iniciarEdicion} className="home-btn home-btn-edit">
                  Editar
                </button>
              ) : (
                <div>
                  <button
                    onClick={guardarCambios}
                    className="home-btn home-btn-save"
                    disabled={isLoading}
                  >
                    {isLoading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={cancelarEdicion}
                    className="home-btn home-btn-cancel"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
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
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="home-label">Apellido</label>
                  <input
                    type="text"
                    value={tempUserData.apellido}
                    onChange={e => cambiarDatoUsuario('apellido', e.target.value)}
                    className="home-input"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="home-label">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={tempUserData.fechaNacimiento}
                    onChange={e => cambiarDatoUsuario('fechaNacimiento', e.target.value)}
                    className="home-input"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="home-label">Altura (cm) *</label>
                  <input
                    type="number"
                    value={tempUserData.altura}
                    onChange={e => cambiarDatoUsuario('altura', e.target.value)}
                    className="home-input"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="home-label">Peso Actual (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempUserData.pesoActual}
                    onChange={e => cambiarDatoUsuario('pesoActual', e.target.value)}
                    className="home-input"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="home-label">Meta de Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempUserData.metaPeso}
                    onChange={e => cambiarDatoUsuario('metaPeso', e.target.value)}
                    className="home-input"
                    required
                    disabled={isLoading}
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
    </div>
  );
}