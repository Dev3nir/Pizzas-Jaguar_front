// src/components/Menu_admin.component.jsx

import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const MenuAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: "/admin/",
      label: "Inicio"
    },
    {
      key: "/admin/inventario",
      label: "Inventario"
    },
    {
      key: "/admin/productos",
      label: "Productos"
    },
    {
      key: "/admin/gastos",
      label: "Gastos"
    },
    {
      key: "/admin/promociones",
      label: "Promociones"
    },
    {
      key: "/admin/reportes",
      label: "Reportes"
    },
    {
      key: "/admin/usuarios",
      label: "Usuarios"
    }
  ];

  return (
    <div
      style={{
        height: "100%",
        backgroundColor: "#535750",
        paddingTop: "16px"
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
        style={{
          backgroundColor: "#535750",
          borderRight: "none",
          color: "#FFFFFF",
          fontSize: "22px",
          fontWeight: 800,
          width: "250px",
         
        }}
        theme="dark"
      />

      <style>
        {`
          .ant-menu-dark .ant-menu-item-selected {
            background-color: #FE3233 !important;
            color: white !important;
          }

          .ant-menu-dark .ant-menu-item:hover {
            background-color: #FE3233 !important;
            color: white !important;
          }

          .ant-menu-dark .ant-menu-item {
            margin-inline: 0px !important;
            width: calc(100% ) !important;
            border-radius: 0px;
            height: 50px !important;
            display: flex;
            align-items: center;
            padding-left: 20px !important;
            margin-bottom: 15px !important;
          }
        `}
      </style>
    </div>
  );
};

export default MenuAdmin;