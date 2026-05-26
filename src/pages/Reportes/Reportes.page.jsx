// src/pages/admin/Reportes.page.jsx
import { Layout, Button, Typography, Select, DatePicker, message, Spin } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import HeaderComponent from "../../components/Header.component";
import MenuAdmin from "../../components/Menu_admin.componente";
import ReporteGrafica from "./components/Pedidos.reporte.jsx";
import InventarioGrafico from "./components/Inventario.reporte.jsx";
import GastosGrafica from "./components/Gastos.reporte.jsx";
import VentasGrafica from "./components/Ventas.reporte.jsx";

import Logo from "../../assets/logos/logo.png";
import API_URL from "../../config/backend";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;

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

const ReportesPage = () => {
  const isTablet = useResponsive();
  const headerHeight = isTablet ? 70 : 90;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoReporte, setTipoReporte] = useState("pedidos");
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const obtenerTituloReporte = () => {
    switch (tipoReporte) {
      case "ventas": return "Reporte de Ventas";
      case "pedidos": return "Reporte de Pedidos";
      case "inventario": return "Reporte de Inventario";
      case "gastos": return "Reporte de Gastos";
      default: return "Reportes";
    }
  };

  const handleGenerarReporte = async () => {
    if (!fechasSeleccionadas || fechasSeleccionadas.length !== 2) {
      return message.warning("Por favor, selecciona una fecha de inicio y fin.");
    }

    const fechaInicio = fechasSeleccionadas[0].format("YYYY-MM-DD");
    const fechaFin = fechasSeleccionadas[1].format("YYYY-MM-DD");

    let endpoint = "";
    switch (tipoReporte) {
      case "ventas": endpoint = "/reportes/ventas/estadisticas"; break;
      case "pedidos": endpoint = "/reportes/pedidos/estadisticas"; break;
      case "inventario": endpoint = "/reportes/mermas/estadisticas"; break;
      case "gastos": endpoint = "/reportes/gastos-estadistico"; break;
      default: endpoint = "/reportes/pedidos/estadisticas";
    }

    try {
      setIsLoading(true);
      setIsModalOpen(false);

      const response = await axios.get(
        `${API_URL}${endpoint}?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
      );
      
      console.log(`Datos del reporte (${tipoReporte}):`, response.data);
      setReportData(response.data); 
      message.success("Reporte generado exitosamente");
      
    } catch (error) {
      console.error(error);
      message.error("Error al obtener los datos del reporte.");
      setReportData(exampleData); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      
      <Header
        style={{
          padding: 0, height: headerHeight, lineHeight: `${headerHeight}px`,
          backgroundColor: "#fff", position: "fixed", top: 0, left: 0,
          width: "100%", zIndex: 1000, boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        <HeaderComponent text="ADMINISTRADOR" logo={Logo} height={headerHeight} isTablet={isTablet} />
      </Header>

      <Layout>
        
        <Sider width={260} style={{ backgroundColor: "#535750", position: "fixed", left: 0, top: headerHeight, bottom: 0, overflow: "auto" }}>
          <MenuAdmin />
        </Sider>

        <Layout style={{ marginLeft: 260, marginTop: headerHeight, backgroundColor: "#FAFBFA" }}>
          <Content style={{ padding: "40px", minHeight: "calc(100vh - 90px)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <Title level={2} style={{ margin: '0 25px', color: "#313131", fontWeight: 700, fontSize: "39px" }}>
                {reportData ? obtenerTituloReporte() : "Reportes"}
              </Title>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#444b4200", color: "#596CAA", borderRadius: "14px", border: "3px solid #596CAA",
                  height: "50px", width: "250px", fontWeight: "bold", fontSize: "19px", padding: "0 24px",
                }}
                onClick={() => setIsModalOpen(true)}
              >
                Generar nuevo reporte
              </Button>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <Spin size="large" tip="Generando reporte..." />
              </div>
            ) : reportData && tipoReporte === "pedidos" ? (
              <ReporteGrafica data={reportData} />
            ) : reportData && tipoReporte === "inventario" ? (
              <InventarioGrafico data={reportData} />
            ) : reportData && tipoReporte === "gastos" ? (
              <GastosGrafica data={reportData} />
            ) : reportData && tipoReporte === "ventas" ? (
              <VentasGrafica data={reportData} />
            ) : (
              <div style={{ textAlign: "center", marginTop: "50px", color: "#888" }}>
                <h2>No hay ningún reporte generado aún.</h2>
                <p>Haz clic en "Generar nuevo reporte" para comenzar.</p>
              </div>
            )}

          </Content>
        </Layout>
      </Layout>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.70)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#353535', width: '420px', borderRadius: '8px',
            padding: '24px 32px 32px 32px', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}>
            
            <div onClick={() => setIsModalOpen(false)} style={{
              position: 'absolute', top: '12px', right: '18px', color: '#E73F3F',
              fontSize: '22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'sans-serif'
            }}>X</div>

            <h2 style={{ color: '#F1A139', margin: '0 0 28px 0', fontSize: '22px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
              Generar reporte operativo
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '15px' }}>Tipo de reporte</label>
                <Select
                  value={tipoReporte}
                  onChange={(value) => setTipoReporte(value)}
                  bordered={false}
                  getPopupContainer={(trigger) => trigger.parentNode} 
                  style={{ width: '100%', height: '38px', backgroundColor: '#d9d9d9', borderRadius: '0px' }}
                  options={[
                    { value: 'ventas', label: 'Reporte de ventas' },
                    { value: 'pedidos', label: 'Reporte de pedidos' },
                    { value: 'inventario', label: 'Reporte de inventario' }, 
                    { value: 'gastos', label: 'Reporte de gastos' },
                  ]}
                />
              </div>

              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '15px' }}>Periodo de tiempo</label>
                <RangePicker 
                  onChange={(dates) => setFechasSeleccionadas(dates)}
                  bordered={false}
                  getPopupContainer={(trigger) => trigger.parentNode} 
                  style={{ width: '100%', height: '38px', backgroundColor: '#d9d9d9', borderRadius: '0px' }} 
                  placeholder={['Fecha inicio', 'Fecha fin']}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
              <button 
                onClick={handleGenerarReporte}
                style={{ 
                  backgroundColor: '#545753', color: '#F1A139', border: 'none', borderRadius: '16px', 
                  padding: '8px 24px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer'
                }}
              >
                Generar
              </button>
            </div>

          </div>
        </div>
      )}

    </Layout>
  );
};

export default ReportesPage;