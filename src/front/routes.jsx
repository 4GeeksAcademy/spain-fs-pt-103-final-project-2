import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import { Login } from "./pages/Login.jsx";
import { Navbar } from "./components/Navbar.jsx";
import ListaCompra from "./pages/ListaCompra.jsx";
import Dashboard from "./pages/Dashboard.jsx";

const AppRoutes = () => (
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<Login />} />
      <Route path="/ListaCompra" element={<ListaCompra />} />      
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;