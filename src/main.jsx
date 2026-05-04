
import './index.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
//import 'katex/dist/katex.min.css';

const root = document.getElementById("root");

//pages
import Example from "./pages/Example.page.jsx";

import LoginPage from "./pages/Login.page.jsx";

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Example />} />
      <Route path="/login" element={<LoginPage />} />
     
    </Routes>
  </BrowserRouter>,
);
