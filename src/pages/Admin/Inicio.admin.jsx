import API_URL from "../../config/backend.js";
import axios from "axios";
import { useEffect, useState } from "react";
import MenuAdmin from "../../components/Menu_admin.componente.jsx";
import HeaderComponent from "../../components/Header.component.jsx";
import Logo from "../../assets/logos/logo.png";

// Importaciones de Ant Design
import { Button } from "antd";
import { MoneyCollectOutlined, ShopOutlined, InboxOutlined } from "@ant-design/icons";

const InicioAdmin = () => {
    // Variables
    const [ventasHoy, setVentasHoy] = useState(0);
    const [ventasMes, setVentasMes] = useState(0);
    const [productovendido, setProductosAgotados] = useState("Cargando...");

    const fetchData = async () => {
        try {
            const url = `${API_URL}/mostrador/pedidos/estadisticas`;
            const res = await axios.get(url);
            const data = res.data;
            setVentasHoy(data.ventas_dia);
            setVentasMes(data.ventas_mes);
            setProductosAgotados(data.productos_vendidos);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const useResponsive = () => {
        const [isTablet, setIsTablet] = useState(false);

        useEffect(() => {
            const checkResponsive = () => {
                setIsTablet(window.innerWidth <= 1024 || window.innerHeight <= 700);
            };

            checkResponsive();
            window.addEventListener("resize", checkResponsive);

            return () => window.removeEventListener("resize", checkResponsive);
        }, []);

        return isTablet;
    };

    const isTablet = useResponsive();
    const headerHeight = isTablet ? 70 : 90;
    
    return (
        <div style={{
            display: "flex",
            flexDirection: "column", // Primero el Header, luego el resto
            width: "100vw",
            height: "100vh",
            backgroundColor: "#f9f9f6", // Fondo claro como en la imagen
        }}>
            <HeaderComponent
                text="ADMINISTRADOR" 
                logo={Logo}
                height={headerHeight}
                isTablet={isTablet}
            />
            
            {/* Contenedor inferior: Menú a la izquierda, Contenido a la derecha */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                
                {/* Menú Lateral */}
                <MenuAdmin />
                
                {/* Contenido Principal */}
                <div style={{ flex: 1, padding: "40px 60px", overflowY: "auto" }}>
                    
                    <h1 style={{ color: "#333", fontSize: "28px", fontWeight: "bold" }}>
                        Buenas tardes, Alex!
                    </h1>

                    {/* Botones Centrados */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "25px", margin: "60px 0" }}>
                        <Button 
                            size="large" 
                            style={{ 
                                borderRadius: "100px", 
                                borderColor: "#5A9BD5", 
                                color: "#5A9BD5", 
                                width: "300px", 
                                height: "100px",
                                fontWeight: "bold", 
                                fontSize: "24px",
                                marginRight: "25px"
                            }}
                        >
                            Abrir caja
                        </Button>
                        <Button 
                            size="large" 
                            style={{ 
                                borderRadius: "100px", 
                                borderColor: "#D0021B", 
                                color: "#D0021B", 
                                width: "300px", 
                                height: "100px",
                                fontWeight: "bold", 
                                fontSize: "24px"
                            }}
                        >
                            Cerrar caja
                        </Button>
                    </div>

                    {/* Título Resumen */}
                    <h2 style={{ fontSize: "22px", color: "#555", marginBottom: "20px" }}>Resumen</h2>

                    {/* Contenedor de Tarjetas (Cards) */}
                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                        
                        {/* Tarjeta 24h */}
                        <div style={cardStyle("#65D26E")}>
                            <MoneyCollectOutlined style={{ fontSize: "35px", marginBottom: "15px" }} />
                            <h2 style={{ fontSize: "36px", margin: "0", color: "#fff", fontWeight: "bold" }}>
                                ${ventasHoy}
                            </h2>
                            <p style={{ margin: "5px 0 0 0", fontSize: "16px" }}>Ventas en las últimas 24h</p>
                        </div>

                        {/* Tarjeta Mes */}
                        <div style={cardStyle("#52C4A5")}>
                            <ShopOutlined style={{ fontSize: "35px", marginBottom: "15px" }} />
                            <h2 style={{ fontSize: "36px", margin: "0", color: "#fff", fontWeight: "bold" }}>
                                ${ventasMes}
                            </h2>
                            <p style={{ margin: "5px 0 0 0", fontSize: "16px" }}>Ventas del mes</p>
                        </div>

                        {/* Tarjeta Producto */}
                        <div style={cardStyle("#5A9BD5")}>
                            <InboxOutlined style={{ fontSize: "35px", marginBottom: "15px" }} />
                            <h2 style={{ fontSize: "28px", margin: "0", color: "#fff", fontWeight: "bold", lineHeight: "1.2" }}>
                                {productovendido}
                            </h2>
                            <p style={{ margin: "10px 0 0 0", fontSize: "16px" }}>Producto más vendido</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// Estilo reutilizable para las tarjetas
const cardStyle = (bgColor) => ({
    backgroundColor: bgColor,
    color: "white",
    borderRadius: "16px",
    padding: "30px 20px",
    flex: "1",
    minWidth: "200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
});

export default InicioAdmin;