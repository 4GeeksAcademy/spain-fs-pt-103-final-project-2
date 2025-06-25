import React, { useContext, useReducer } from "react";
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
            dispatch({ type: "set_user", payload: data.user });
            dispatch({ type: "set_token", payload: data.token });
            localStorage.setItem("token", data.token);
            return true;
        } catch (err) {
            console.error("Error al iniciar sesión:", err);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        dispatch({ type: "logout" });
    };

    const register = async (email, password) => {
    try {
        const res = await fetch(`${API_URL}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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


    const syncTokenFromStorage = () => {
        const token = localStorage.getItem("token");
        if (token) {
            dispatch({ type: "set_token", payload: token });
        }
    };

    const getFavorites = async () => {
        try {
            const res = await fetch(`${API_URL}/api/favorites`, {
                headers: {
                    Authorization: "Bearer " + store.token,
                },
            });
            if (!res.ok) throw new Error("No se pudieron cargar favoritos");
            const data = await res.json();
            dispatch({ type: "set_favorites", payload: data });
        } catch (err) {
            console.error("Error al cargar favoritos:", err);
        }
    };

    const addFavorite = async (recipeId) => {
        try {
            const res = await fetch(`${API_URL}/api/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + store.token,
                },
                body: JSON.stringify({ recipe_id: recipeId }),
            });

            if (!res.ok) throw new Error("No se pudo agregar favorito");
            getFavorites();
        } catch (err) {
            console.error("Error al agregar favorito:", err);
        }
    };

    const removeFavorite = async (recipeId) => {
        try {
            const res = await fetch(`${API_URL}/api/favorites/${recipeId}`, {
                method: "DELETE",
                headers: {
                    Authorization: "Bearer " + store.token,
                },
            });

            if (!res.ok) throw new Error("No se pudo eliminar favorito");
            getFavorites();
        } catch (err) {
            console.error("Error al eliminar favorito:", err);
        }
    };

    const fetchMessage = async () => {
        try {
            const res = await fetch(`${API_URL}/api/hello`);
            const data = await res.json();
            dispatch({ type: "set_message", payload: data.message });
        } catch (err) {
            console.error("Error fetching message:", err);
        }
    };

    return {
        store,
        dispatch,
        login,
        logout,
        register,
        syncTokenFromStorage,
        getFavorites,
        addFavorite,
        removeFavorite,
        fetchMessage,
    };
};

export default useGlobalReducer;