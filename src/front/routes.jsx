import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import { Navbar } from "./components/Navbar.jsx";
import ListaCompra from "./pages/ListaCompra.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import useGlobalReducer from "./hooks/useGlobalReducer";

// Componente de protección
const ProtectedRoute = ({ children }) => {
  const { store } = useGlobalReducer();
  return store.token ? children : <Navigate to="/login" />;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* RUTAS PROTEGIDAS */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ListaCompra"
        element={
          <ProtectedRoute>
            <ListaCompra />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;