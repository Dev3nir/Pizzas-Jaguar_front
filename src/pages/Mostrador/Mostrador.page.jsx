import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Input,
  Select,
  Spin,
  ConfigProvider,
  Popover,
  Slider,
  message,
  Tag
} from "antd";
import { io } from "socket.io-client";
import { 
  BellOutlined, 
  ClockCircleOutlined, 
  EditOutlined, 
  CloseOutlined, 
  CreditCardOutlined
} from "@ant-design/icons";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import API_URL from "../../config/backend.js";
import HeaderMostrador from "../../components/Header.mostrador.component.jsx";
import Logo from "../../assets/logos/logo.png";
import { useNavigate, useLocation } from "react-router-dom"; 
import WEBSOCKET_URL from "../../config/websockets.js";
import Swal from "sweetalert2"; 
import pizzaPedido from "./assets/pizzPedido.png"; 
import imagenPizza from "./assets/pizzahd.png";

const { Option } = Select;
const socket = io(WEBSOCKET_URL);

// --- CONSTANTES ---
const TIPOS_PEDIDO = [
  { label: "Mostrador", id_tipo: 1 },
  { label: "Domicilio", id_tipo: 2 },
  { label: "Rappi", id_tipo: 3 },
  { label: "Salón", id_tipo: 4 },
];

// --- PALETA DE COLORES DINÁMICA ---
const COLOR_PALETTE = [
  { left: "#E53935", right: "#C62828" }, // Rojo
  { left: "#5FB666", right: "#4A9351" }, // Verde
  { left: "#6682A6", right: "#415C82" }, // Azul grisáceo
  { left: "#FFB300", right: "#FF8F00" }, // Ámbar
  { left: "#8E24AA", right: "#6A1B9A" }, // Morado
];

// Asigna un color diferente basado en el ID del pedido
const getRowColors = (idPedido) => {
  const index = idPedido % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

const getButtonStyles = (estado, pagado) => {
  if (estado === "Finalizada") return { bg: "#FFB300", text: "#000", label: "Entregada" };
  if (pagado) return { bg: "#FFFFFF", text: "#888", label: "Pagada" };
  return { bg: "#00E676", text: "#000", label: "Pagar" };
};

// --- ANIMATION VARIANTS ---
const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

const fadeSlideVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

// ============================================================
// COMPONENTE MODAL PARA EDITAR PEDIDO (VERSIÓN DIV PERSONALIZADO)
// ============================================================
const EditarPedidoModal = ({ visible, pedido, onClose, onSuccess, fetchPedidos }) => {
  const [productosAPI, setProductosAPI] = useState([]);
  const [insumosAPI, setInsumosAPI] = useState([]);
  const [promocionesAPI, setPromocionesAPI] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [procesando, setProcesando] = useState(false);
  
  // Estados para nuevo producto
  const [tipoProducto, setTipoProducto] = useState("Pizza");
  const [tamano, setTamano] = useState("Grande");
  const [esMitades, setEsMitades] = useState(false);
  const [orillaQueso, setOrillaQueso] = useState(false);
  const [pizzaCompletaId, setPizzaCompletaId] = useState(null);
  const [mitadIzquierdaId, setMitadIzquierdaId] = useState(null);
  const [mitadDerechaId, setMitadDerechaId] = useState(null);
  const [productoOtroNombre, setProductoOtroNombre] = useState(null);
  
  // Estados Extras
  const [extraInsumoId, setExtraInsumoId] = useState(null);
  const [extraCantidad, setExtraCantidad] = useState("");
  const [listaExtras, setListaExtras] = useState([]);
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cargar productos e insumos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProductos, resInsumos, resPromociones] = await Promise.all([
          axios.get(`${API_URL}/productos/`),
          axios.get(`${API_URL}/productos/insumos`),
          axios.get(`${API_URL}/promociones/producto`)
        ]);
        setProductosAPI(resProductos.data);
        setInsumosAPI(resInsumos.data);
        setPromocionesAPI(resPromociones.data);

        const extras = resInsumos.data.filter(i => i.extra === true);
        if (extras.length > 0) {
          setExtraInsumoId(extras[0].id_insumo);
        }
      } catch (error) {
        console.error("Error cargando catálogos:", error);
        message.error("Error al cargar productos e insumos");
      }
    };
    if (visible) fetchData();
  }, [visible]);

  // Cargar productos del pedido al carrito al abrir
  useEffect(() => {
    if (visible && pedido && pedido.productos) {
      const productosCarrito = pedido.productos.map((prod, idx) => ({
        idUnique: Date.now() + idx,
        id_producto: prod.id_producto,
        orilla_queso: prod.orilla_queso || false,
        tipoProducto: prod.nombre.includes("Pizza") ? "Pizza" : "Otro",
        cantidad: prod.cantidad,
        promociones: prod.promociones || [],
        mitades: prod.mitades || [],
        extras: prod.extras || [],
        nombreDisplay: prod.nombre,
        precioCalculado: prod.total_producto || prod.precio_calculado || 0,
        precioBase: prod.precio_base || 0,
        costoOrilla: prod.costo_orilla_total || 0,
        esMitades: prod.mitades && prod.mitades.length === 2,
        promocionAplicada: prod.promociones?.[0] || null,
        detallesExtras: prod.extras?.map(ext => ({
          nombre: ext.insumo_nombre,
          cantidad: ext.cantidad,
          costo_unitario: ext.costo_unitario,
          unidad: ext.unidad
        })) || []
      }));
      setCarrito(productosCarrito);
    }
  }, [visible, pedido]);

  const tiposUnicos = [...new Set(productosAPI.map(p => p.tipo))];
  const esPizza = tipoProducto === "Pizza" || tipoProducto?.toLowerCase() === "pizza";

  useEffect(() => {
    if (productosAPI.length === 0) return;
    if (esPizza) {
      const tamanosDisponibles = [...new Set(productosAPI.filter(p => p.tipo === tipoProducto).map(p => p.tamano))];
      if (tamanosDisponibles.length > 0) setTamano(tamanosDisponibles[0]);
    } else {
      const nombresUnicos = [...new Set(productosAPI.filter(p => p.tipo === tipoProducto).map(p => p.nombre))];
      if (nombresUnicos.length > 0) setProductoOtroNombre(nombresUnicos[0]);
    }
  }, [tipoProducto, productosAPI, esPizza]);

  useEffect(() => {
    if (!esPizza && productoOtroNombre) {
      const tamanosDisponibles = productosAPI
        .filter(p => p.tipo === tipoProducto && p.nombre === productoOtroNombre)
        .map(p => p.tamano);
      if (tamanosDisponibles.length > 0) setTamano(tamanosDisponibles[0]);
    }
  }, [productoOtroNombre, tipoProducto, esPizza, productosAPI]);

  useEffect(() => {
    if (esPizza) {
      const pizzasDelTamano = productosAPI.filter(p => p.tipo === tipoProducto && p.tamano === tamano);
      if (pizzasDelTamano.length > 0) {
        setPizzaCompletaId(pizzasDelTamano[0].id_producto);
        setMitadIzquierdaId(pizzasDelTamano[0].id_producto);
        setMitadDerechaId(pizzasDelTamano[0].id_producto);
      }
    }
  }, [tamano, esPizza, tipoProducto, productosAPI]);

  const opcionesPizzasFiltradas = productosAPI.filter(p => p.tipo === tipoProducto && p.tamano === tamano);
  const opcionesNombresOtro = [...new Set(productosAPI.filter(p => p.tipo === tipoProducto).map(p => p.nombre))];
  const opcionesTamanosActuales = esPizza
    ? [...new Set(productosAPI.filter(p => p.tipo === tipoProducto).map(p => p.tamano))]
    : [...new Set(productosAPI.filter(p => p.tipo === tipoProducto && p.nombre === productoOtroNombre).map(p => p.tamano))];
  const insumosExtras = insumosAPI.filter(i => i.extra === true);
  const insumoSeleccionado = insumosExtras.find(i => i.id_insumo === extraInsumoId);
  const unidadActual = insumoSeleccionado ? insumoSeleccionado.unidad : "";

  const obtenerPromocionAplicable = (idProducto, esMitadesProducto) => {
    if (esMitadesProducto) return null;
    const promocionAplicable = promocionesAPI.find(promo => {
      const estaActiva = promo.estado === true;
      const aplicaAlProducto = promo.id_productos_aplicables.some(id => Number(id) === Number(idProducto));
      let enVigencia = true;
      if (promo.fecha_inicio) {
        const fechaInicio = new Date(promo.fecha_inicio);
        if (new Date() < fechaInicio) enVigencia = false;
      }
      if (promo.fecha_fin) {
        const fechaFin = new Date(promo.fecha_fin);
        fechaFin.setHours(23, 59, 59, 999);
        if (new Date() > fechaFin) enVigencia = false;
      }
      return estaActiva && aplicaAlProducto && enVigencia;
    });
    return promocionAplicable || null;
  };

  const calcularDescuento = (precioBase, promocion) => {
    if (!promocion) return 0;
    if (promocion.tipo_descuento === "Porcentaje") return (precioBase * promocion.valor) / 100;
    if (promocion.tipo_descuento === "Monto") return Math.min(promocion.valor, precioBase);
    return 0;
  };

  const calcularPrecioFinal = (precioBase, promocion) => {
    const descuento = calcularDescuento(precioBase, promocion);
    return Math.max(precioBase - descuento, 0);
  };

  const handleRemoveCarrito = (idUnique) => setCarrito(carrito.filter(item => item.idUnique !== idUnique));
  const handleRemoveExtra = (idUnique) => setListaExtras(listaExtras.filter(item => item.idUnique !== idUnique));

  const handleAddExtra = () => {
    if (!extraInsumoId || !extraCantidad || parseFloat(extraCantidad) <= 0) {
      message.warning("Selecciona un insumo y una cantidad válida");
      return;
    }
    const insumoDb = insumosAPI.find(i => i.id_insumo === extraInsumoId);
    if (!insumoDb) return;
    
    const nuevoExtra = {
      idUnique: Date.now(),
      id_insumo: insumoDb.id_insumo,
      nombre: insumoDb.nombre,
      cantidadVista: extraCantidad,
      costo_unitario: insumoDb.costo_unitario,
      unidad: insumoDb.unidad
    };
    setListaExtras([...listaExtras, nuevoExtra]);
    setExtraCantidad("");
  };

  const handleAddProducto = () => {
    let costoOrilla = 0;
    if (esPizza && orillaQueso) {
      const insumoQueso = insumosAPI.find(i => Number(i.id_insumo) === 1);
      let precioQueso = 120; 
      let esKg = true;
      if (insumoQueso) {
        precioQueso = parseFloat(insumoQueso.costo_unitario) || 120;
        esKg = insumoQueso.unidad?.toLowerCase() === "kg";
      }
      costoOrilla = esKg ? (precioQueso / 1000) * 20 : (precioQueso * 20);
    }

    let nuevoProductoCarrito = {
      idUnique: Date.now(),
      id_producto: null,
      orilla_queso: false,
      tipoProducto: tipoProducto,
      cantidad: 1,
      promociones: [],
      mitades: [],
      extras: listaExtras.map(ex => ({
        id_insumo: ex.id_insumo,
        cantidad: parseFloat(ex.cantidadVista),
        medida: ex.unidad
      })),
      nombreDisplay: "",
      precioCalculado: 0,
      precioBase: 0,
      costoOrilla: costoOrilla,
      esMitades: false,
      promocionAplicada: null,
      detallesExtras: listaExtras.map(ex => ({
        nombre: ex.nombre,
        cantidad: ex.cantidadVista,
        costo_unitario: ex.costo_unitario,
        unidad: ex.unidad
      }))
    };

    if (esPizza) {
      if (esMitades) {
        if (!mitadIzquierdaId || !mitadDerechaId) return message.warning("Selecciona ambas mitades");
        const pizzaIzq = productosAPI.find(p => p.id_producto === mitadIzquierdaId);
        const pizzaDer = productosAPI.find(p => p.id_producto === mitadDerechaId);
        const precioMaximo = Math.max(pizzaIzq.precio, pizzaDer.precio);
        
        nuevoProductoCarrito.id_producto = pizzaIzq.id_producto;
        nuevoProductoCarrito.mitades = [{ id_producto: pizzaIzq.id_producto }, { id_producto: pizzaDer.id_producto }];
        nuevoProductoCarrito.orilla_queso = orillaQueso;
        nuevoProductoCarrito.nombreDisplay = `Pizza ${tamano} (${pizzaIzq.nombre.replace('Pizza ', '')} / ${pizzaDer.nombre.replace('Pizza ', '')}) ${orillaQueso ? 'c/Orilla' : ''}`;
        nuevoProductoCarrito.precioCalculado = precioMaximo + costoOrilla;
        nuevoProductoCarrito.precioBase = precioMaximo;
        nuevoProductoCarrito.esMitades = true;
      } else {
        if (!pizzaCompletaId) return message.warning("Selecciona una pizza");
        const pizza = productosAPI.find(p => p.id_producto === pizzaCompletaId);
        
        nuevoProductoCarrito.id_producto = pizza.id_producto;
        nuevoProductoCarrito.orilla_queso = orillaQueso;
        nuevoProductoCarrito.nombreDisplay = `${pizza.nombre} ${tamano} ${orillaQueso ? 'c/Orilla' : ''}`;
        nuevoProductoCarrito.precioBase = pizza.precio;

        const promocion = obtenerPromocionAplicable(pizza.id_producto, false);
        if (promocion) {
          const precioConDescuento = calcularPrecioFinal(pizza.precio, promocion);
          nuevoProductoCarrito.precioCalculado = precioConDescuento + costoOrilla; 
          nuevoProductoCarrito.promocionAplicada = promocion;
          nuevoProductoCarrito.promociones = [{ id_promocion: promocion.id_promocion }];
        } else {
          nuevoProductoCarrito.precioCalculado = pizza.precio + costoOrilla;
        }
      }
    } else {
      const otro = productosAPI.find(p => p.tipo === tipoProducto && p.nombre === productoOtroNombre && p.tamano === tamano);
      if (!otro) return message.warning("Selecciona un producto y tamaño válidos");
      
      nuevoProductoCarrito.id_producto = otro.id_producto;
      nuevoProductoCarrito.nombreDisplay = `${otro.nombre} ${otro.tamano}`;
      nuevoProductoCarrito.precioBase = otro.precio;

      const promocion = obtenerPromocionAplicable(otro.id_producto, false);
      if (promocion) {
        const precioConDescuento = calcularPrecioFinal(otro.precio, promocion);
        nuevoProductoCarrito.precioCalculado = precioConDescuento;
        nuevoProductoCarrito.promocionAplicada = promocion;
        nuevoProductoCarrito.promociones = [{ id_promocion: promocion.id_promocion }];
      } else {
        nuevoProductoCarrito.precioCalculado = otro.precio;
      }
    }

    if (listaExtras.length > 0) {
      nuevoProductoCarrito.nombreDisplay += ` (+${listaExtras.length} extras)`;
    }

    setCarrito([...carrito, nuevoProductoCarrito]);
    setListaExtras([]);
    setOrillaQueso(false);
  };

  const calcularSubtotal = () => {
    return carrito.reduce((acc, item) => {
      let totalItem = item.precioCalculado;
      if (item.detallesExtras && item.detallesExtras.length > 0) {
        totalItem += item.detallesExtras.reduce((sum, ext) => sum + (ext.costo_unitario * parseFloat(ext.cantidad)), 0);
      }
      return acc + totalItem;
    }, 0);
  };

  const subtotalBase = carrito.reduce((acc, item) => {
    let totalBaseItem = item.precioBase + (item.costoOrilla || 0);
    if (item.detallesExtras && item.detallesExtras.length > 0) {
      totalBaseItem += item.detallesExtras.reduce((sum, ext) => sum + (ext.costo_unitario * parseFloat(ext.cantidad)), 0);
    }
    return acc + totalBaseItem;
  }, 0);

  const total = calcularSubtotal();

  const handleMostrarResumen = () => {
    if (carrito.length === 0) return message.warning("El carrito está vacío");
    setMostrarResumen(true);
  };

  const handleGuardarCambios = () => {
    setProcesando(true);
    
    const productosLimpio = carrito.map(item => ({
      id_producto: item.id_producto,
      orilla_queso: item.orilla_queso || false,
      tipoProducto: item.tipoProducto,
      cantidad: item.cantidad,
      promociones: item.promociones,
      mitades: item.mitades,
      extras: item.extras 
    }));

    const payloadFinal = {
      id_usuario: 1,
      id_tipo_pedido: pedido?.tipo_pedido === "Mostrador" ? 1 : 2,
      detalle_cliente: { 
        nombre: pedido?.cliente_nombre, 
        telefono: pedido?.telefono || "", 
        direccion: pedido?.direccion || null 
      },
      productos: productosLimpio,
      total: total
    };

    axios.put(`${API_URL}/mostrador/pedidos/${pedido?.id_pedido}`, payloadFinal)
      .then(res => {
        Swal.fire({
          icon: 'success',
          title: '¡Pedido actualizado!',
          text: `El pedido ha sido modificado con éxito. Nuevo total: $${total}`,
          confirmButtonText: 'Aceptar'
        }).then(() => {
          onClose();
          fetchPedidos();
          if (onSuccess) onSuccess();
        });
      })
      .catch(error => {
        console.error("Error al actualizar el pedido:", error);
        Swal.fire({ 
          icon: 'error', 
          title: 'Error', 
          text: error.response?.data?.error || 'Hubo un problema al actualizar el pedido.' 
        });
      })
      .finally(() => setProcesando(false));
  };

  const cartItemVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.9 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
  };

  const fadeRightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Overlay oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              zIndex: 1002
            }}
          />
          
          {/* Contenedor centrado */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? "95vw" : "1200px",
              maxWidth: "95vw",
              maxHeight: "90vh",
              overflowY: "auto",
              zIndex: 1003
            }}
          >
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div style={{ backgroundColor: "#F9F9F6", borderRadius: "12px", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ backgroundColor: "#2E2E2E", padding: "15px 30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ color: "#FFF", margin: 0, fontSize: "22px", fontWeight: "bold" }}>
                    {mostrarResumen ? "Resumen de edición" : "Editar pedido"}
                  </h2>
                  <motion.div whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                    <CloseOutlined onClick={onClose} style={{ color: "#E53935", fontSize: "24px", cursor: "pointer" }} />
                  </motion.div>
                </div>

                <div style={{ display: "flex", flex: 1, flexDirection: isMobile ? "column" : "row", overflow: "hidden" }}>
                  
                  {/* Panel Izquierdo */}
                  <div style={{ flex: 3, padding: "30px", backgroundColor: "#F9F9F6", overflowY: "auto" }}>
                    <AnimatePresence mode="wait">
                      {mostrarResumen ? (
                        <motion.div key="resumen" variants={fadeRightVariants} initial="hidden" animate="visible" exit="exit">
                          <h3 style={{ fontSize: "18px", color: "#333", marginBottom: "20px", fontWeight: "bold" }}>Nuevo total del pedido</h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "550px" }}>
                            {carrito.map(item => (
                              <div key={item.idUnique} style={{ backgroundColor: "#1A1A1A", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderRadius: "8px" }}>
                                <span style={{ color: "#FFF" }}>{item.nombreDisplay}</span>
                                <span style={{ color: "#AAA" }}>${(item.precioBase + (item.costoOrilla || 0)).toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end", gap: "40px", alignItems: "flex-end" }}>
                            <div><span style={{ fontSize: "16px" }}>Subtotal: </span><strong>${subtotalBase.toFixed(0)}</strong></div>
                            <div style={{ backgroundColor: "#1A1A1A", padding: "10px 25px", borderRadius: "8px" }}>
                              <span style={{ color: "#5FB666", fontWeight: "bold", fontSize: "20px" }}>Total: ${total.toFixed(0)}</span>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="seleccion" variants={fadeRightVariants} initial="hidden" animate="visible" exit="exit">
                          <ConfigProvider getPopupContainer={(triggerNode) => triggerNode.parentNode} theme={{ token: { borderRadius: 0, colorBgContainer: "#E0E0E0", controlHeight: 40, fontSize: 16 }}}>
                            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
                              <div style={{ width: isMobile ? "100%" : "250px" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Tipo de producto</label>
                                <Select value={tipoProducto} onChange={setTipoProducto} style={{ width: "100%" }}>
                                  {tiposUnicos.map(t => <Option key={t} value={t}>{t}</Option>)}
                                </Select>
                              </div>
                              <div style={{ width: isMobile ? "100%" : "250px" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Tamaño</label>
                                <Select value={tamano} onChange={setTamano} style={{ width: "100%" }}>
                                  {opcionesTamanosActuales.map(t => <Option key={t} value={t}>{t}</Option>)}
                                </Select>
                              </div>
                            </div>

                            <div style={{ flex: 1 }}>
                              {esPizza ? (
                                <div style={{ position: "relative", minHeight: "450px" }}>
                                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
                                    <div style={{ textAlign: "center" }}>
                                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>¿Mitades?</label>
                                      <div style={{ display: "flex", borderRadius: "20px", overflow: "hidden", width: "120px", border: "1px solid #CCC" }}>
                                        <div onClick={() => setEsMitades(false)} style={{ flex: 1, padding: "5px 0", textAlign: "center", cursor: "pointer", backgroundColor: !esMitades ? "#888" : "#E0E0E0", color: !esMitades ? "#FFF" : "#666" }}>No</div>
                                        <div onClick={() => setEsMitades(true)} style={{ flex: 1, padding: "5px 0", textAlign: "center", cursor: "pointer", backgroundColor: esMitades ? "#FBC02D" : "#E0E0E0", color: esMitades ? "#000" : "#666" }}>Sí</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "30px" }}>
                                    <div>
                                      <Select value={esMitades ? mitadIzquierdaId : pizzaCompletaId} onChange={(val) => esMitades ? setMitadIzquierdaId(val) : setPizzaCompletaId(val)} style={{ width: "160px" }}>
                                        {opcionesPizzasFiltradas.map(p => <Option key={p.id_producto} value={p.id_producto}>{p.nombre.replace('Pizza ', '')}</Option>)}
                                      </Select>
                                    </div>
                                    <motion.img key={`pizza-${pizzaCompletaId}`} initial={{ rotate: -360, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 150 }} src={imagenPizza} style={{ width: "300px", height: "300px", objectFit: "contain" }} />
                                    {esMitades ? (
                                      <Select value={mitadDerechaId} onChange={setMitadDerechaId} style={{ width: "160px" }}>
                                        {opcionesPizzasFiltradas.map(p => <Option key={p.id_producto} value={p.id_producto}>{p.nombre.replace('Pizza ', '')}</Option>)}
                                      </Select>
                                    ) : <div style={{ width: "160px" }}></div>}
                                  </div>

                                  <div style={{ position: "absolute", right: "5%", bottom: 0 }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Orilla de queso</label>
                                    <div style={{ display: "flex", borderRadius: "20px", overflow: "hidden", width: "120px" }}>
                                      <div onClick={() => setOrillaQueso(false)} style={{ flex: 1, textAlign: "center", padding: "5px 0", cursor: "pointer", backgroundColor: !orillaQueso ? "#888" : "#CCC", color: !orillaQueso ? "#FFF" : "#666" }}>No</div>
                                      <div onClick={() => setOrillaQueso(true)} style={{ flex: 1, textAlign: "center", padding: "5px 0", cursor: "pointer", backgroundColor: orillaQueso ? "#FBC02D" : "#CCC", color: orillaQueso ? "#000" : "#666" }}>Sí</div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ marginBottom: "30px" }}>
                                  <div style={{ width: isMobile ? "100%" : "250px" }}>
                                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Escoge el producto</label>
                                    <Select value={productoOtroNombre} onChange={setProductoOtroNombre} style={{ width: "100%" }}>
                                      {opcionesNombresOtro.map(nombre => <Option key={nombre} value={nombre}>{nombre}</Option>)}
                                    </Select>
                                  </div>
                                </div>
                              )}

                              {/* Extras */}
                              <div style={{ marginTop: "30px", borderTop: "1px solid #CCC", paddingTop: "20px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>Extras:</h3>
                                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "flex-end" }}>
                                  <div style={{ width: "200px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", color: "#666" }}>Ingrediente</label>
                                    <Select value={extraInsumoId} onChange={setExtraInsumoId} style={{ width: "100%" }}>
                                      {insumosExtras.map(i => <Option key={i.id_insumo} value={i.id_insumo}>{i.nombre} (${i.costo_unitario}/{i.unidad})</Option>)}
                                    </Select>
                                  </div>
                                  <div style={{ width: "120px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", color: "#666" }}>Cantidad ({unidadActual})</label>
                                    <Input type="number" value={extraCantidad} onChange={(e) => setExtraCantidad(e.target.value)} placeholder={`0 ${unidadActual}`} />
                                  </div>
                                  <Button onClick={handleAddExtra} style={{ backgroundColor: "#4A4A4A", color: "#FFF", borderRadius: "20px" }}>Añadir</Button>
                                </div>

                                <div style={{ display: "flex", gap: "10px", marginTop: "15px", flexWrap: "wrap" }}>
                                  <AnimatePresence>
                                    {listaExtras.map(extra => (
                                      <motion.div key={extra.idUnique} variants={fadeUpVariants} initial="hidden" animate="visible" exit="exit" style={{ backgroundColor: "#E0E0E0", padding: "4px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "12px" }}>{extra.nombre} ({extra.cantidadVista}{extra.unidad})</span>
                                        <span onClick={() => handleRemoveExtra(extra.idUnique)} style={{ cursor: "pointer", fontWeight: "bold", color: "#E53935" }}>x</span>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                                  <Button onClick={handleAddProducto} style={{ borderRadius: "20px", border: "2px solid #333", fontWeight: "bold" }}>Añadir producto</Button>
                                </div>
                              </div>
                            </div>
                          </ConfigProvider>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Panel Derecho (Carrito) */}
                  <div style={{ flex: isMobile ? "none" : 1, width: isMobile ? "100%" : "350px", backgroundColor: "#2E2E2E", padding: "30px", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ color: "#FFF", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>Productos a editar</h3>
                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                      <AnimatePresence>
                        {carrito.map(item => (
                          <motion.div key={item.idUnique} variants={cartItemVariants} initial="hidden" animate="visible" exit="exit" layout style={{ backgroundColor: "#EBEBEB", padding: "10px 15px", borderRadius: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "14px", fontWeight: "500" }}>{item.nombreDisplay}</span>
                              <span onClick={() => handleRemoveCarrito(item.idUnique)} style={{ color: "#E53935", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>x</span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                              ${item.precioCalculado.toFixed(0)}
                              {item.promocionAplicada && <Tag color="green" style={{ marginLeft: "8px", fontSize: "10px" }}>{item.promocionAplicada.nombre_promocion}</Tag>}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {carrito.length === 0 && <div style={{ color: "#AAA", textAlign: "center", marginTop: "40px" }}>Sin productos</div>}
                    </div>

                    {!mostrarResumen ? (
                      <Button onClick={handleMostrarResumen} size="large" style={{ backgroundColor: "#EBEBEB", borderColor: "#5FB666", color: "#5FB666", fontWeight: "bold", borderRadius: "20px", width: "100%" }}>Continuar</Button>
                    ) : (
                      <Button onClick={handleGuardarCambios} loading={procesando} disabled={procesando} size="large" style={{ backgroundColor: "#5FB666", color: "#FFF", fontWeight: "bold", borderRadius: "20px", width: "100%" }}>Guardar cambios</Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL MostradorPage
// ============================================================
const MostradorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = location.state?.token;

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Estados Modal Crear
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [tipoPedido, setTipoPedido] = useState(1);

  // Estados Modal Detalle de Orden
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);

  // Estados Modal Editar
  const [isEditarOpen, setIsEditarOpen] = useState(false);

  // Estados Modal Pago
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [splitCashAmount, setSplitCashAmount] = useState(0);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: "", name: "", expiry: "", cvv: "", montoTarjeta: 0 });

  // Responsive
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    socket.emit("join-room", "sala-pedidos");
    socket.on("nuevo-pedido", (payload) => {
      if (payload?.data) {
        setPedidos((prev) => [
          { ...payload.data, estado_pedido: payload.data.estado || "Pendiente" },
          ...prev,
        ]);
      }
    });
    return () => socket.off("nuevo-pedido");
  }, []);

  useEffect(() => {
    const checkResponsive = () => setIsTablet(window.innerWidth <= 1024);
    checkResponsive();
    window.addEventListener("resize", checkResponsive);
    return () => window.removeEventListener("resize", checkResponsive);
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const url = `${API_URL}/mostrador/pedidos/hoy`;
      const res = await axios.get(url);
      setPedidos(res.data);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  // Modales
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNombreCliente("");
    setTelefono("");
    setDomicilio("");
    setTipoPedido(1);
  };

  const handleCrearPedido = () => {
    const tipoSeleccionado = TIPOS_PEDIDO.find((t) => t.id_tipo === tipoPedido);
    navigate("/mostrador/seleccion", {
      state: {
        cliente: nombreCliente,
        telefono: tipoPedido === 2 ? telefono : "",
        tipoPedido: tipoSeleccionado?.label || "",
        idTipoPedido: tipoPedido,
        domicilio: tipoPedido === 2 ? domicilio : "",
      },
    });
    handleCloseModal();
  };

  const handleOpenDetalle = (pedido) => {
    setSelectedPedido(pedido);
    setIsDetalleOpen(true);
  };

  const handleCloseDetalle = () => {
    setIsDetalleOpen(false);
    setTimeout(() => setSelectedPedido(null), 300);
  };

  // Abrir modal de edición
  const handleOpenEditar = () => {
    if (isPedidoCancelado()) {
      Swal.fire('Información', 'No se puede editar un pedido cancelado', 'info');
      return;
    }
    if (isPedidoPagado()) {
      Swal.fire('Información', 'No se puede editar un pedido ya pagado', 'info');
      return;
    }
    setIsEditarOpen(true);
  };

  const handleCloseEditar = () => {
    setIsEditarOpen(false);
  };

  // Verificar si el pedido está cancelado
  const isPedidoCancelado = () => {
    return selectedPedido?.estado_pedido === "Cancelado";
  };

  // Verificar si el pedido está pagado
  const isPedidoPagado = () => {
    return selectedPedido?.Pagado === true;
  };

  // Lógica Cancelar Pedido
  const handleCancelarPedido = () => {
    if (isPedidoCancelado()) {
      Swal.fire('Información', 'Este pedido ya está cancelado', 'info');
      return;
    }

    Swal.fire({
      title: '¿Registrar como merma?',
      text: `Vas a cancelar la orden de ${selectedPedido.cliente_nombre}. ¿Deseas registrar los insumos como merma?`,
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Sí',
      denyButtonText: 'No',
      cancelButtonText: 'Cancelar Acción',
      confirmButtonColor: '#d33',
      denyButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed || result.isDenied) {
        const isMerma = result.isConfirmed; 
        try {
          const url = `${API_URL}/mostrador/pedidos/${selectedPedido.id_pedido}/cancelar`;
          await axios.put(url, { merma: isMerma });
          Swal.fire(
            '¡Cancelado!', 
            `El pedido fue cancelado y ${isMerma ? 'registrado como merma' : 'devuelto al inventario'}.`, 
            'success'
          );
          fetchPedidos(); 
          handleCloseDetalle();
        } catch (error) {
          console.error("Error al cancelar pedido:", error);
          Swal.fire('Error', 'Hubo un problema al cancelar el pedido.', 'error');
        }
      }
    });
  };

  // --- LÓGICA MODAL DE PAGO ---
  const handleOpenPayment = () => {
    if (isPedidoPagado()) {
      Swal.fire('Información', 'Este pedido ya está pagado', 'info');
      return;
    }
    if (isPedidoCancelado()) {
      Swal.fire('Información', 'No se puede pagar un pedido cancelado', 'info');
      return;
    }
    
    setPaymentMethod("Efectivo");
    setShowCardForm(false);
    setPaymentLoading(false);
    setCardDetails({ number: "", name: "", expiry: "", cvv: "", montoTarjeta: 0 });
    setSplitCashAmount(Math.round(selectedPedido.total / 2)); 
    setIsPaymentModalOpen(true);
  };

  const handleClosePayment = () => {
    setIsPaymentModalOpen(false);
    setShowCardForm(false);
    setPaymentLoading(false);
  };

  // Función centralizada para llamar a tu API - SIEMPRE ENVÍA UN ARRAY
  const enviarPago = async (pagosArray) => {
    try {
      setPaymentLoading(true);
      console.log("Enviando pagos al backend:", pagosArray);
      const url = `${API_URL}/mostrador/pedidos/${selectedPedido.id_pedido}/pagar`;
      await axios.post(url, pagosArray);
      
      Swal.fire('¡Éxito!', 'Pago registrado correctamente', 'success');
      setIsPaymentModalOpen(false);
      handleCloseDetalle();
      fetchPedidos();
    } catch (error) {
      console.error("Error al pagar:", error);
      Swal.fire('Error', error.response?.data?.error || error.response?.data?.message || 'Error al procesar el pago', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleConfirmPaymentType = async () => {
    if (paymentMethod === "Efectivo") {
      await enviarPago([{ id_tipo_pago: 1, monto: selectedPedido.total }]);
    } else if (paymentMethod === "Tarjeta") {
      setShowCardForm(true);
    } else if (paymentMethod === "Dividido") {
      const montoTarjeta = selectedPedido.total - splitCashAmount;
      setCardDetails(prev => ({ ...prev, montoTarjeta }));
      setShowCardForm(true);
    }
  };

  const handleProcessCardForm = async () => {
    if (!cardDetails.number || !cardDetails.cvv) {
      return Swal.fire('Error', 'Completa los datos de la tarjeta', 'warning');
    }

    let pagosArray = [];
    if (paymentMethod === "Tarjeta") {
      pagosArray = [{ id_tipo_pago: 2, monto: selectedPedido.total }];
    } else if (paymentMethod === "Dividido") {
      pagosArray = [
        { id_tipo_pago: 1, monto: splitCashAmount },
        { id_tipo_pago: 2, monto: cardDetails.montoTarjeta }
      ];
    }

    await enviarPago(pagosArray);
  };

  const renderPromociones = () => {
    if (!selectedPedido) return null;
    const allPromos = selectedPedido.productos.flatMap(p => p.promociones || []);
    if (allPromos.length === 0) return <div style={{ padding: "5px" }}>Sin promociones aplicadas</div>;
    return (
      <div style={{ padding: "5px" }}>
        {allPromos.map((promo, idx) => (
          <div key={idx} style={{ fontWeight: "bold" }}>• {promo.nombre_promocion}</div>
        ))}
      </div>
    );
  };

  const formatHora = (fechaString) => {
    if (!fechaString) return "--:--";
    const date = new Date(fechaString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderPaymentPill = (label) => {
    const isActive = paymentMethod === label;
    return (
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPaymentMethod(label)}
        style={{
          padding: "8px 25px",
          borderRadius: "20px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px",
          transition: "background-color 0.3s, color 0.3s, border 0.3s",
          backgroundColor: isActive ? "#E8F5E9" : "#BDBDBD",
          color: isActive ? "#2E7D32" : "#424242",
          border: isActive ? "2px solid #333" : "2px solid transparent",
        }}
      >
        {label}
      </motion.div>
    );
  };

  return (
    <div style={{ backgroundColor: "#F9F9F6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderMostrador text="MOSTRADOR" logo={Logo} height={isTablet ? "70px" : "80px"} isTablet={isTablet} />

      <div style={{ flex: 1, padding: "40px 60px", maxWidth: "1200px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexShrink: 0 }}>
          <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#333", margin: 0 }}>Pedidos</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <motion.div whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
              <BellOutlined style={{ fontSize: "24px", cursor: "pointer" }} />
            </motion.div>
            <Button
              type="primary"
              style={{ backgroundColor: "#333", borderColor: "#333", borderRadius: "20px", fontWeight: "bold", padding: "0 20px" }}
              size="large"
              onClick={handleOpenModal}
            >
              Crear nuevo pedido
            </Button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "100px" }}><Spin size="large" /></div>
        ) : pedidos.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "100px", color: "#666", fontSize: "16px" }}>No hay pedidos registrados hasta el momento</div>
        ) : (
          <motion.div 
            variants={listContainerVariants}
            initial="hidden"
            animate="show"
            style={{ display: "flex", flexDirection: "column", gap: "15px", overflowY: "auto", flex: 1 }}
          >
            {pedidos.map((pedido) => {
              const productoPrincipal = pedido.productos[0]?.nombre || "Producto sin nombre";
              const colors = getRowColors(pedido.id_pedido); 
              const btnConfig = getButtonStyles(pedido.estado_pedido, pedido.Pagado);
              const estaCancelado = pedido.estado_pedido === "Cancelado";

              return (
                <motion.div
                  key={pedido.id_pedido}
                  variants={listItemVariants}
                  whileHover={{ scale: 1.01, boxShadow: "0 8px 15px rgba(0,0,0,0.15)" }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleOpenDetalle(pedido)}
                  style={{
                    display: "flex",
                    borderRadius: "12px",
                    overflow: "hidden",
                    height: "60px",
                    cursor: "pointer",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    opacity: estaCancelado ? 0.6 : 1,
                    flexShrink: 0
                  }}
                >
                  <div style={{ flex: 2, backgroundColor: colors.left, color: "white", display: "flex", alignItems: "center", padding: "0 20px" }}>
                    <div style={{ flex: 1, fontWeight: "500", fontSize: "16px" }}>Orden de {pedido.cliente_nombre}</div>
                    <div style={{ flex: 1, fontSize: "16px", opacity: 0.9 }}>{productoPrincipal}</div>
                  </div>

                  <div style={{ flex: 1, backgroundColor: colors.right, color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>{pedido.estado_pedido}</div>
                    {!estaCancelado && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleOpenDetalle(pedido);
                            if (!pedido.Pagado && pedido.estado_pedido !== "Cancelado") {
                              handleOpenPayment();
                            }
                          }}
                          style={{ backgroundColor: btnConfig.bg, borderColor: btnConfig.bg, color: btnConfig.text, borderRadius: "20px", fontWeight: "bold", minWidth: "100px" }}
                        >
                          {btnConfig.label}
                        </Button>
                      </motion.div>
                    )}
                    {estaCancelado && (
                      <div style={{ backgroundColor: "#555", color: "white", borderRadius: "20px", padding: "5px 15px", fontWeight: "bold", fontSize: "14px" }}>
                        Cancelado
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* MODAL DETALLE DE ORDEN - DIV PERSONALIZADO */}
      <AnimatePresence>
        {isDetalleOpen && selectedPedido && (
          <>
            {/* Overlay oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDetalle}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                zIndex: 1000
              }}
            />
            
            {/* Contenedor centrado */}
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "1100px",
                maxWidth: "90vw",
                maxHeight: "90vh",
                overflowY: "auto",
                zIndex: 1001
              }}
            >
              <motion.div
                variants={modalContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div style={{
                  backgroundColor: getRowColors(selectedPedido.id_pedido).left, 
                  color: "white", 
                  padding: "30px", 
                  fontFamily: "sans-serif",
                  borderRadius: "16px",
                  overflow: "hidden"
                }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                    <h2 style={{ color: "white", margin: 0, fontSize: "38px", fontWeight: "bold" }}>
                      Orden de {selectedPedido.cliente_nombre}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <span style={{ fontSize: "20px", fontWeight: "bold" }}>000{selectedPedido.id_pedido}M</span>
                      <motion.div 
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        onClick={handleOpenEditar}
                        style={{ cursor: "pointer" }}
                      >
                        <EditOutlined style={{ fontSize: "22px" }} />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.2, rotate: 90 }}>
                        <CloseOutlined 
                          style={{ fontSize: "22px", cursor: "pointer", fontWeight: "bold" }} 
                          onClick={handleCloseDetalle} 
                        />
                      </motion.div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "30px", marginBottom: "20px", alignItems: "center" }}>
                    <motion.div 
                      initial={{ rotate: -360, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      style={{ width: "300px", height: "300px", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)", flexShrink: 0 }}
                    >
                      <img src={pizzaPedido} alt="Pizza" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </motion.div>

                    <div style={{ flex: 1, fontSize: "25px", display: "flex", flexDirection: "column", gap: "15px" }}>
                      {selectedPedido.productos.map((prod, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: 20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ delay: index * 0.1 + 0.2 }}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}
                        >
                          <span>
                            {prod.cantidad > 1 ? `${prod.cantidad}x ` : ""} {prod.nombre} <span style={{ fontSize: "25px", opacity: 0.8 }}>({prod.tamano})</span>
                          </span>
                          {prod.orilla_queso && (
                            <span style={{ backgroundColor: "#FFCA28", color: "#B07900", padding: "2px 10px", borderRadius: "12px", fontSize: "20px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                              Orilla queso
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "20px", fontWeight: "bold" }}>
                      <ClockCircleOutlined style={{ fontSize: "24px" }} /> 
                      {formatHora(selectedPedido.hora_inicio)}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "20px", marginBottom: "4px" }}>TOTAL:</div>
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        transition={{ delay: 0.3 }}
                        style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "40px", fontWeight: "bold" }}
                      >
                        ${selectedPedido.total} MXN
                      </motion.div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <Button style={{ backgroundColor: "#333", color: "white", border: "none", borderRadius: "20px", padding: "0 20px", fontSize:"20px" }}>
                        {selectedPedido.tipo_pedido}
                      </Button>
                      <Popover content={renderPromociones()} trigger="click" placement="bottom">
                        <Button style={{ backgroundColor: "white", color: "black", border: "none", borderRadius: "20px", padding: "0 20px", fontWeight: "bold", fontSize:"20px" }}>
                          Promoción
                        </Button>
                      </Popover>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <motion.div whileHover={{ scale: isPedidoCancelado() ? 1 : 1.05 }} whileTap={{ scale: isPedidoCancelado() ? 1 : 0.95 }}>
                        <Button 
                          onClick={handleCancelarPedido}
                          disabled={isPedidoCancelado() || isPedidoPagado()}
                          style={{ 
                            backgroundColor: "#333", 
                            color: isPedidoCancelado() || isPedidoPagado() ? "#888" : "#FF5252", 
                            border: "none", 
                            borderRadius: "20px", 
                            padding: "0 25px", 
                            fontWeight: "bold", 
                            fontSize: "20px", 
                            height: "100%",
                            opacity: isPedidoCancelado() || isPedidoPagado() ? 0.5 : 1,
                            cursor: isPedidoCancelado() || isPedidoPagado() ? "not-allowed" : "pointer"
                          }}
                        >
                          {isPedidoCancelado() ? "Cancelado" : isPedidoPagado() ? "Pagado" : "Cancelar"}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: (isPedidoCancelado() || isPedidoPagado()) ? 1 : 1.05 }} whileTap={{ scale: (isPedidoCancelado() || isPedidoPagado()) ? 1 : 0.95 }}>
                        <Button 
                          onClick={handleOpenPayment} 
                          disabled={isPedidoCancelado() || isPedidoPagado()}
                          style={{ 
                            backgroundColor: isPedidoCancelado() || isPedidoPagado() ? "#ccc" : "white", 
                            color: isPedidoCancelado() || isPedidoPagado() ? "#888" : "#4CAF50", 
                            border: "none", 
                            borderRadius: "20px", 
                            padding: "0 35px", 
                            fontWeight: "bold", 
                            fontSize: "20px", 
                            height: "100%",
                            opacity: isPedidoCancelado() || isPedidoPagado() ? 0.5 : 1,
                            cursor: isPedidoCancelado() || isPedidoPagado() ? "not-allowed" : "pointer"
                          }}
                        >
                          {isPedidoPagado() ? "Pagado" : "Pagar"}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL DE EDICIÓN */}
      <EditarPedidoModal
        visible={isEditarOpen}
        pedido={selectedPedido}
        onClose={handleCloseEditar}
        fetchPedidos={fetchPedidos}
        onSuccess={() => {
          handleCloseDetalle();
          fetchPedidos();
        }}
      />

      {/* MODAL DE PAGO - DIV PERSONALIZADO */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedPedido && (
          <>
            {/* Overlay oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePayment}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                zIndex: 1000
              }}
            />
            
            {/* Contenedor centrado */}
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "550px",
                maxWidth: "90vw",
                zIndex: 1001
              }}
            >
              <motion.div
                variants={modalContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div style={{ 
                  backgroundColor: "#F2F2F2", 
                  padding: "30px", 
                  borderRadius: "12px", 
                  border: "8px solid #C62828", 
                  color: "#333", 
                  fontFamily: "sans-serif" 
                }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#333" }}>
                        Orden de {selectedPedido.cliente_nombre}
                      </h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      <span style={{ fontSize: "20px", fontWeight: "bold", color: "#666" }}>
                        000{selectedPedido.id_pedido}M
                      </span>
                      <motion.div whileHover={{ scale: 1.2, rotate: 90 }}>
                        <CloseOutlined 
                          onClick={handleClosePayment} 
                          style={{ fontSize: "22px", cursor: "pointer", fontWeight: "bold", color: "#333" }} 
                        />
                      </motion.div>
                    </div>
                  </div>

                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <AnimatePresence mode="wait">
                      {!showCardForm ? (
                        <motion.div
                          key="selection-view"
                          variants={fadeSlideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                        >
                          <div style={{ display: "flex", gap: "20px", marginBottom: "20px", fontSize: "18px", fontWeight: "bold" }}>
                            <span style={{ color: "#555" }}>Total:</span>
                            <span>${selectedPedido.total}</span>
                          </div>

                          <div style={{ marginBottom: "15px", fontSize: "16px", fontWeight: "bold", color: "#555" }}>
                            Tipo de pago
                          </div>

                          <div style={{ display: "flex", gap: "15px", marginBottom: "30px", flexWrap: "wrap" }}>
                            {renderPaymentPill("Efectivo")}
                            {renderPaymentPill("Tarjeta")}
                            {renderPaymentPill("Dividido")}
                          </div>

                          <AnimatePresence>
                            {paymentMethod === "Dividido" && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ marginBottom: "30px", padding: "15px", backgroundColor: "#E0E0E0", borderRadius: "10px" }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontWeight: "bold" }}>
                                  <span style={{ color: "#2E7D32" }}>Efectivo: ${splitCashAmount}</span>
                                  <span style={{ color: "#1565C0" }}>Tarjeta: ${(selectedPedido.total - splitCashAmount).toFixed(2)}</span>
                                </div>
                                <Slider
                                  min={1}
                                  max={selectedPedido.total - 1}
                                  value={splitCashAmount}
                                  onChange={setSplitCashAmount}
                                  tooltip={{ formatter: (val) => `$${val} en Efectivo` }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                onClick={handleConfirmPaymentType}
                                loading={paymentLoading}
                                style={{ backgroundColor: "#333", color: "#FFCA28", border: "none", borderRadius: "20px", padding: "0 30px", fontWeight: "bold", fontSize: "16px", height: "100%" }}
                              >
                                Confirmar
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="card-view"
                          variants={fadeSlideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                        >
                          <ConfigProvider theme={{ token: { borderRadius: 8, colorPrimary: "#333" } }}>
                            <div style={{ borderTop: "2px solid #ccc", paddingTop: "20px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", fontSize: "18px", fontWeight: "bold" }}>
                                <CreditCardOutlined style={{ fontSize: "24px" }} />
                                Terminal Virtual - Cobrando ${paymentMethod === "Dividido" ? (selectedPedido.total - splitCashAmount).toFixed(2) : selectedPedido.total}
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
                                <Input 
                                  placeholder="Número de Tarjeta (16 dígitos)" 
                                  maxLength={16}
                                  size="large"
                                  value={cardDetails.number}
                                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                />
                                <Input 
                                  placeholder="Nombre del Titular" 
                                  size="large"
                                  value={cardDetails.name}
                                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                />
                                <div style={{ display: "flex", gap: "15px" }}>
                                  <Input 
                                    placeholder="MM/AA" 
                                    maxLength={5}
                                    size="large"
                                    value={cardDetails.expiry}
                                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                  />
                                  <Input 
                                    placeholder="CVV" 
                                    maxLength={4}
                                    size="large"
                                    type="password"
                                    value={cardDetails.cvv}
                                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                  />
                                </div>
                              </div>

                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button 
                                    onClick={() => setShowCardForm(false)}
                                    style={{ fontWeight: "bold", borderRadius: "20px", padding: "0 25px", height: "100%" }}
                                  >
                                    Atrás
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button 
                                    onClick={handleProcessCardForm}
                                    loading={paymentLoading}
                                    style={{ backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "20px", padding: "0 30px", fontWeight: "bold", fontSize: "16px", height: "100%" }}
                                  >
                                    Procesar Pago
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                          </ConfigProvider>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL CREAR ORDEN */}
      <Modal
        title={<span style={{ fontSize: "28px", fontWeight: "800", color: "#333" }}>Nueva orden</span>}
        open={isModalOpen}
        onCancel={handleCloseModal}
        closable={false}
        centered
        width={400}
        footer={[
          <Button key="cancel" onClick={handleCloseModal} style={{ borderRadius: 0, fontWeight: "bold", fontSize:"20px" }}>Cancelar</Button>,
          <Button key="next" type="primary" onClick={handleCrearPedido} style={{ backgroundColor: "#4B6149", borderRadius: 0, fontWeight: "bold", fontSize:"20px" }}>Siguiente</Button>,
        ]}
      >
        <ConfigProvider theme={{ token: { borderRadius: 0, colorBgContainer: "#DFDFDF", colorBorder: "#333333", controlHeight: 40, fontSize: 16, colorPrimaryHover: "#333333", colorPrimary: "#4B6149" } }}>
          <div style={{ marginTop: "10px" }}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Nombre del cliente</label>
              <Input placeholder="Juan Pérez" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} />
            </div>
            {tipoPedido === 2 && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Teléfono</label>
                <Input placeholder="4771234567" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
            )}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Tipo de pedido</label>
              <Select value={tipoPedido} onChange={(value) => setTipoPedido(value)} style={{ width: "100%" }}>
                {TIPOS_PEDIDO.map((tipo) => (
                  <Option key={tipo.id_tipo} value={tipo.id_tipo}>{tipo.label}</Option>
                ))}
              </Select>
            </div>
            {tipoPedido === 2 && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Domicilio</label>
                <Input placeholder="Calle, número, colonia" value={domicilio} onChange={(e) => setDomicilio(e.target.value)} />
              </div>
            )}
          </div>
        </ConfigProvider>
      </Modal>
    </div>
  );
};

export default MostradorPage;