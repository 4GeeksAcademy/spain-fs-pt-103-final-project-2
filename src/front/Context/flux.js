const getState = ({ getStore, getActions, setStore }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    return {
        store: {
            user: null,
            token: null,
            message: null,
            favorites: []
        },
        actions: {
            login: async (email, password) => {
                try {
                    const res = await fetch(`${backendUrl}/api/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password })
                    });

                    if (!res.ok) throw new Error("Credenciales inválidas");

                    const data = await res.json();

                    setStore({ user: data.user, token: data.token });
                    localStorage.setItem("token", data.token);
                    return true;
                } catch (err) {
                    console.error("Error al iniciar sesión:", err);
                    return false;
                }
            },

            logout: () => {
                localStorage.removeItem("token");
                setStore({ user: null, token: null, favorites: [] });
            },

            syncTokenFromStorage: () => {
                const token = localStorage.getItem("token");
                if (token) {
                    setStore({ token });
                }
            },

            getFavorites: async () => {
                const { token } = getStore();
                try {
                    const res = await fetch(`${backendUrl}/api/favorites`, {
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    });
                    if (!res.ok) throw new Error("No se pudieron cargar favoritos");

                    const data = await res.json();
                    setStore({ favorites: data });
                } catch (err) {
                    console.error("Error al cargar favoritos:", err);
                }
            },

            addFavorite: async (recipeId) => {
                const { token } = getStore();
                try {
                    const res = await fetch(`${backendUrl}/api/favorites`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + token
                        },
                        body: JSON.stringify({ recipe_id: recipeId })
                    });

                    if (!res.ok) throw new Error("No se pudo agregar favorito");

                    getActions().getFavorites();
                } catch (err) {
                    console.error("Error al agregar favorito:", err);
                }
            },

            removeFavorite: async (recipeId) => {
                const { token } = getStore();
                try {
                    const res = await fetch(`${backendUrl}/api/favorites/${recipeId}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: "Bearer " + token
                        }
                    });

                    if (!res.ok) throw new Error("No se pudo eliminar favorito");

                    getActions().getFavorites();
                } catch (err) {
                    console.error("Error al eliminar favorito:", err);
                }
            }
        }
    };
};

export default getState;
