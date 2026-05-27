// src/pages/Admin/Inicio.admin.jsx

import API_URL from "../../config/backend.js";
import axios from "axios";
import { useEffect, useState } from "react";
import MenuAdmin from "../../components/Menu_admin.componente.jsx";
import HeaderComponent from "../../components/Header.component.jsx";
import Logo from "../../assets/logos/logo.png";

// Importaciones de Ant Design
import { Button, message } from "antd"; 
import { MoneyCollectOutlined, ShopOutlined, InboxOutlined, DollarOutlined } from "@ant-design/icons";
import { flex, maxWidth, width } from "@mui/system";

import CajaModales from "../Caja/Caja.page.jsx";

const InicioAdmin = () => {
    // Variables
    const [ventasHoy, setVentasHoy] = useState(0);
    const [ventasMes, setVentasMes] = useState(0);
    const [productovendido, setProductosAgotados] = useState("Cargando...");
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    // ========================================================
    // ESTADOS PARA EL CONTROL DE LA CAJA
    // ========================================================
    const [loadingCaja, setLoadingCaja] = useState(false);
    const [cajaHoy, setCajaHoy] = useState(null); 
    const [estimado, setEstimado] = useState(null); 
    const [modalType, setModalType] = useState(null); 
    const [showSuccess, setShowSuccess] = useState(false);
    const [successData, setSuccessData] = useState({ title: "", text: "" });
    const [montoInput, setMontoInput] = useState("");
    //usseffect para si no hay token navigate a /
    useEffect(() => {
        if (!token) {
            window.location.href = "/";
        }
    }, [token]);
    // ======
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

    // ========================================================
    // >>>PETICIONES HTTP Y MANEJADORES DE CAJA
    // ========================================================
    const consultarEstadoCaja = async () => {
        try {
            const resCaja = await axios.get(`${API_URL}/caja/hoy`);
            setCajaHoy(resCaja.data);
            if (resCaja.data && resCaja.data.montoFinal === null) {
                const resEstimado = await axios.get(`${API_URL}/caja/monto-estimado`);
                setEstimado(resEstimado.data);
            }
        } catch (error) {
            console.error("Error al consultar estado de caja:", error);
        }
    };

    const intentarAbrir = () => {
        if (cajaHoy) {
            setModalType('info');
        } else {
            setMontoInput("");
            setModalType('abrir');
        }
    };

    const ejecutarApertura = async () => {
        if (!montoInput || parseFloat(montoInput) < 0) {
            message.warning("Por favor ingresa un monto inicial válido");
            return;
        }
        try {
            setLoadingCaja(true);
            await axios.post(`${API_URL}/caja/abrir`, { montoInicial: parseFloat(montoInput) },{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setModalType(null);
            setSuccessData({
                title: "¡Registro exitoso!",
                text: "La caja se ha inicializado correctamente"
            });
            setShowSuccess(true);
            consultarEstadoCaja();
        } catch (error) {
            message.error(error.response?.data?.error || "No se pudo abrir la caja");
        } finally {
            setLoadingCaja(false);
        }
    };

    const intentarCerrar = () => {
        if (!cajaHoy) {
            setModalType('error_cierre');
        } else if (cajaHoy.montoFinal !== null) {
            message.info("La caja de hoy ya está cerrada.");
        } else {
            setMontoInput(estimado?.montoEstimado || ""); 
            setModalType('cerrar');
        }
    };

    const ejecutarCierre = async () => {
        if (!montoInput || parseFloat(montoInput) < 0) {
            message.warning("Por favor ingresa el monto final real");
            return;
        }
        try {
            setLoadingCaja(true);
            await axios.put(`${API_URL}/caja/cerrar`, { montoFinal: parseFloat(montoInput) },{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setModalType(null);
            setSuccessData({
                title: "¡Registro exitoso!",
                text: "La caja se ha cerrado correctamente"
            });
            setShowSuccess(true);
            consultarEstadoCaja();
        } catch (error) {
            message.error(error.response?.data?.error || "No se pudo cerrar la caja");
        } finally {
            setLoadingCaja(false);
        }
    };
    // ========================================================
    useEffect(() => {
        fetchData();
        // ========================================================
        // MANDAR LLAMAR LA CONSULTA DE CAJA AL MONTAR
        // ========================================================
        consultarEstadoCaja();

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
            backgroundColor: "#f9f9f6",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                    
                    <h1 style={{ color: "#333", fontSize: "42px", fontWeight: "bold" }}>
                        Buenas tardes, Alex!
                    </h1>

                    {/* Botones Centrados */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "25px", margin: "60px 0" }}>
                        <Button 
                            size="large" 
                            onClick={intentarAbrir} // MODIFICACIÓN 6: Asignación del evento click
                            style={{ 
                                borderRadius: "100px", 
                                borderColor: "#5A9BD5", 
                                color: "#5A9BD5", 
                                width: "400px", 
                                height: "70px",
                                fontWeight: "bold", 
                                fontSize: "26px",
                                marginRight: "25px"
                            }}
                        >
                            Abrir caja
                        </Button>
                        <Button 
                            size="large" 
                            onClick={intentarCerrar} // Asignación del evento click
                            style={{ 
                                borderRadius: "100px", 
                                borderColor: "#D0021B", 
                                color: "#D0021B", 
                                width: "400px", 
                                height: "70px",
                                fontWeight: "bold", 
                                fontSize: "26px"
                            }}
                        >
                            Cerrar caja
                        </Button>
                    </div>

                    {/* Título Resumen */}
                    <h2 style={{ fontSize: "32px", color: "#717070", marginBottom: "30px" }}>Resumen</h2>

                    {/* Contenedor de Tarjetas (Cards) */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "80px", flexWrap: "wrap", width: "100%" }}>
                        
                        {/* Tarjeta 24h */}
                        <div style={cardStyle("#65D26E")}>
                            <DollarOutlined style={{ fontSize: "95px", marginBottom: "25px" }} />
                            <h2 style={{ fontSize: "36px", margin: "0", color: "#fff", fontWeight: "bold", marginBottom: "25px" }}>
                                ${ventasHoy}
                            </h2>
                            <p style={{ margin: "5px 0 0 0", fontSize: "23px", color: "#d2ffd5" }}>Ventas en las últimas 24h</p>
                        </div>

                        {/* Tarjeta Mes */}
                        <div style={cardStyle("#52C4A5")}>
                            <ShopOutlined style={{ fontSize: "95px", marginBottom: "25px" }} />
                            <h2 style={{ fontSize: "36px", margin: "0", color: "#fff", fontWeight: "bold", marginBottom: "25px" }}>
                                ${ventasMes}
                            </h2>
                            <p style={{ margin: "5px 0 0 0", fontSize: "23px", color: "#c1ffee" }}>Ventas del mes</p>
                        </div>

                        {/* Tarjeta Producto */}
                        <div style={cardStyle("#5A9BD5")}>
                            <InboxOutlined style={{ fontSize: "95px", marginBottom: "25px" }} />
                            <h2 style={{ fontSize: "28px", margin: "0", color: "#fff", fontWeight: "bold", lineHeight: "1.2", marginBottom: "25px" }}>
                                {productovendido}
                            </h2>
                            <p style={{ margin: "10px 0 0 0", fontSize: "23px", color: "#c2e3ff" }}>Producto más vendido</p>
                        </div>

                    </div>
                </div>
            </div>

            <CajaModales 
                modalType={modalType}
                setModalType={setModalType}
                cajaHoy={cajaHoy}
                estimado={estimado}
                montoInput={montoInput}
                setMontoInput={setMontoInput}
                ejecutarApertura={ejecutarApertura}
                ejecutarCierre={ejecutarCierre}
                loadingCaja={loadingCaja}
                showSuccess={showSuccess}
                setShowSuccess={setShowSuccess}
                successData={successData}
            />
        
        </div>
    );
};

// Estilo reutilizable para las tarjetas
const cardStyle = (bgColor) => ({
    backgroundColor: bgColor,
    color: "white",
    borderRadius: "40px",
    padding: "30px 20px",
    flex: "1",
    width: "240px",
    minWidth: "240px",
    maxWidth: "240px",
    height: "250px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
});

export default InicioAdmin;