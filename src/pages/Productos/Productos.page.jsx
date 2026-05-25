// src/pages/admin/Productos.page.jsx

import { Layout, Button, Typography, Modal, Spin, message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderComponent from "../../components/Header.component";
import MenuAdmin from "../../components/Menu_admin.componente"; 
import Logo from "../../assets/logos/logo.png";
import API_URL from "../../config/backend.js";

import { alertSuccess, alertError } from '../../utils/alerts.js';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// DATOS SIMULADOS PARA LOS SELECTS DEL MODAL (Mantenemos tamaños)
const mockTamanos = ["Chico", "Mediano", "Grande", "Jumbo", "600 ml", "1L", "1.5L"];

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

const ProductosPage = () => {
  const navigate = useNavigate();
  const isTablet = useResponsive();
  const headerHeight = isTablet ? 70 : 90;

  // Estados existentes
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // --- ESTADOS PARA BD ---
  const [catalogo, setCatalogo] = useState([]);
  const [insumosBD, setInsumosBD] = useState([]);

  // --- ESTADOS DE CONTROL DEL FORMULARIO DE NUEVO PRODUCTO ---
  const [nombreProductoSel, setNombreProductoSel] = useState(""); // <--- Estado correcto para el texto libre del Nombre
  const [tipoProducto, setTipoProducto] = useState("");
  const [tamanoSel, setTamanoSel] = useState(mockTamanos[0]);
  const [precio, setPrecio] = useState("");

  // Control de insumos agregados dinámicamente a la receta
  const [insumoSeleccionadoId, setInsumoSeleccionadoId] = useState("");
  const [cantidadInsumo, setCantidadInsumo] = useState("");
  const [recetaInsumos, setRecetaInsumos] = useState([]); 

  // Obtener todos los productos
  const getProductos = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/productos/`;
      const response = await axios.get(url);
      setProductos(response.data);
    } catch (error) {
      console.error("Error fetching productos:", error);
      message.error("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar Catálogo e Insumos desde el backend
  const cargarDatosFormulario = async () => {
    try {
      const [resCatalogo, resInsumos] = await Promise.all([
        axios.get(`${API_URL}/productos/catalogo/`),
        axios.get(`${API_URL}/productos/insumos/`)
      ]);

      setCatalogo(resCatalogo.data);
      setInsumosBD(resInsumos.data);

      // Inicializar valores por defecto si hay datos
      if (resCatalogo.data.length > 0) {
        setNombreProductoSel(resCatalogo.data[0].nombre);
        setTipoProducto(resCatalogo.data[0].descripcion); 
      }
      if (resInsumos.data.length > 0) {
        setInsumoSeleccionadoId(resInsumos.data[0].id_insumo);
      }
    } catch (error) {
      console.error("Error cargando datos auxiliares:", error);
      message.error("Error al cargar el catálogo o insumos");
    }
  };

  // Obtener producto por ID con detalles
  const verProducto = async (id) => {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const url = `${API_URL}/productos/${id}`;
      const response = await axios.get(url);
      setSelectedProducto(response.data);
    } catch (error) {
      console.error("Error fetching producto details:", error);
      message.error("Error al cargar los detalles del producto");
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    getProductos();
    cargarDatosFormulario();
  }, []);

  // --- MANEJADORES DE EVENTOS ---

  // Maneja el cambio del campo Nombre (Escribir o Seleccionar del datalist)
  const handleCatalogoChange = (e) => {
    const valorTexto = e.target.value;
    setNombreProductoSel(valorTexto);

    // Si coincide con algo del catálogo, autocompleta el tipo con la descripción
    const itemEncontrado = catalogo.find(item => item.nombre.toLowerCase() === valorTexto.toLowerCase());
    if (itemEncontrado) {
      setTipoProducto(itemEncontrado.descripcion); 
    }
  };

  // Agrega un insumo de la interfaz a la lista local de la receta
  const handleAgregarInsumo = () => {
    if (!cantidadInsumo || parseFloat(cantidadInsumo) <= 0) {
      message.warning("Por favor introduce una cantidad válida");
      return;
    }

    const insumoExisteEnLista = recetaInsumos.some(item => item.id_insumo === parseInt(insumoSeleccionadoId));
    if (insumoExisteEnLista) {
      message.warning("Este insumo ya ha sido agregado a la receta");
      return;
    }

    const insumoEncontrado = insumosBD.find(item => item.id_insumo === parseInt(insumoSeleccionadoId));
    if (insumoEncontrado) {
      const nuevoInsumoReceta = {
        id_insumo: insumoEncontrado.id_insumo,
        nombre: insumoEncontrado.nombre,
        cantidad: parseFloat(cantidadInsumo),
        unidad: insumoEncontrado.unidad
      };

      setRecetaInsumos([...recetaInsumos, nuevoInsumoReceta]);
      setCantidadInsumo(""); 
    }
  };

  // Elimina un insumo de la lista local de la receta
  const handleEliminarInsumo = (idInsumo) => {
    setRecetaInsumos(recetaInsumos.filter(item => item.id_insumo !== idInsumo));
  };

  // Enviar el nuevo producto terminado al backend
// Enviar el nuevo producto terminado al backend
  const handleGuardarProducto = async () => {
    // 1. Validaciones básicas en el cliente
    if (!nombreProductoSel.trim() || !tipoProducto.trim() || !precio) {
      message.error("Por favor completa todos los campos y añade al menos un insumo.");
      return;
    }

    // 2. Determinar si el elemento ya existe en la base de datos o si es texto libre
    const itemExistente = catalogo.find(
      (item) => item.nombre.toLowerCase() === nombreProductoSel.toLowerCase().trim()
    );

    // 3. Estructurar el JSON exactamente como lo pide tu controlador en el Backend
    const payload = {
      catalogo: {
        esNuevo: !itemExistente, // true si es texto libre, false si coincide con el catálogo
        id_catalogo: itemExistente ? itemExistente.id_catalogo : null,
        nombre: nombreProductoSel.trim(),
        descripcion: tipoProducto.trim() // Tu back usa 'descripcion' como el tipo
      },
      producto: {
        tamano: tamanoSel,
        precio: parseFloat(precio)
      },
      receta: recetaInsumos.map((ins) => ({
        id_insumo: parseInt(ins.id_insumo),
        cantidad: parseFloat(ins.cantidad)
      }))
    };

    // 4. Envío de datos con Try-Catch y tu alerta personalizada
    try {
      setLoading(true);
      
      // Enviamos el payload estructurado mediante POST
      await axios.post(`${API_URL}/productos/`, payload);
      
      // Desplegamos el alert que me solicitaste
      alertSuccess("Datos guardados correctamente");
      
      // Cerrar modal y limpiar el formulario para la próxima entrada
      setIsModalOpen(false);
      setNombreProductoSel("");
      setTipoProducto("");
      setPrecio("");
      setRecetaInsumos([]);
      
      // Recargar la lista principal de productos de la pantalla
      getProductos(); 
      
    } catch (error) {
      console.error("Error al guardar producto:", error);
      // Extraemos el mensaje de error específico que mandó el Back si existe
      const mensajeError = error.response?.data?.error || "No se pudo guardar el producto";
      message.error(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const getUnidadInsumoActual = () => {
    const insumo = insumosBD.find(item => item.id_insumo === parseInt(insumoSeleccionadoId));
    return insumo ? insumo.unidad : "g";
  };

  return (
    <Layout style={{ minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      
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
                marginBottom: "70px",
              }}
            >
              <Title level={2} style={{ margin: 25, color: "#313131", fontWeight: 700, fontSize: "39px" }}>
                Lista de productos
              </Title>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#444B42",
                  color: "#97C56A", 
                  borderRadius: "14px",
                  border: "3px solid #97C56A",
                  height: "50px",
                  width: "250px",
                  fontWeight: "bold",
                  fontSize: "19px",
                  padding: "0 24px",
                }}
                onClick={() => setIsModalOpen(true)}
              >
                Nuevo producto
              </Button>
            </div>

            {/* Contenedor de la lista */}
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
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                  <Spin size="large" />
                </div>
              ) : productos.length > 0 ? (
                productos.map((producto) => (
                  <div
                    key={producto.id_producto}
                    onClick={() => verProducto(producto.id_producto)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#FFFFFF",
                      border: "4px solid #97C56A", 
                      borderRadius: "16px", 
                      padding: "16px 24px",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <Text style={{ flex: 1.5, fontWeight: 500, fontSize: "24px" }}>
                      {producto.nombre}
                    </Text>
                    
                    <div style={{ height: "24px", width: "1px", backgroundColor: "#D1D5CB", margin: "0 16px" }} />
                    
                    <Text style={{ flex: 1, textAlign: "center", fontSize: "20px" }}>
                      {producto.tamano}
                    </Text>
                    
                    <div style={{ height: "24px", width: "1px", backgroundColor: "#D1D5CB", margin: "0 16px" }} />
                    
                    <Text style={{ flex: 1, textAlign: "center", fontSize: "20px" }}>
                      {producto.tipo}
                    </Text>
                    
                    <div style={{ height: "24px", width: "1px", backgroundColor: "#D1D5CB", margin: "0 8px" }} />
                    
                    <Text style={{ flex: 1.2, textAlign: "center", fontSize: "20px" }}>
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

      {/* MODAL DE DETALLE DEL PRODUCTO */}
      <Modal
        title="Detalles del Producto"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Cerrar
          </Button>
        ]}
        width={700}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : selectedProducto && selectedProducto.length > 0 ? (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ color: "#F1A139", marginBottom: "16px" }}>Información General</h3>
              <p><strong>Producto:</strong> {selectedProducto[0].producto}</p>
              <p><strong>Tipo:</strong> {selectedProducto[0].tipo}</p>
              <p><strong>Tamaño:</strong> {selectedProducto[0].tamano}</p>
              <p><strong>Precio:</strong> ${selectedProducto[0].precio}</p>
            </div>

            <div>
              <h3 style={{ color: "#F1A139", marginBottom: "16px" }}>Ingredientes / Insumos</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>Insumo</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>Cantidad</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducto.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>{item.insumo}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>{item.cantidad}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>{item.unidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Text>No se encontraron detalles para este producto</Text>
          </div>
        )}
      </Modal>

      {/* ==========================================
          MODAL CUSTOM
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
          zIndex: 2000 
        }}>
          <div style={{
            backgroundColor: '#383838', 
            width: '550px',
            borderRadius: '12px',
            padding: '24px 32px',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            
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

            <h2 style={{ color: '#F1A139', margin: '0 0 24px 0', fontSize: '20px', fontWeight: 'bold' }}>
              Nuevo producto
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 30px' }}>
              
              {/* Nombre (ESCRIBIR O SELECCIONAR CON DATALIST) */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nombre</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden' }}>
                  <input 
                    type="text"
                    list="opciones-catalogo"
                    value={nombreProductoSel} 
                    onChange={handleCatalogoChange} 
                    placeholder="Escribe o selecciona..."
                    style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555', cursor: 'text' }}
                  />
                  <datalist id="opciones-catalogo">
                    {catalogo.map((item) => (
                      <option key={item.id_catalogo} value={item.nombre} />
                    ))}
                  </datalist>
                  <div style={{ width: '32px', backgroundColor: '#D4D4D4', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontWeight: 'bold', borderLeft: '1px solid #C4C4C4', pointerEvents: 'none' }}>V</div>
                </div>
              </div>

              {/* Tipo de producto */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Tipo de producto</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden' }}>
                  <input 
                    type="text" 
                    list="opciones-tipo"
                    value={tipoProducto} 
                    onChange={(e) => setTipoProducto(e.target.value)} 
                    placeholder="Escribe o selecciona..."
                    style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555' }} 
                  />
                  <datalist id="opciones-tipo">
                    {/* Genera opciones únicas basados en las descripciones que vienen del catálogo de la BD */}
                    {[...new Set(catalogo.map(item => item.descripcion))].filter(Boolean).map((desc, idx) => (
                      <option key={idx} value={desc} />
                    ))}
                  </datalist>
                  <div style={{ width: '32px', backgroundColor: '#D4D4D4', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontWeight: 'bold', borderLeft: '1px solid #C4C4C4', pointerEvents: 'none' }}>V</div>
                </div>
              </div>

              {/* Tamaño */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Tamaño</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden' }}>
                  <select 
                    value={tamanoSel} 
                    onChange={(e) => setTamanoSel(e.target.value)}
                    style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555', cursor: 'pointer', appearance: 'none' }}
                  >
                    {mockTamanos.map((tamano, idx) => (
                      <option key={idx} value={tamano}>{tamano}</option>
                    ))}
                  </select>
                  <div style={{ width: '32px', backgroundColor: '#D4D4D4', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontWeight: 'bold', borderLeft: '1px solid #C4C4C4', pointerEvents: 'none' }}>V</div>
                </div>
              </div>

              {/* Precio */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Precio</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', paddingLeft: '10px', alignItems: 'center' }}>
                  <span style={{ color: '#888' }}>$</span>
                  <input 
                    type="number" 
                    value={precio} 
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="175" 
                    style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 8px', outline: 'none', color: '#555' }} 
                  />
                </div>
              </div>
            </div>

            <hr style={{ borderColor: '#555', borderStyle: 'solid', borderWidth: '1px 0 0 0', margin: '24px 0' }} />

            {/* Receta */}
            <div>
              <label style={{ color: '#fff', display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>Receta:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* Ingrediente */}
                <div>
                  <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Ingrediente</label>
                  <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden' }}>
                    <select 
                      value={insumoSeleccionadoId} 
                      onChange={(e) => setInsumoSeleccionadoId(e.target.value)}
                      style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555', cursor: 'pointer', appearance: 'none' }}
                    >
                      {insumosBD.map((insumo) => (
                        <option key={insumo.id_insumo} value={insumo.id_insumo}>{insumo.nombre}</option>
                      ))}
                    </select>
                    <div style={{ width: '32px', backgroundColor: '#D4D4D4', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontWeight: 'bold', borderLeft: '1px solid #C4C4C4', pointerEvents: 'none' }}>V</div>
                  </div>
                </div>

                {/* Cantidad */}
                <div>
                  <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Cantidad</label>
                  <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', borderRadius: '4px', overflow: 'hidden' }}>
                    <input 
                      type="number" 
                      value={cantidadInsumo} 
                      onChange={(e) => setCantidadInsumo(e.target.value)}
                      placeholder="550" 
                      style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555' }} 
                    />
                    <span style={{ padding: '0 12px', display: 'flex', alignItems: 'center', color: '#888' }}>
                      {getUnidadInsumoActual()}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAgregarInsumo}
                style={{ 
                  marginTop: '16px', 
                  backgroundColor: '#545753', 
                  color: '#97C56A', 
                  border: 'none', 
                  borderRadius: '16px', 
                  padding: '6px 16px', 
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Añadir insumo
              </button>
            </div>

            {/* Lista de Ingredientes agregados dinámicamente */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '10px', fontSize: '13px' }}>Ingredientes</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {recetaInsumos.map((insumoItem) => (
                  <div 
                    key={insumoItem.id_insumo} 
                    style={{ backgroundColor: '#E6E6E6', borderRadius: '12px', padding: '4px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}
                  >
                    {insumoItem.nombre} ({insumoItem.cantidad} {insumoItem.unidad})
                    <span 
                      onClick={() => handleEliminarInsumo(insumoItem.id_insumo)}
                      style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '10px', color: '#E73F3F' }}
                    >
                      X
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón Guardar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button 
                onClick={handleGuardarProducto}
                style={{ 
                  backgroundColor: '#545753', 
                  color: '#F1A139', 
                  border: 'none', 
                  borderRadius: '20px', 
                  padding: '8px 24px', 
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS globales */}
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