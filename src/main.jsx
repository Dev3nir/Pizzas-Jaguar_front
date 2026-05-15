
import './index.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
//import 'katex/dist/katex.min.css';

const root = document.getElementById("root");

//pages
import Example from "./pages/Example.page.jsx";

import LoginPage from "./pages/Login.page.jsx";
import Menu from "./pages/Menu.jsx";


ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
     
      <Route path="/login" element={<LoginPage />} />
      <Route path="/menu" element={<Menu />} />
     
    </Routes>
  </BrowserRouter>,
);
