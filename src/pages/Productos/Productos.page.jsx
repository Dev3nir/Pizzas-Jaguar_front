// src/pages/admin/Productos.page.jsx

import { Layout, Button, Typography } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderComponent from "../../components/Header.component";
import MenuAdmin from "../../components/Menu_admin.componente"; 
import Logo from "../../assets/logos/logo.png";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

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

// Arreglo vacío para simular que no hay datos registrados
const mockProductos = [
  { id: 1, nombre: "Pizza pepperoni", tamano: "Grande", tipo: "Pizza", precio: 100 },
  { id: 2, nombre: "Pizza hawaiana", tamano: "Grande", tipo: "Pizza", precio: 100 },
  { id: 3, nombre: "Pizza vita amore", tamano: "Grande", tipo: "Pizza", precio: 100 },
  { id: 4, nombre: "Coca Cola", tamano: "600 ml", tipo: "Bebida", precio: 100 },
];

// DATOS SIMULADOS PARA LOS SELECTS DEL MODAL
const mockNombres = ["Pizza pepperoni", "Pizza hawaiana", "Pizza vita amore", "Coca Cola", "Papas a la francesa"];
const mockTipos = ["Pizza", "Bebida", "Complemento", "Postre"];
const mockTamanos = ["Chico", "Mediano", "Grande", "Jumbo", "600 ml"];
const mockIngredientes = ["Pepperoni", "Salsa", "Queso", "Jamón", "Champiñones", "Piña"];

const ProductosPage = () => {
  const navigate = useNavigate();
  const isTablet = useResponsive();
  const headerHeight = isTablet ? 70 : 90;

  // ESTADO PARA CONTROLAR EL MODAL CUSTOM
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getProductos = () => {
    // Aquí iría la lógica para obtener los productos desde el backend
  };

  const addProducto = (producto) => {
    // Aquí iría la lógica para agregar un nuevo producto al backend
  };

  const verProducto = (id) => {
    //logica
  }
  
  useEffect(() => {
    getProductos();
  }, []);


  return (
    <Layout style={{ minHeight: "100vh" }}>
      
      {/* HEADER */}
      <Header
        style={{
          padding: 0,
          height: headerHeight,
          lineHeight: `${headerHeight}px`,
          backgroundColor: "#fff",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        <HeaderComponent
          text="ADMINISTRADOR" 
          logo={Logo}
          height={headerHeight}
          isTablet={isTablet}
        />
      </Header>

      <Layout>
        
        {/* MENU LATERAL */}
        <Sider
          width={260}
          style={{
            backgroundColor: "#535750",
            position: "fixed",
            left: 0,
            top: headerHeight,
            bottom: 0,
            overflow: "auto"
          }}
        >
          <MenuAdmin />
        </Sider>

        {/* CONTENIDO */}
        <Layout
          style={{
            marginLeft: 260,
            marginTop: headerHeight,
            backgroundColor: "#FAFBFA", 
          }}
        >
          <Content
            style={{
              padding: "40px",
              minHeight: "calc(100vh - 90px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Encabezado del contenido */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <Title level={2} style={{ margin: 0, color: "#313131", fontWeight: 700 }}>
                Lista de productos
              </Title>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#444B42",
                  color: "#97C56A", 
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "bold",
                  height: "40px",
                  padding: "0 24px",
                }}
                onClick={() => setIsModalOpen(true)} // ABRIR MODAL
              >
                Nuevo producto
              </Button>
            </div>

            {/* Contenedor de la lista o texto vacío */}
            <div
              className="scroll-container"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                overflowY: "auto",
                paddingRight: "10px", 
                maxHeight: "60vh",
                flex: 1 
              }}
            >
              {mockProductos.length > 0 ? (
                mockProductos.map((producto) => (
                  <div
                    key={producto.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#FFFFFF",
                      border: "2px solid #97C56A", 
                      borderRadius: "16px", 
                      padding: "16px 24px",
                    }}
                  >
                    <Text style={{ flex: 1.5, fontWeight: 500, fontSize: "16px" }}>
                      {producto.nombre}
                    </Text>
                    
                    <div style={{ height: "24px", width: "1px", backgroundColor: "#D1D5CB", margin: "0 16px" }} />
                    
                    <Text style={{ flex: 1, textAlign: "center", fontSize: "16px" }}>
                      {producto.tamano}
                    </Text>
                    
                    <div style={{ height: "24px", width: "1px", backgroundColor: "#D1D5CB", margin: "0 16px" }} />
                    
                    <Text style={{ flex: 1, textAlign: "center", fontSize: "16px" }}>
                      {producto.tipo}
                    </Text>
                    
                    <div style={{ height: "24px", width: "1px", backgroundColor: "#D1D5CB", margin: "0 16px" }} />
                    
                    <Text style={{ flex: 1.2, textAlign: "right", fontSize: "16px" }}>
                      Precio: ${producto.precio}
                    </Text>
                  </div>
                ))
              ) : (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "80px"
                }}>
                  <Text style={{ fontSize: "16px", fontWeight: 500, color: "#313131" }}>
                    No hay productos registrados en el sistema
                  </Text>
                </div>
              )}
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* ==========================================
          MODAL CUSTOM DESDE CERO
      ========================================== */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000 // Asegura que esté por encima del header
        }}>
          {/* Contenedor del Modal */}
          <div style={{
            backgroundColor: '#383838', // Color de fondo forzado
            width: '550px',
            borderRadius: '12px',
            padding: '24px 32px',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            
            {/* Botón Cerrar (X) */}
            <div 
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                color: '#E73F3F', 
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'sans-serif'
              }}
            >
              X
            </div>

            {/* Título */}
            <h2 style={{ color: '#F1A139', margin: '0 0 24px 0', fontSize: '20px', fontWeight: 'bold' }}>
              Nuevo producto
            </h2>

            {/* Grid Principal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 30px' }}>
              
              {/* Nombre (SELECT) */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nombre</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden' }}>
                  <select defaultValue="Pizza vita amore" style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555', cursor: 'pointer', appearance: 'none' }}>
                    {mockNombres.map((nombre, idx) => (
                      <option key={idx} value={nombre}>{nombre}</option>
                    ))}
                  </select>
                  <div style={{ width: '32px', backgroundColor: '#D4D4D4', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontWeight: 'bold', borderLeft: '1px solid #C4C4C4', pointerEvents: 'none' }}>V</div>
                </div>
              </div>

              {/* Tipo de producto (SELECT) */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Tipo de producto</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden' }}>
                  <select defaultValue="Pizza" style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555', cursor: 'pointer', appearance: 'none' }}>
                    {mockTipos.map((tipo, idx) => (
                      <option key={idx} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                  <div style={{ width: '32px', backgroundColor: '#D4D4D4', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontWeight: 'bold', borderLeft: '1px solid #C4C4C4', pointerEvents: 'none' }}>V</div>
                </div>
              </div>

              {/* Tamaño (SELECT) */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Tamaño</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden' }}>
                  <select defaultValue="Jumbo" style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555', cursor: 'pointer', appearance: 'none' }}>
                    {mockTamanos.map((tamano, idx) => (
                      <option key={idx} value={tamano}>{tamano}</option>
                    ))}
                  </select>
                  <div style={{ width: '32px', backgroundColor: '#D4D4D4', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontWeight: 'bold', borderLeft: '1px solid #C4C4C4', pointerEvents: 'none' }}>V</div>
                </div>
              </div>

              {/* Precio (INPUT DE TEXTO - Se mantiene igual porque es para números/dinero) */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Precio</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', paddingLeft: '10px', alignItems: 'center' }}>
                  <span style={{ color: '#888' }}>$</span>
                  <input type="number" defaultValue="175" style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 8px', outline: 'none', color: '#555' }} />
                </div>
              </div>
            </div>

            {/* Separador */}
            <hr style={{ borderColor: '#555', borderStyle: 'solid', borderWidth: '1px 0 0 0', margin: '24px 0' }} />

            {/* Receta */}
            <div>
              <label style={{ color: '#fff', display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>Receta:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* Ingrediente (SELECT) */}
                <div>
                  <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Ingrediente</label>
                  <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden' }}>
                    <select defaultValue="Pepperoni" style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555', cursor: 'pointer', appearance: 'none' }}>
                      {mockIngredientes.map((ingrediente, idx) => (
                        <option key={idx} value={ingrediente}>{ingrediente}</option>
                      ))}
                    </select>
                    <div style={{ width: '32px', backgroundColor: '#D4D4D4', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontWeight: 'bold', borderLeft: '1px solid #C4C4C4', pointerEvents: 'none' }}>V</div>
                  </div>
                </div>

                {/* Cantidad (INPUT DE TEXTO - Se mantiene igual) */}
                <div>
                  <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Cantidad</label>
                  <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', borderRadius: '4px', overflow: 'hidden' }}>
                    <input type="number" defaultValue="550" style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555' }} />
                    <span style={{ padding: '0 12px', display: 'flex', alignItems: 'center', color: '#888' }}>g</span>
                  </div>
                </div>
              </div>

              <button style={{ 
                marginTop: '16px', 
                backgroundColor: '#545753', 
                color: '#97C56A', 
                border: 'none', 
                borderRadius: '16px', 
                padding: '6px 16px', 
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                Añadir insumo
              </button>
            </div>

            {/* Lista de Ingredientes agregados */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '10px', fontSize: '13px' }}>Ingredientes</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ backgroundColor: '#E6E6E6', borderRadius: '12px', padding: '4px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                  Pepperoni <span style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '10px' }}>X</span>
                </div>
                <div style={{ backgroundColor: '#E6E6E6', borderRadius: '12px', padding: '4px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                  Salsa <span style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '10px' }}>X</span>
                </div>
              </div>
            </div>

            {/* Botón Guardar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button style={{ 
                backgroundColor: '#545753', 
                color: '#F1A139', 
                border: 'none', 
                borderRadius: '20px', 
                padding: '8px 24px', 
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS globales para la barra de scroll */}
      <style>{`
        .scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background-color: #A3A3A3;
          border-radius: 10px;
        }
      `}</style>
    </Layout>
  );
};

export default ProductosPage;