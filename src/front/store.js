import { createContext } from "react";

export const StoreContext = createContext();

export const initialState = {
  user: null,
  token: null,
  message: null,
  favorites: [],
};

export default function reducer(state, action) {
  switch (action.type) {
    case "set_token":
      return { ...state, token: action.payload };
    case "set_user":
      return { ...state, user: action.payload };
    case "set_favorites":
      return { ...state, favorites: action.payload };
    case "set_message":
      return { ...state, message: action.payload };
    case "logout":
      return { ...state, token: null, user: null };
    default:
      return state;
  }
}