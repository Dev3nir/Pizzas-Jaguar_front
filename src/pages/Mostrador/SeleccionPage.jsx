import React, { useState, useEffect } from "react";
import { Select, ConfigProvider, Button, Input, message, Tag } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion"; // <-- IMPORTACIÓN DE FRAMER MOTION
import API_URL from "../../config/backend.js";
import imagenPizza from "./assets/pizzahd.png";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const { Option } = Select;

// --- VARIANTES DE ANIMACIÓN ---
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

const cartItemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.9 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
};

const SeleccionProducto = ({ onClose }) => {
  const location = useLocation();
  const { cliente, telefono, tipoPedido, idTipoPedido, domicilio } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) {
      navigate("/mostrador");
    }
  }, []);

  // --- ESTADOS DE DATOS API ---
  const [productosAPI, setProductosAPI] = useState([]);
  const [insumosAPI, setInsumosAPI] = useState([]);
  const [promocionesAPI, setPromocionesAPI] = useState([]);
  const insumosExtras = insumosAPI.filter(i => i.extra === true);
const [procesando, setProcesando] = useState(false);
  // --- ESTADOS PRINCIPALES ---
  const [tipoProducto, setTipoProducto] = useState("Pizza");
  const [tamano, setTamano] = useState("Grande");
  const [carrito, setCarrito] = useState([]);
  const [mostrarResumen, setMostrarResumen] = useState(false);

  // --- ESTADOS VISTA "PIZZA" ---
  const [esMitades, setEsMitades] = useState(false);
  const [orillaQueso, setOrillaQueso] = useState(false);
  const [pizzaCompletaId, setPizzaCompletaId] = useState(null);
  const [mitadIzquierdaId, setMitadIzquierdaId] = useState(null);
  const [mitadDerechaId, setMitadDerechaId] = useState(null);

  // --- ESTADOS VISTA "OTRO" ---
  const [productoOtroNombre, setProductoOtroNombre] = useState(null);

  // --- ESTADOS EXTRAS ---
  const [extraInsumoId, setExtraInsumoId] = useState(null);
  const [extraCantidad, setExtraCantidad] = useState("");
  const [listaExtras, setListaExtras] = useState([]);

  // --- RESPONSIVIDAD ---
  const [isMobile, setIsMobile] = useState(false);

  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- OBTENER UNIDAD DEL INSUMO SELECCIONADO ---
  const insumoSeleccionado = insumosExtras.find(i => i.id_insumo === extraInsumoId);
  const unidadActual = insumoSeleccionado ? insumoSeleccionado.unidad : "";

  // --- 1. FETCH DATOS ---
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
          setExtraCantidad("");
        }

        const tiposUnicos = [...new Set(resProductos.data.map(p => p.tipo))];
        if (tiposUnicos.length > 0) {
          const tienePizza = tiposUnicos.some(t => t.toLowerCase() === 'pizza');
          setTipoProducto(tienePizza ? "Pizza" : tiposUnicos[0]);
        }
      } catch (error) {
        console.error("Error cargando catálogos:", error);
        message.error("Error al cargar productos e insumos");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setExtraCantidad("");
  }, [extraInsumoId]);

  // --- 2. LÓGICA DINÁMICA DE COMBOS ---
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
      } else {
        setPizzaCompletaId(null);
        setMitadIzquierdaId(null);
        setMitadDerechaId(null);
      }
    }
  }, [tamano, esPizza, tipoProducto, productosAPI]);

  const opcionesPizzasFiltradas = productosAPI.filter(p => p.tipo === tipoProducto && p.tamano === tamano);
  const opcionesNombresOtro = [...new Set(productosAPI.filter(p => p.tipo === tipoProducto).map(p => p.nombre))];
  const opcionesTamanosActuales = esPizza
    ? [...new Set(productosAPI.filter(p => p.tipo === tipoProducto).map(p => p.tamano))]
    : [...new Set(productosAPI.filter(p => p.tipo === tipoProducto && p.nombre === productoOtroNombre).map(p => p.tamano))];

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

 const handleFinalizar = () => {
  setProcesando(true); // Activa el loader

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
    id_tipo_pedido: idTipoPedido,
    detalle_cliente: { nombre: cliente, telefono: telefono, direccion: idTipoPedido === 2 ? domicilio : null },
    productos: productosLimpio,
    total: total
  };

  axios.post(`${API_URL}/mostrador/pedidos`, payloadFinal)
    .then(res => {
      Swal.fire({
        icon: 'success',
        title: '¡Pedido registrado!',
        text: `Tu pedido ha sido registrado con éxito. Número de pedido: ${res.data.id_pedido}`,
        confirmButtonText: 'Aceptar'
      }).then(() => navigate("/mostrador"));
    })
    .catch(error => {
      console.error("Error al registrar el pedido:", error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al registrar el pedido.' });
    })
    .finally(() => {
      setProcesando(false); // Desactiva el loader sin importar el resultado
    });
};

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#F9F9F6", fontFamily: "Arial, sans-serif", zIndex: 1000 }}>
      
      {/* HEADER GLOBAL */}
      <div style={{ backgroundColor: "#2E2E2E", padding: isMobile ? "15px 20px" : "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <h2 style={{ color: "#FFF", margin: 0, fontSize: isMobile ? "22px" : "28px", fontWeight: "normal" }}>
            {mostrarResumen ? "Resumen de pedido" : "Selecciona productos"}
          </h2>
          {!mostrarResumen && (
            <div style={{ display: "flex", backgroundColor: "#1A1A1A", padding: "6px 12px", border: "1px solid #444", fontSize: isMobile ? "14px" : "16px" }}>
              <span style={{ color: "#FFF", paddingRight: "15px", borderRight: "1px solid #444" }}>{cliente}</span>
              <span style={{ color: "#FFF", paddingLeft: "15px" }}>{tipoPedido}</span>
            </div>
          )}
        </div>
        <motion.div whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }}>
          <CloseOutlined 
            onClick={mostrarResumen ? () => setMostrarResumen(false) : onClose} 
            style={{ color: "#E53935", fontSize: "28px", fontWeight: "bold", cursor: "pointer" }} 
          />
        </motion.div>
      </div>

      <div style={{ display: "flex", flex: 1, flexDirection: isMobile ? "column" : "row", overflow: "hidden" }}>
        
        {/* PANEL IZQUIERDO */}
        <div style={{ flex: 3, padding: isMobile ? "20px" : "40px", backgroundColor: "#F9F9F6", display: "flex", flexDirection: "column", overflowY: "auto", position: "relative" }}>
          
          <AnimatePresence mode="wait">
            {mostrarResumen ? (
              <motion.div 
                key="resumen"
                variants={fadeRightVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ maxWidth: "700px", display: "flex", flexDirection: "column", gap: "40px" }}
              >
                <div style={{ display: "flex", gap: "50px", flexWrap: "wrap" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "10px", fontSize: "16px", color: "#333", fontWeight: "bold" }}>Cliente</label>
                    <div style={{ backgroundColor: "#1A1A1A", color: "#FFF", padding: "10px 15px", fontSize: "16px", minWidth: "180px", textAlign: "center" }}>
                      {cliente || "Mostrador"}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "10px", fontSize: "16px", color: "#333", fontWeight: "bold" }}>Tipo</label>
                    <div style={{ backgroundColor: "#1A1A1A", color: "#FFF", padding: "10px 15px", fontSize: "16px", minWidth: "120px", textAlign: "center" }}>
                      {tipoPedido || "Mostrador"}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: "18px", color: "#333", marginBottom: "15px", fontWeight: "bold" }}>Promociones aplicables al pedido</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {carrito.filter(item => item.promocionAplicada && !item.esMitades).map((item) => (
                      <div key={item.idUnique} style={{ backgroundColor: "#1A1A1A", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "550px" }}>
                        <span style={{ color: "#FFF", fontSize: "16px", padding: "10px 15px" }}>{item.promocionAplicada.nombre_promocion}</span>
                        <span style={{ color: "#AAA", fontSize: "13px" }}>
                          {item.promocionAplicada.tipo_descuento === "Porcentaje" ? `${item.promocionAplicada.valor}% ${item.nombreDisplay}` : `$${item.promocionAplicada.valor} ${item.nombreDisplay}`}
                        </span>
                        <span style={{ color: "#E53935", padding: "10px 15px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>x</span>
                      </div>
                    ))}
                    {carrito.filter(item => item.promocionAplicada && !item.esMitades).length === 0 && (
                      <span style={{ color: "#666" }}>Sin promociones.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: "18px", color: "#333", marginBottom: "15px", fontWeight: "bold" }}>Total del pedido</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%", maxWidth: "550px" }}>
                    {carrito.map(item => {
                      let totalBaseItem = item.precioBase + (item.costoOrilla || 0);
                      if (item.detallesExtras) {
                        totalBaseItem += item.detallesExtras.reduce((sum, ext) => sum + (ext.costo_unitario * parseFloat(ext.cantidad)), 0);
                      }
                      return (
                        <div key={item.idUnique} style={{ backgroundColor: "#1A1A1A", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 15px" }}>
                          <span style={{ color: "#FFF", fontSize: "16px" }}>{item.nombreDisplay}</span>
                          <span style={{ color: "#AAA", fontSize: "16px" }}>${totalBaseItem.toFixed(0)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ width: "100%", maxWidth: "550px", marginTop: "20px", display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: "40px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", paddingBottom: "10px" }}>
                      <span style={{ fontSize: "16px", color: "#333" }}>Subtotal</span>
                      <span style={{ fontSize: "16px", color: "#333", fontWeight: "bold" }}>${subtotalBase.toFixed(0)}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "16px", color: "#333", marginBottom: "8px" }}>Total</span>
                      <div style={{ backgroundColor: "#1A1A1A", padding: "10px 20px", borderRadius: "8px" }}>
                        <span style={{ color: "#5FB666", fontWeight: "bold", fontSize: "18px" }}>${total.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="seleccion"
                variants={fadeRightVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
              >
                <ConfigProvider getPopupContainer={(triggerNode) => triggerNode.parentNode} theme={{ token: { borderRadius: 0, colorBgContainer: "#E0E0E0", colorBorder: "transparent", controlHeight: 40, fontSize: 16, colorText: "#333" }}}>
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

                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {esPizza ? (
                      <div style={{ position: "relative", minHeight: "450px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        
                        <div style={{ display: "flex", width: "100%", justifyContent: "center", marginBottom: "50px" }}>
                          <div style={{ textAlign: "center" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px" }}>¿Mitades?</label>
                            <div style={{ display: "flex", borderRadius: "20px", overflow: "hidden", cursor: "pointer", width: "120px", border: "1px solid #CCC" }}>
                              <div onClick={() => setEsMitades(false)} style={{ flex: 1, padding: "5px 0", fontWeight: "bold", backgroundColor: !esMitades ? "#888" : "#E0E0E0", color: !esMitades ? "#FFF" : "#666" }}>No</div>
                              <div onClick={() => setEsMitades(true)} style={{ flex: 1, padding: "5px 0", fontWeight: "bold", backgroundColor: esMitades ? "#FBC02D" : "#E0E0E0", color: esMitades ? "#000" : "#666" }}>Sí</div>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "30px", width: "100%", position: "relative" }}>
                          <div style={{ position: "relative", zIndex: 10 }}>
                            <Select value={esMitades ? mitadIzquierdaId : pizzaCompletaId} onChange={(val) => esMitades ? setMitadIzquierdaId(val) : setPizzaCompletaId(val)} style={{ width: "160px" }}>
                              {opcionesPizzasFiltradas.map(p => <Option key={p.id_producto} value={p.id_producto}>{p.nombre.replace('Pizza ','')}</Option>)}
                            </Select>
                            <div style={{ position: "absolute", top: "50%", right: "-50px", width: "50px", borderTop: "2px solid #333", transform: "rotate(15deg)", transformOrigin: "left" }} />
                          </div>

                          <div style={{ position: "relative", width: "500px", height: "350px", display: "flex", justifyContent: "center", zIndex: 5 }}>
                            <motion.img 
                              key={`pizza-img-${pizzaCompletaId}-${tamano}`} // ANIMARÁ CUANDO CAMBIE PIZZA O TAMAÑO
                              initial={{ rotate: -360, scale: 0 }}
                              animate={{ rotate: 0, scale: 1 }}
                              transition={{ type: "spring", stiffness: 150, damping: 20 }}
                              src={imagenPizza} 
                              alt="Pizza" 
                              style={{ width: "500px", height: "500px", objectFit: "contain" }} 
                            />
                            {esMitades && <div style={{ position: "absolute", top: "0%", bottom: "0%", left: "50%", borderLeft: "5px solid #000000", height: "500px" }} />}
                          </div>

                          {esMitades ? (
                            <div style={{ position: "relative", zIndex: 10 }}>
                              <Select value={mitadDerechaId} onChange={setMitadDerechaId} style={{ width: "160px" }}>
                                {opcionesPizzasFiltradas.map(p => <Option key={p.id_producto} value={p.id_producto}>{p.nombre.replace('Pizza ','')}</Option>)}
                              </Select>
                              <div style={{ position: "absolute", top: "50%", left: "-50px", width: "50px", borderTop: "2px solid #333", transform: "rotate(-15deg)", transformOrigin: "right" }} />
                            </div>
                          ) : (<div style={{ width: "160px" }}></div>)}
                        </div>

                        <div style={{ position: "absolute", right: isMobile ? "0" : "5%", bottom: "0" }}>
                          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px" }}>Orilla de queso</label>
                          <div style={{ display: "flex", borderRadius: "20px", overflow: "hidden", cursor: "pointer", width: "120px" }}>
                            <div onClick={() => setOrillaQueso(false)} style={{ flex: 1, textAlign: "center", padding: "5px 0", fontWeight: "bold", backgroundColor: !orillaQueso ? "#888" : "#CCC", color: !orillaQueso ? "#FFF" : "#666" }}>No</div>
                            <div onClick={() => setOrillaQueso(true)} style={{ flex: 1, textAlign: "center", padding: "5px 0", fontWeight: "bold", backgroundColor: orillaQueso ? "#FBC02D" : "#CCC", color: orillaQueso ? "#000" : "#666" }}>Sí</div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div style={{ marginBottom: "50px" }}>
                        <div style={{ width: isMobile ? "100%" : "250px" }}>
                          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Escoge el producto</label>
                          <Select value={productoOtroNombre} onChange={setProductoOtroNombre} style={{ width: "100%" }}>
                            {opcionesNombresOtro.map(nombre => <Option key={nombre} value={nombre}>{nombre}</Option>)}
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* EXTRAS */}
                    <div style={{ marginTop: "auto", borderTop: "1px solid #CCC", paddingTop: "20px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>Extras:</h3>
                      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
                        <div style={{ width: "200px" }}>
                          <label style={{ display: "block", marginBottom: "5px", color: "#666", fontSize: "14px" }}>Ingrediente</label>
                          <Select 
                            value={extraInsumoId} 
                            onChange={(value) => {
                              setExtraInsumoId(value);
                              setExtraCantidad("");
                            }} 
                            style={{ width: "100%" }}
                          >
                            {insumosExtras.map(i => (
                              <Option key={i.id_insumo} value={i.id_insumo}>
                                {i.nombre} (${i.costo_unitario}/{i.unidad})
                              </Option>
                            ))}
                          </Select>
                        </div>
                        
                        <div style={{ width: "120px" }}>
                          <label style={{ display: "block", marginBottom: "5px", color: "#666", fontSize: "14px" }}>
                            Cantidad {unidadActual ? `(${unidadActual})` : ""}
                          </label>
                          <Input 
                            type="number" 
                            value={extraCantidad} 
                            onChange={(e) => setExtraCantidad(e.target.value)} 
                            suffix={<span style={{ color: "#888" }}>{unidadActual}</span>} 
                            placeholder={`0 ${unidadActual}`}
                          />
                        </div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={handleAddExtra} style={{ backgroundColor: "#4A4A4A", color: "#FFF", borderRadius: "20px", border: "none", fontWeight: "bold", padding: "0 25px" }}>
                            Añadir insumo
                          </Button>
                        </motion.div>
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "20px", borderBottom: "1px solid #CCC", paddingBottom: "20px", flexWrap: "wrap", minHeight: "40px" }}>
                        <AnimatePresence>
                          {listaExtras.map(extra => (
                            <motion.div 
                              key={extra.idUnique} 
                              variants={fadeUpVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              style={{ backgroundColor: "#E0E0E0", padding: "5px 15px", borderRadius: "20px", fontSize: "12px", display: "flex", alignItems: "center", gap: "10px" }}
                            >
                              <span>{extra.nombre} ({extra.cantidadVista}{extra.unidad})</span>
                              <motion.span whileHover={{ scale: 1.2, color: "#E53935" }} onClick={() => handleRemoveExtra(extra.idUnique)} style={{ cursor: "pointer", fontWeight: "bold", color: "#666" }}>x</motion.span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={handleAddProducto} style={{ borderRadius: "20px", border: "2px solid #333", color: "#333", fontWeight: "bold", padding: "0 30px" }}>
                            Añadir producto
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                  </div>
                </ConfigProvider>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PANEL DERECHO COMPARTIDO (CARRITO) */}
        <div style={{ flex: isMobile ? "none" : 1, width: isMobile ? "100%" : "350px", backgroundColor: "#2E2E2E", padding: "30px", display: "flex", flexDirection: "column", borderTop: isMobile ? "4px solid #1A1A1A" : "none" }}>
          <h3 style={{ color: "#FFF", fontSize: "22px", fontWeight: "bold", marginBottom: "30px" }}>Productos</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto", overflowX: "hidden", paddingRight: "5px" }}>
            <AnimatePresence>
              {carrito.map((item) => (
                <motion.div 
                  key={item.idUnique}
                  variants={cartItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout // <--- Hace que los elementos fluyan suavemente cuando uno desaparece
                >
                  {mostrarResumen ? (
                    <div style={{ backgroundColor: "#EBEBEB", padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "8px" }}>
                      <span style={{ color: "#333", fontSize: "14px" }}>{item.nombreDisplay}</span>
                      <motion.span whileHover={{ scale: 1.2 }} onClick={() => handleRemoveCarrito(item.idUnique)} style={{ color: "#E53935", fontWeight: "bold", cursor: "pointer", fontSize: "14px", padding: "0 5px" }}>x</motion.span>
                    </div>
                  ) : (
                    <div style={{ backgroundColor: "#EBEBEB", padding: "10px 15px", display: "flex", flexDirection: "column", alignItems: "flex-start", borderRadius: "8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <span style={{ color: "#333", fontWeight: "500", fontSize: "15px" }}>{item.nombreDisplay}</span>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                          <div>
                            {item.promocionAplicada && !item.esMitades ? (
                              <>
                                <span style={{ color: "#999", fontSize: "12px", textDecoration: "line-through" }}>${(item.precioBase + (item.costoOrilla || 0)).toFixed(2)}</span>
                                <span style={{ color: "#5FB666", fontSize: "12px", fontWeight: "bold", marginLeft: "5px" }}>${item.precioCalculado.toFixed(2)}</span>
                                <Tag color="green" style={{ marginLeft: "5px", fontSize: "10px" }}>{item.promocionAplicada.nombre_promocion}</Tag>
                              </>
                            ) : (
                              <span style={{ color: "#666", fontSize: "12px", fontWeight: "bold" }}>${item.precioCalculado.toFixed(2)} total</span>
                            )}
                          </div>
                          <motion.span whileHover={{ scale: 1.2 }} onClick={() => handleRemoveCarrito(item.idUnique)} style={{ color: "#E53935", fontWeight: "bold", cursor: "pointer", fontSize: "16px", padding: "0 5px" }}>x</motion.span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {mostrarResumen ? (
              <Button 
  onClick={handleFinalizar} 
  size="large" 
  loading={procesando} // <--- Muestra el spinner de Ant Design
  disabled={procesando} // <--- Deshabilita el botón mientras procesa
  style={{ 
    marginTop: "20px", 
    backgroundColor: procesando ? "#CCC" : "transparent", // Opcional: cambio visual
    borderColor: "#F5A623", 
    color: "#F5A623", 
    fontWeight: "bold", 
    borderRadius: "20px", 
    borderWidth: "2px", 
    width: "100%" 
  }}
>
  Finalizar
</Button>
            ) : (
              <Button 
                onClick={handleMostrarResumen} 
                size="large" 
                style={{ marginTop: "20px", backgroundColor: "#EBEBEB", borderColor: "#5FB666", color: "#5FB666", fontWeight: "bold", borderRadius: "20px", borderWidth: "2px", width: "100%" }}
              >
                Continuar
              </Button>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default SeleccionProducto;