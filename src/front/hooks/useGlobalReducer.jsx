
import { API_URL } from "../config";

export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext);

    const fetchMessage = async () => {
        try {
            const res = await fetch(`${API_URL}/api/hello`);
            const data = await res.json();
            dispatch({ type: "set_hello", payload: data.message });
        } catch (err) {
            console.error("Error fetching message:", err);
        }
    };

    return { dispatch, store, fetchMessage };
}
