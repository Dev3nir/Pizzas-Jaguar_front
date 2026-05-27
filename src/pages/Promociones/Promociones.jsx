import {
  Layout,
  Typography,
  Spin,
  message,
  Button,
} from "antd";

import { useEffect, useState } from "react";
import axios from "axios";

import { EyeInvisibleOutlined, EyeOutlined, EditOutlined, RightOutlined } from "@ant-design/icons";
import { DatePicker } from "antd";

import HeaderComponent from "../../components/Header.component";
import MenuAdmin from "../../components/Menu_admin.componente";

import Logo from "../../assets/logos/logo.png";
import API_URL from "../../config/backend.js";

import {
  alertSuccess,
  alertError,
} from "../../utils/alerts.js";

// Importación o definición de rutas de imágenes para los 4 tipos de productos
import fotoPizza from "../../assets/image 2.png";
import fotoBoneless from "../../assets/boneless.png";
import fotoPapas from "../../assets/papas.png";
import fotoBebida from "../../assets/bebida.png";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Mapeo de imágenes solicitado
const IMAGENES_PROMO = {
  pizza: fotoPizza,
  boneless: fotoBoneless,
  papas: fotoPapas,
  bebida: fotoBebida,
};


// Helper para asignar la imagen correcta basándose en el nombre o tipo
const obtenerImagenPromo = (idProducto, productosLista) => {
  if (!idProducto || !productosLista) return IMAGENES_PROMO.pizza;
  
  const producto = productosLista.find(p => p.id_producto === parseInt(idProducto));
  if (!producto) return IMAGENES_PROMO.pizza;
  
  const nombreProducto = producto.tipo.toLowerCase();
  
  if (nombreProducto.includes("pizza")) return IMAGENES_PROMO.pizza;
  if (nombreProducto.includes("boneless") || nombreProducto.includes("alitas")) return IMAGENES_PROMO.boneless;
  if (nombreProducto.includes("papas")) return IMAGENES_PROMO.papas;
  if (nombreProducto.includes("bebida") || nombreProducto.includes("refresco")) return IMAGENES_PROMO.bebida;
  
  return IMAGENES_PROMO.pizza;
};

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

const Promociones = () => {
  const isTablet = useResponsive();
  const headerHeight = isTablet ? 70 : 90;


    // MODAL CONTROL
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [idPromocion, setIdPromocion] = useState(null);

    // PRODUCTOS DEL CATALOGO
    const [productos, setProductos] = useState([]);

    // CAMPOS DEL FORMULARIO
    const [nombre, setNombre] = useState("");
    const [idTipoDescuento, setIdTipoDescuento] = useState(1); // 1 = Porcentaje (Desc), 2 = Monto
    const [valor, setValor] = useState("");
    const [idProducto, setIdProducto] = useState(null);
    const [fechasVigencia, setFechasVigencia] = useState(null); // Guardará [fecha_inicio, fecha_fin]
    const [estadoPromo, setEstadoPromo] = useState(true); // Activo por defecto

  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
const [selectedPromo, setSelectedPromo] = useState(null);


const [token, setToken] = useState(localStorage.getItem("token") || null);
useEffect(() => {
        if (!token) {
            window.location.href = "/";
        }
    }, [token]);
  // =========================
  // OBTENER PROMOCIONES (Fetch)
  // =========================
  const getPromocionesData = async () => {
    try {
      setLoading(true);
      // Usamos el endpoint que trae promociones con su detalle/producto asociado
      const response = await axios.get(`${API_URL}/promociones/producto`);
      setPromociones(response.data);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar las promociones");
    } finally {
      setLoading(false);
    }
  };

  const abrirDetallePromo = (promo) => {
  setSelectedPromo(promo);
  setIsDetailModalOpen(true);
};

  // Cargar lista de productos para el Selector
const getProductosData = async () => {
  try {
    const response = await axios.get(`${API_URL}/productos`);
    setProductos(response.data);
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
};

useEffect(() => {
  getPromocionesData();
  getProductosData(); // Cargar productos al montar el componente
}, []);

// Limpiar el formulario al cerrar o abrir nuevo
const limpiarFormulario = () => {
  setNombre("");
  setIdTipoDescuento(1);
  setValor("");
  setIdProducto(null);
  setFechasVigencia(null);
  setEstadoPromo(true);
  setIsEdit(false);
  setIdPromocion(null);
};

// Configurar formulario para Editar
const abrirEditarPromo = (promo) => {
  setIsEdit(true);
  setIdPromocion(promo.id_promocion);
  setNombre(promo.nombre_promocion || promo.nombre);
  setIdTipoDescuento(promo.id_tipo_descuento || 1);
  setValor(promo.valor);
  
  if (promo.id_productos_aplicables && promo.id_productos_aplicables.length > 0) {
    setIdProducto(promo.id_productos_aplicables[0]);
  } else if (promo.id_producto_aplicable) {
    setIdProducto(promo.id_producto_aplicable);
  } else {
    setIdProducto(null);
  }

  // Setear fechas si vienen del backend usando dayj
  if (promo.fecha_inicio && promo.fecha_fin) {
    import("dayjs").then((dayjs) => {
      setFechasVigencia([dayjs.default(promo.fecha_inicio), dayjs.default(promo.fecha_fin)]);
    });
  } else {
    setFechasVigencia(null);
  }
  
  setEstadoPromo(promo.estado === true || promo.estado === 1);
  setIsModalOpen(true);
};

// Función para Guardar (POST / PUT)
const handleGuardarPromo = async () => {
  if (!nombre.trim() || !valor || !fechasVigencia || !idProducto) {
    message.warning("Completa todos los campos obligatorios");
    return;
  }

  // Formatear las fechas para SQL Server (YYYY-MM-DD)
  const fecha_inicio = fechasVigencia[0].format("YYYY-MM-DD");
  const fecha_fin = fechasVigencia[1].format("YYYY-MM-DD");

  const payload = {
    nombre,
    valor: parseFloat(valor),
    fecha_inicio,
    fecha_fin,
    estado: estadoPromo ? 1 : 0,
    id_tipo_descuento: parseInt(idTipoDescuento),
    id_producto: idProducto 
  };

  try {
    setLoading(true);

    if (isEdit) {
      await axios.put(`${API_URL}/promociones/${idPromocion}`, payload);
      alertSuccess("Promoción actualizada correctamente");
    } else {
      await axios.post(`${API_URL}/promociones`, payload);
      alertSuccess("Promoción agregada correctamente");
    }

    limpiarFormulario();
    setIsModalOpen(false);
    getPromocionesData(); // Recargar lista principal
  } catch (error) {
    console.error(error);
    const mensaje = error.response?.data?.message || "Error al guardar la promoción";
    alertError(mensaje);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    getPromocionesData();
  }, []);

  // =========================
  // DESACTIVAR / ALTERNAR ESTADO
  // =========================
  const handleAlternarEstado = async (id, estadoActual) => {
    try {
      if (estadoActual) {
        await axios.put(`${API_URL}/promociones/${id}/desactivar`);
        alertSuccess("Promoción desactivada correctamente");
      } else {
        await axios.put(`${API_URL}/promociones/${id}/activar`, { estado: true });
        alertSuccess("Promoción activada correctamente");
      }
      getPromocionesData();
    } catch (error) {
      console.error(error);
      alertError("Error al cambiar el estado de la promoción");
    }
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
      }}
    >
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
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
        {/* SIDEBAR */}
        <Sider
          width={260}
          style={{
            backgroundColor: "#535750", // Color gris del diseño base
            position: "fixed",
            left: 0,
            top: headerHeight,
            bottom: 0,
            overflow: "auto",
          }}
        >
          {/* El menú interno */}
          <MenuAdmin />
        </Sider>

        {/* CONTENIDO */}
        <Layout
          style={{
            marginLeft: 260,
            marginTop: headerHeight,
            backgroundColor: "#F9F9F4", 
          }}
        >
          <Content
            style={{
              padding: "50px 40px",
              minHeight: `calc(100vh - ${headerHeight}px)`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* HEADER DE CONTENIDO */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "150px",
              }}
            >
              <Title
                level={2}
                style={{
                  margin: 0,
                  color: "#2C2C2C",
                  fontWeight: 700,
                  fontSize: "36px",
                }}
              >
                Tus promociones
              </Title>

              <Button
                type="primary"
                onClick={() => {
                    limpiarFormulario();
                    setIsModalOpen(true);
                }}
                style={{
                  backgroundColor: "transparent",
                  color: "#E1251B",
                  borderRadius: "20px",
                  border: "2.5px solid #E1251B",
                  height: "45px",
                  padding: "0 30px",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                Nueva promoción
              </Button>
            </div>

            {/* CONTENEDOR DE CARDS CON SCROLL HORIZONTAL */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              {loading ? (
                <div style={{ margin: "100px auto" }}>
                  <Spin size="large" />
                </div>
              ) : promociones.length > 0 ? (
                <>
                  <div
                    className="cards-horizontal-scroll"
                    style={{
                      display: "flex",
                      gap: "24px",
                      overflowX: "auto",
                      paddingBottom: "15px",
                      width: "100%",
                      scrollBehavior: "smooth",
                    }}
                  >
                    {promociones.map((promo) => {
                      const idProducto = promo.id_productos_aplicables?.[0] || promo.id_producto_aplicable;
                      const imagenAMostrar = obtenerImagenPromo(idProducto, productos);
                      const estaInactiva = promo.estado === false || promo.estado === 0;

                      return (
                        <div
                          key={promo.id_promocion}
                          style={{
                            flex: "0 0 310px", 
                            backgroundColor: "#2C2C2C", 
                            borderRadius: "4px",
                            border: "4px solid #E1251B", 
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            position: "relative",
                            minHeight: "360px",
                            opacity: estaInactiva ? 0.5 : 1,
                            transition: "all 0.3s ease",
                          }}
                        >
                          {/* Botón superior derecho: Desactivar/Ocultar */}
                          <button
                            onClick={() => handleAlternarEstado(promo.id_promocion, promo.estado)}
                            style={{
                              position: "absolute",
                              top: "0px",
                              right: "0px",
                              background: "#404040",
                              border: "none",
                              borderRadius: "4px",
                              color: "#FFF",
                              padding: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title={estaInactiva ? "Activar" : "Desactivar"}
                          >
                            {estaInactiva ? <EyeOutlined style={{ fontSize: 26 }} /> : <EyeInvisibleOutlined style={{ fontSize: 26 }} />}
                          </button>

                          {/* Contenido Superior: Título */}
                          <div onClick={() => abrirDetallePromo(promo)} style={{ cursor: "pointer" }}>
                            <Text
                              style={{
                                color: "#FFFFFF",
                                fontSize: "20px",
                                fontWeight: "600",
                                display: "block",
                                marginBottom: "20px",
                              }}
                            >
                              {promo.nombre_promocion}
                            </Text>
                          </div>

                          {/* Centro: Imagen del Producto */}
                          <div
                            onClick={() => abrirDetallePromo(promo)}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              margin: "20px 0",
                              height: "190px",
                            }}
                          >
                            <img
                              src={imagenAMostrar}
                              alt={promo.nombre_promocion}
                              style={{
                                maxHeight: "100%",
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </div>

                          {/* Contenido Inferior: Detalles y Editar */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-end",
                              marginTop: "10px",
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <Text
                                style={{
                                  color: "#FFFFFF",
                                  fontSize: "18px",
                                  fontWeight: "bold",
                                }}
                              >
                                {promo.nombre_promocion.split(" ")[0]} {/* Ej: "Boneless" o "Pizza" */}
                              </Text>
                              <Text
                                style={{
                                  color: "#CCCCCC",
                                  fontSize: "18px",
                                }}
                              >
                                {promo.tipo_descuento === "Porcentaje" 
                                  ? `${parseFloat(promo.valor)}% de descuento`
                                  : promo.valor} 
                              </Text>
                            </div>

                            {/* Botón de Editar */}
                            <button
                              onClick={() => abrirEditarPromo(promo)}
                              style={{
                                position: "absolute",
                                bottom: "0px",
                                right: "0px",
                                background: "#404040",
                                border: "none",
                                borderRadius: "4px",
                                color: "#FFF",
                                padding: "6px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <EditOutlined style={{ fontSize: 26 }} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* flecha para scroll */}
                  <div
                    onClick={() => {
                      const container = document.querySelector(".cards-horizontal-scroll");
                      if (container) container.scrollLeft += 300;
                    }}
                    style={{
                      position: "absolute",
                      right: "-15px",
                      top: "calc(50% - 25px)",
                      width: "50px",
                      height: "50px",
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(5px)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      zIndex: 5,
                    }}
                  >
                    <RightOutlined style={{ fontSize: 24, color: "#1d1d1d" }} />
                  </div>
                </>
              ) : (
                <div style={{ margin: "80px auto", textAlign: "center" }}>
                  <Text style={{ color: "#777" }}>No hay promociones registradas</Text>
                </div>
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
        {/* MODAL NUEVO / EDITAR PROMOCIÓN */}
{isModalOpen && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
    }}
  >
    <div
      style={{
        backgroundColor: "#2E2E2E", 
        width: "600px",
        borderRadius: "14px",
        padding: "30px 35px",
        position: "relative",
        boxShadow: "0px 8px 24px rgba(0,0,0,0.3)"
      }}
    >
      {/* Botón Cerrar */}
      <div
        onClick={() => {
          limpiarFormulario();
          setIsModalOpen(false);
        }}
        style={{
          position: "absolute",
          top: "20px",
          right: "25px",
          color: "#E1251B",
          fontSize: "24px",
          fontWeight: "bold",
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        X
      </div>

      {/* Título */}
      <h2
        style={{
          color: "#F1A139",
          fontSize: "26px",
          fontWeight: "600",
          marginBottom: "28px",
        }}
      >
        {isEdit ? "Editar promoción" : "Crear promoción"}
      </h2>

      {/* Grid del Formulario */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
      >
        {/* Lado Izquierdo */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ color: "#FFF", display: "block", marginBottom: "8px", fontSize: "14px" }}>
              Nombre
            </label>
            <input
              type="text"
              placeholder="Promo amigos"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "#D9D9D9",
                border: "none",
                borderRadius: "8px",
                padding: "10px 12px",
                color: "#333",
                fontSize: "14px"
              }}
            />
          </div>

          <div>
            <label style={{ color: "#FFF", display: "block", marginBottom: "8px", fontSize: "14px" }}>
              Aplicar a (Producto)
            </label>
            <select
              value={idProducto || ""}
              onChange={(e) => setIdProducto(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "#D9D9D9",
                border: "none",
                borderRadius: "8px",
                padding: "10px 12px",
                color: "#333",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              <option value="" disabled hidden>Selecciona un producto</option>
              {productos.map((prod) => (
                <option key={prod.id_producto} value={prod.id_producto}>
                  {prod.nombre} ({prod.tamano}) - ${prod.precio}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lado Derecho */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Selector de Tipo Descuento */}
          <div>
            <label style={{ color: "#FFF", display: "block", marginBottom: "8px", fontSize: "14px" }}>
              Tipo de descuento
            </label>
            <div style={{ display: "flex", backgroundColor: "#555", borderRadius: "20px", padding: "3px", width: "fit-content" }}>
              <button
                type="button"
                onClick={() => setIdTipoDescuento(1)}
                style={{
                  backgroundColor: idTipoDescuento === 1 ? "#D9D9D9" : "transparent",
                  color: idTipoDescuento === 1 ? "#333" : "#FFF",
                  border: "none",
                  borderRadius: "18px",
                  padding: "5px 16px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Desc (%)
              </button>
              <button
                type="button"
                onClick={() => setIdTipoDescuento(2)}
                style={{
                  backgroundColor: idTipoDescuento === 2 ? "#E0E0E0" : "transparent",
                  color: idTipoDescuento === 2 ? "#333" : "#FFF",
                  border: "none",
                  borderRadius: "18px",
                  padding: "5px 16px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Monto ($)
              </button>
            </div>
          </div>

          {/* Valor del Descuento */}
          <div>
            <label style={{ color: "#FFF", display: "block", marginBottom: "8px", fontSize: "14px" }}>
              Valor ({idTipoDescuento === 1 ? "%" : "$"})
            </label>
            <input
              type="number"
              placeholder={idTipoDescuento === 1 ? "20" : "45"}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              style={{
                width: "90px",
                backgroundColor: "#D9D9D9",
                border: "none",
                borderRadius: "8px",
                padding: "10px 12px",
                color: "#333",
                fontSize: "14px",
                textAlign: "center"
              }}
            />
          </div>

          {/* Vigencia de promoción */}

          <div>
            <label style={{ color: "#FFF", display: "block", marginBottom: "8px", fontSize: "14px" }}>
              Vigencia de promoción
            </label>
            <DatePicker.RangePicker
              placeholder={["Inicio", "Fin"]}
              value={fechasVigencia}
              onChange={(values) => setFechasVigencia(values)}
              getPopupContainer={(trigger) => trigger.parentNode}
              style={{
                backgroundColor: "#D9D9D9",
                border: "none",
                borderRadius: "8px",
                padding: "10px 12px",
                width: "100%"
              }}
              allowClear={false}
            />
          </div>
        </div>
      </div>

      {/* Botón de Guardar */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "35px",
        }}
      >
        <button
          onClick={handleGuardarPromo}
          style={{
            backgroundColor: "#444B42", 
            color: "#F1A139", 
            border: "none",
            borderRadius: "20px",
            padding: "10px 32px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: "0px 2px 5px rgba(0,0,0,0.2)"
          }}
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
)}
{/* MODAL DE DETALLE (SOLO LECTURA) */}
{isDetailModalOpen && selectedPromo && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
    }}
  >
    <div
      style={{
        backgroundColor: "#2E2E2E",
        width: "500px",
        borderRadius: "14px",
        padding: "30px 35px",
        position: "relative",
        boxShadow: "0px 8px 24px rgba(0,0,0,0.3)"
      }}
    >
      {/* Botón Cerrar */}
      <div
        onClick={() => {
          setIsDetailModalOpen(false);
          setSelectedPromo(null);
        }}
        style={{
          position: "absolute",
          top: "20px",
          right: "25px",
          color: "#E1251B",
          fontSize: "24px",
          fontWeight: "bold",
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        X
      </div>

      {/* Título */}
      <h2
        style={{
          color: "#F1A139",
          fontSize: "26px",
          fontWeight: "600",
          marginBottom: "28px",
          textAlign: "center"
        }}
      >
        Detalle de Promoción
      </h2>

      {/* Contenido del detalle */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Imagen */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          <img
            src={obtenerImagenPromo(
              selectedPromo.id_productos_aplicables?.[0] || selectedPromo.id_producto_aplicable,
              productos
            )}
            alt={selectedPromo.nombre_promocion}
            style={{
              width: "150px",
              height: "150px",
              objectFit: "contain",
              backgroundColor: "#D9D9D9",
              borderRadius: "10px",
              padding: "10px"
            }}
          />
        </div>

        {/* Nombre */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #555", paddingBottom: "10px" }}>
          <Text style={{ color: "#F1A139", fontSize: "16px", fontWeight: "bold" }}>Nombre:</Text>
          <Text style={{ color: "#FFF", fontSize: "16px" }}>{selectedPromo.nombre_promocion}</Text>
        </div>

        {/* Producto aplicable */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #555", paddingBottom: "10px" }}>
          <Text style={{ color: "#F1A139", fontSize: "16px", fontWeight: "bold" }}>Producto:</Text>
          <Text style={{ color: "#FFF", fontSize: "16px" }}>
            {productos.find(p => p.id_producto === (selectedPromo.id_productos_aplicables?.[0] || selectedPromo.id_producto_aplicable))?.nombre || "N/A"}
          </Text>
        </div>

        {/* Tipo de descuento */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #555", paddingBottom: "10px" }}>
          <Text style={{ color: "#F1A139", fontSize: "16px", fontWeight: "bold" }}>Tipo de descuento:</Text>
          <Text style={{ color: "#FFF", fontSize: "16px" }}>{selectedPromo.tipo_descuento}</Text>
        </div>

        {/* Valor */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #555", paddingBottom: "10px" }}>
          <Text style={{ color: "#F1A139", fontSize: "16px", fontWeight: "bold" }}>Valor:</Text>
          <Text style={{ color: "#FFF", fontSize: "16px" }}>
            {selectedPromo.tipo_descuento === "Porcentaje" 
              ? `${selectedPromo.valor}%` 
              : `$${selectedPromo.valor}`}
          </Text>
        </div>

        {/* Vigencia */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #555", paddingBottom: "10px" }}>
          <Text style={{ color: "#F1A139", fontSize: "16px", fontWeight: "bold" }}>Vigencia:</Text>
          <Text style={{ color: "#FFF", fontSize: "16px" }}>
            {new Date(selectedPromo.fecha_inicio).toLocaleDateString()} - {new Date(selectedPromo.fecha_fin).toLocaleDateString()}
          </Text>
        </div>

        {/* Estado */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #555", paddingBottom: "10px" }}>
          <Text style={{ color: "#F1A139", fontSize: "16px", fontWeight: "bold" }}>Estado:</Text>
          <Text style={{ color: selectedPromo.estado === 1 || selectedPromo.estado === true ? "#4CAF50" : "#E1251B", fontSize: "16px", fontWeight: "bold" }}>
            {selectedPromo.estado === 1 || selectedPromo.estado === true ? "Activo" : "Inactivo"}
          </Text>
        </div>
      </div>

      {/* Botón Cerrar */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "35px" }}>
        <button
          onClick={() => {
            setIsDetailModalOpen(false);
            setSelectedPromo(null);
          }}
          style={{
            backgroundColor: "#E1251B",
            color: "#FFF",
            border: "none",
            borderRadius: "20px",
            padding: "10px 32px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer"
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}
    </Layout>

  );
};

export default Promociones;