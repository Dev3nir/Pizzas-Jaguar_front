
import './index.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
//import 'katex/dist/katex.min.css';

const root = document.getElementById("root");

//pages
import Example from "./pages/Example.page.jsx";

import LoginPage from "./pages/Login.page.jsx";
import Menu from "./pages/Menu.jsx";

import ProductosPage from "./pages/Productos/Productos.page.jsx";
import InicioAdmin from "./pages/Admin/Inicio.admin.jsx";
import MenuAdmin from "./components/Menu_admin.componente.jsx";

import CocinaPage from "./pages/Cocina/Cocina.page.jsx"
import UsuariosPage from "./pages/Usuarios/Usuarios.page.jsx"

import MostradorPage from "./pages/Mostrador/Mostrador.page.jsx";
import SeleccionProducto from "./pages/Mostrador/SeleccionPage.jsx";
import ReportesPage from "./pages/Reportes/Reportes.page.jsx";
import PromocionesPage from "./pages/Promociones/Promociones.jsx"

import CajaPage from "./pages/Caja/Caja.page.jsx";
import GastosPage from "./pages/Gastos/Gastos.page.jsx"

import InventarioPage from "./pages/Inventario/Inventario.page.jsx"
ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
     {/*----------- ADMIN PAGES*/}
      {/*redirigir el base a /login*/}
      <Route path="/" element={<LoginPage />} />
      <Route path="/menu" element={<Menu />} />
      
      <Route path="/admin/productos" element={<ProductosPage />} />
      <Route path="/admin" element={<InicioAdmin />} />
      <Route path="/admin/usuarios" element={<UsuariosPage />} />
      
      <Route path="/admin/reportes" element={<ReportesPage />} />
      <Route path="/admin/inventario" element={<InventarioPage />} />
      <Route path="/admin/promociones" element={<PromocionesPage />} />
      <Route path="/admin/gastos" element={<GastosPage />} />

     {/*----------- MOSTRADOR PAGES*/}
      <Route path="/mostrador" element={<MostradorPage />} />
      <Route path="/mostrador/seleccion" element={<SeleccionProducto />} />
     {/*----------- COCINA PAGES*/}
     <Route path="/cocina" element={<CocinaPage />} />

     
    </Routes>
  </BrowserRouter>,
);
