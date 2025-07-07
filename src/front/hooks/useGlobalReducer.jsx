import React, { useContext, useReducer, useEffect } from "react";
import reducer, { initialState, StoreContext } from "../store";
import { API_URL } from "../config";

export const StoreProvider = ({ children }) => {
  const [store, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

const useGlobalReducer = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useGlobalReducer must be used within a StoreProvider");

  const { store, dispatch } = context;

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Credenciales inválidas");

      const data = await res.json();
      console.log("Usuario logueado:", data);
      dispatch({ type: "set_user", payload: data.user });
      dispatch({ type: "set_token", payload: data.access_token });
      localStorage.setItem("token", data.access_token);
      return true;
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      return false;
    }
  };

  const logout = () => {
    dispatch({ type: "set_user", payload: null });
    dispatch({ type: "set_token", payload: null });
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    console.log("Usuario deslogueado");
  };

  const register = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Registro fallido:", data?.msg || res.statusText);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      return false;
    }
  };

  // Sincroniza el token de localStorage al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !store.token) {
      dispatch({ type: "set_token", payload: token });
    }
  }, [dispatch, store.token]);

  const authorizedHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${store.token}`,
  });

  const getDatosUsuario = async () => {
    try {
      const res = await fetch(`${API_URL}/api/datos_usuario`, {
        headers: authorizedHeaders(),
      });
      return await res.json();
    } catch (err) {
      console.error("Error al obtener datos personales:", err);
      return null;
    }
  };

  const actualizarDatosUsuario = async (data) => {
    try {
      const res = await fetch(`${API_URL}/api/datos_usuario`, {
        method: "POST",
        headers: authorizedHeaders(),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err) {
      console.error("Error al actualizar datos personales:", err);
      return null;
    }
  };

  const getPesos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pesos`, {
        headers: authorizedHeaders(),
      });
      return await res.json();
    } catch (err) {
      console.error("Error al obtener pesos:", err);
      return [];
    }
  };

  const guardarPeso = async (peso, fecha) => {
    try {
      await fetch(`${API_URL}/api/pesos`, {
        method: "POST",
        headers: authorizedHeaders(),
        body: JSON.stringify({ peso, fecha }),
      });
    } catch (err) {
      console.error("Error al guardar peso:", err);
    }
  };

  const actualizarPeso = async (id, peso) => {
    try {
      await fetch(`${API_URL}/api/pesos/${id}`, {
        method: "PUT",
        headers: authorizedHeaders(),
        body: JSON.stringify({ peso }),
      });
    } catch (err) {
      console.error("Error al actualizar peso:", err);
    }
  };

  const getEjercicio = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ejercicio`, {
        headers: authorizedHeaders(),
      });
      return await res.json();
    } catch (err) {
      console.error("Error al obtener días de ejercicio:", err);
      return [];
    }
  };

  const guardarEjercicio = async (dia, fecha) => {
    try {
      await fetch(`${API_URL}/api/ejercicio`, {
        method: "POST",
        headers: authorizedHeaders(),
        body: JSON.stringify({ dia, fecha }),
      });
    } catch (err) {
      console.error("Error al guardar día de ejercicio:", err);
    }
  };

  const actualizarEjercicio = async (id, dia) => {
    try {
      await fetch(`${API_URL}/api/ejercicio/${id}`, {
        method: "PUT",
        headers: authorizedHeaders(),
        body: JSON.stringify({ dia }),
      });
    } catch (err) {
      console.error("Error al actualizar día de ejercicio:", err);
    }
  };

  const getEstadisticasTotales = async () => {
    try {
      const res = await fetch(`${API_URL}/api/estadisticas/totales`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      if (!res.ok) throw new Error("No se pudieron obtener estadísticas");

      return await res.json();
    } catch (err) {
      console.error("Error al obtener estadísticas:", err);
      return null;
    }
  };

  return {
    store,
    dispatch,
    login,
    logout,
    register,
    getDatosUsuario,
    actualizarDatosUsuario,
    getPesos,
    guardarPeso,
    actualizarPeso,
    getEjercicio,
    guardarEjercicio,
    actualizarEjercicio,
    getEstadisticasTotales,
  };
};

export default useGlobalReducer;