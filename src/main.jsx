
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

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
     {/*----------- ADMIN PAGES*/}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/admin/productos" element={<ProductosPage />} />
      <Route path="/admin" element={<InicioAdmin />} />
      <Route path="/admin/usuarios" element={<UsuariosPage />} />
      

     {/*----------- MOSTRADOR PAGES*/}

     {/*----------- COCINA PAGES*/}
     <Route path="/cocina" element={<CocinaPage />} />

     
    </Routes>
  </BrowserRouter>,
);
