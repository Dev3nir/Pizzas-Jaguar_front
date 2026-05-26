// src/pages/cocina/Cocina.jsx
import { Button, message } from "antd";
import { useState, useEffect, useRef } from "react"; // <-- Importamos useRef
import axios from 'axios';
import { io } from "socket.io-client";

import HeaderComponent from "../../components/HeaderCocina.component.jsx";
import Logo from "../../assets/logos/logo.png";
import pizzaImage from '../../assets/pizz.png';
import API_URL from "../../config/backend.js";
import WEBSOCKET_URL from "../../config/websockets.js";

// ENUM para las fases de la Pizza
const FASES_PIZZA = {
  AMASADO: "Amasado",
  VESTIDA: "Vestida",
  HORNEADA: "Horneada",
};

// Paleta de colores para los pedidos
const PALETA_COLORES = [
  { main: "#E13A30", dark: "#B82921" }, // Rojo
  { main: "#4EACEC", dark: "#3B8CBE" }, // Azul
  { main: "#F3A123", dark: "#C68019" }, // Naranja
  { main: "#97C56A", dark: "#7AA254" }, // Verde
  { main: "#9B59B6", dark: "#7E4794" }, // Morado
  { main: "#34495E", dark: "#243342" }, // Azul Marino
];

// Función para obtener siempre el mismo color según el ID del pedido
const getColorParaPedido = (idPedido) => {
  let numId = typeof idPedido === 'string' ? parseInt(idPedido.match(/\d+/) || 0, 10) : idPedido;
  if (isNaN(numId)) numId = 0;
  const index = numId % PALETA_COLORES.length;
  return PALETA_COLORES[index];
};

const Cocina = () => {
  // ========== ESTADOS ==========
  const [pedidos, setPedidos] = useState([]);
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [pedidoSeleccionadoId, setPedidoSeleccionadoId] = useState(null);
  const [productoActual, setProductoActual] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const [cronometroActivo, setCronometroActivo] = useState(false);

  // Guardamos la instancia del WebSocket para poder emitir fuera del useEffect
  const socketRef = useRef(null);

  // Configuración de Toasts
  message.config({
    top: 80,
    duration: 3,
    maxCount: 3,
  });

  // ========== ESTILOS REUTILIZABLES ==========
  const itemPedidoStyle = {
    color: "white",
    cursor: "pointer",
    display: "flex",
    transition: "all 0.3s ease",
    overflow: "hidden",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
  };

  const divisorVertical = {
    width: "1px",
    height: "25px",
    backgroundColor: "rgba(255,255,255,0.4)",
    margin: "0 20px",
  };

  // ========== PETICIONES ==========
  const cambiarAEnPreparacion = async (idPedido) => {
    try {
      const url = `${API_URL}/cocina/${idPedido}`;
      const response = await axios.put(url);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const cambiarAFinalizado = async (idPedido) => {
    try {
      const url = `${API_URL}/cocina/${idPedido}/fin`;
      const response = await axios.put(url);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  // Hook Responsivo
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

  // ========== FUNCIONES DE LÓGICA ==========
  const generateFolio = (pedido) => {
    let numeroId = pedido.id_pedido;
    if (typeof pedido.id_pedido === 'string') {
      const match = pedido.id_pedido.match(/\d+/);
      numeroId = match ? match[0] : pedido.id_pedido;
    }
    const folioNumero = String(numeroId).padStart(3, '0');
    let letra = '';
    const tipo = (pedido.tipo_pedido || '').toLowerCase();
    
    if (tipo === 'domicilio') letra = 'D';
    else if (tipo === 'mostrador') letra = 'M';
    else if (tipo === 'salón' || tipo === 'salon') letra = 'S';
    else if (tipo === 'rappi') letra = 'R';
    
    return `${folioNumero}${letra}`;
  };

  const cargarPedidos = async () => {
    try {
      const url = `${API_URL}/cocina/`;
      const response = await axios.get(url);
      const pedidosConFolio = response.data.map(pedido => ({
        ...pedido,
        folio: generateFolio(pedido),
        colorTheme: getColorParaPedido(pedido.id_pedido)
      }));
      setPedidos(pedidosConFolio);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      message.error("Error al cargar los pedidos del servidor");
    }
  };

  // ========== WEBSOCKETS ==========
  useEffect(() => {
    // Guardamos la conexión en la referencia
    socketRef.current = io(WEBSOCKET_URL);

    socketRef.current.emit('join-pedidos'); 

    socketRef.current.on('nuevo-pedido', (payload) => {
      console.log("¡Nuevo pedido recibido en Cocina por WS!", payload);

      if (payload && payload.data && payload.data.length > 0) {
        const nuevoPedido = payload.data[0];
        nuevoPedido.folio = generateFolio(nuevoPedido);
        nuevoPedido.colorTheme = getColorParaPedido(nuevoPedido.id_pedido); 

        message.info(` ¡Nuevo pedido recibido! Folio: ${nuevoPedido.folio}`);

        setPedidos((pedidosAnteriores) => {
          const yaExiste = pedidosAnteriores.find(p => p.id_pedido === nuevoPedido.id_pedido);
          if (yaExiste) return pedidosAnteriores;
          return [nuevoPedido, ...pedidosAnteriores];
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('nuevo-pedido');
        socketRef.current.disconnect();
      }
    };
  }, []);

  // ========== CRONÓMETRO ==========
  useEffect(() => {
    let intervalo = null;
    if (cronometroActivo) {
      intervalo = setInterval(() => {
        setSegundos((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalo);
    }
    return () => clearInterval(intervalo);
  }, [cronometroActivo]);

  const formatTiempo = (totalSegundos) => {
    const minutos = Math.floor(totalSegundos / 60);
    const secs = totalSegundos % 60;
    return `${minutos.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ========== EFECTO INICIAL ==========
  useEffect(() => {
    cargarPedidos();
  }, []);

  // ========== MANEJADORES DE UI ==========
  const handleSelectPedido = (idPedido) => {
    if (pedidoActivo) return;
    setPedidoSeleccionadoId(pedidoSeleccionadoId === idPedido ? null : idPedido);
  };

  const handleIniciarPedido = async (pedido) => {
    try {
      await cambiarAEnPreparacion(pedido.id_pedido);
      
      const productosConFase = pedido.productos.map(prod => ({
        ...prod,
        esPizza: prod.nombre.toLowerCase().includes('pizza'),
        fase: FASES_PIZZA.AMASADO,
        extras: prod.extras?.map(e => e.insumo_nombre || e.nombre || "").join(', ') || "Ninguno",
        observaciones: prod.observaciones || "Ninguna",
        imagen: pizzaImage
      }));
      
      const pedidoConFases = { ...pedido, productos: productosConFase };
      
      setPedidoActivo(pedidoConFases);
      setProductoActual(productosConFase[0]);
      setPedidoSeleccionadoId(null);
      setSegundos(0);
      setCronometroActivo(true);
      
      message.success(`Iniciando preparación del pedido ${pedido.folio}`);
      await cargarPedidos();
    } catch (error) {
      console.error("Error al iniciar pedido:", error);
      message.error("No se pudo iniciar el pedido. Intente nuevamente.");
    }
  };

  const handleSiguienteFase = () => {
    if (!productoActual || !productoActual.esPizza) return;

    let proximaFase = productoActual.fase;
    if (productoActual.fase === FASES_PIZZA.AMASADO) proximaFase = FASES_PIZZA.VESTIDA;
    else if (productoActual.fase === FASES_PIZZA.VESTIDA) proximaFase = FASES_PIZZA.HORNEADA;

    const productoActualizado = { ...productoActual, fase: proximaFase };
    setProductoActual(productoActualizado);

    setPedidoActivo((prev) => ({
      ...prev,
      productos: prev.productos.map((p) => 
        p.id_detalle === productoActual.id_detalle ? productoActualizado : p
      ),
    }));
  };

  const handleTerminarPedido = async () => {
    if (!pedidoActivo) return;
    
    try {
      // 1. Lo mandamos cambiar a finalizado en BD
      const resultado = await cambiarAFinalizado(pedidoActivo.id_pedido);
      message.success(resultado.message || ` Pedido ${pedidoActivo.folio} terminado correctamente`);
      
      // 2. EMITIMOS EL EVENTO WEBSOCKET AVISANDO QUE ESTÁ TERMINADO
      if (socketRef.current) {
        socketRef.current.emit('pedido-terminado', {
          id_pedido: pedidoActivo.id_pedido,
          folio: pedidoActivo.folio,
          estado: "Finalizado",
          emisor: "cocina"
        });
      }
      
      // 3. Limpiamos la UI
      setCronometroActivo(false);
      setPedidoActivo(null);
      setProductoActual(null);
      setSegundos(0);
      await cargarPedidos();
    } catch (error) {
      console.error("Error al terminar pedido:", error);
      message.error("Error al intentar finalizar el pedido.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f9f9f6",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: "relative",
      }}
    >
      <HeaderComponent text="COCINA" logo={Logo} height={headerHeight} isTablet={isTablet} />

      <div style={{ flex: 1, padding: "40px 60px", overflowY: "auto", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "1200px" }}>
          
          {!pedidoActivo ? (
            <div style={{ display: "flex", flexDirection: "column", minHeight: "80%" }}>
              <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#333", marginBottom: "35px" }}>
                Pedidos pendientes:
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {pedidos.map((pedido) => {
                  const isDesplegado = pedidoSeleccionadoId === pedido.id_pedido;
                  const bgColor = isDesplegado ? pedido.colorTheme.dark : pedido.colorTheme.main;

                  return (
                    <div
                      key={pedido.id_pedido}
                      onClick={() => handleSelectPedido(pedido.id_pedido)}
                      style={{
                        ...itemPedidoStyle,
                        backgroundColor: bgColor, 
                        borderRadius: isDesplegado ? "25px" : "100px",
                        flexDirection: "column",
                        alignItems: "stretch",
                        padding: "0",
                      }}
                    >
                      <div style={{ display: "flex", width: "100%", alignItems: "center", minHeight: "65px", padding: "0 35px" }}>
                        <span style={{ fontWeight: "bold", fontSize: "22px", width: "10%" }}>{pedido.folio || pedido.id_pedido}</span>
                        <div style={divisorVertical} />
                        <span style={{ fontSize: "19px", width: "40%" }}>
                          <strong>Cliente:</strong> {pedido.cliente_nombre || "Mostrador"}
                        </span>
                        <div style={divisorVertical} />
                        <span style={{ fontSize: "19px", width: "50%" }}>
                          <strong>Tipo de pedido:</strong> {pedido.tipo_pedido}
                        </span>
                      </div>

                      {isDesplegado && (
                        <div style={{ padding: "20px 35px 25px 35px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                          <p style={{ margin: "0 0 15px 0", fontWeight: "bold", fontSize: "19px" }}>Productos:</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "25px" }}>
                            {pedido.productos.map((prod, index) => (
                              <span key={index} style={{ fontSize: "18px", fontWeight: "500" }}>
                                • {prod.nombre} {prod.tamano ? ` (${prod.tamano})` : ""} x{prod.cantidad}
                              </span>
                            ))}
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                            <span style={{ fontSize: "17px", fontStyle: "italic", opacity: 0.9 }}>Inicie el pedido para continuar</span>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIniciarPedido(pedido);
                              }}
                              style={{
                                backgroundColor: "#F3A123",
                                color: "#FFF",
                                border: "none",
                                borderRadius: "100px",
                                width: "180px",
                                height: "48px",
                                fontSize: "18px",
                                fontWeight: "bold",
                              }}
                            >
                              Iniciar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // PANTALLA DE PEDIDO ACTIVO
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#333", marginBottom: "35px" }}>
                Pedido actual
              </h2>

              <div style={{ display: "flex", gap: "50px", alignItems: "flex-start", marginTop: "10px" }}>
                
                {/* LADO IZQUIERDO */}
                <div style={{ flex: 2.3, display: "flex", flexDirection: "column" }}>
                  <div style={{ position: "relative", marginLeft: "80px" }}>
                    <div style={{ 
                      backgroundColor: pedidoActivo.colorTheme.main,
                      borderRadius: "35px", 
                      padding: "30px 40px 30px 200px",
                      color: "white", 
                      minHeight: "260px",
                      minWidth: "450px", 
                      display: "flex", 
                      alignItems: "flex-start",
                      gap: "30px",
                      boxShadow: `0px 10px 25px ${pedidoActivo.colorTheme.main}40`
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "40px", borderBottom: "4px solid rgba(255, 255, 255, 0.3)", paddingBottom: "10px" }}>
                          <span style={{ fontSize: "32px", fontWeight: "bold" }}>{productoActual?.nombre}</span>
                          {productoActual?.tamano && <span style={{ fontSize: "26px", opacity: 0.9 }}>| {productoActual.tamano}</span>}
                          {productoActual?.orillaQueso && (
                            <span style={{ backgroundColor: "#F3A123", color: "white", padding: "6px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold", marginLeft: "auto" }}>
                              Orilla queso
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <p style={{ fontSize: "20px", margin: 0 }}>
                            <strong style={{ opacity: 0.8 }}>Extras:</strong> {productoActual?.extras || "Ninguno"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ position: "absolute", left: "-140px", top: "50%", transform: "translateY(-50%)" }}>
                      <img 
                        src={pizzaImage}
                        alt="Producto" 
                        style={{ 
                          width: "320px", 
                          height: "320px", 
                          borderRadius: "50%", 
                          objectFit: "cover",
                          boxShadow: "0px 8px 20px rgba(0,0,0,0.2)",
                        }} 
                      />
                    </div>
                  </div>
                  
                  {productoActual?.esPizza && (
                    <div style={{ display: "flex", alignItems: "center", marginTop: "30px", gap: "20px", paddingLeft: "10px" }}>
                      <span style={{ fontSize: "20px", fontWeight: "bold", color: "#555" }}>Fase actual:</span>
                      <Button
                        onClick={handleSiguienteFase}
                        style={{
                          backgroundColor: pedidoActivo.colorTheme.main,
                          color: "white",
                          border: "none",
                          borderRadius: "100px",
                          padding: "0 40px",
                          height: "45px",
                          fontSize: "18px",
                          fontWeight: "bold",
                          boxShadow: `0px 4px 10px ${pedidoActivo.colorTheme.main}40`
                        }}
                      >
                        {productoActual.fase}
                      </Button>
                    </div>
                  )}
                </div>

                {/* LADO DERECHO */}
                <div style={{ flex: 1, marginTop: "-40px", marginRight: "-180px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#777", display: "block", marginBottom: "15px", textAlign: "center" }}>
                    Productos
                  </span>
                  <div style={{ backgroundColor: "#2A2C2E", borderRadius: "25px", padding: "20px", display: "flex", flexDirection: "column", gap: "15px", maxHeight: "480px", overflowY: "auto" }}>
                    {pedidoActivo.productos.map((prod) => (
                      <div
                        key={prod.id_detalle || prod.id_producto}
                        onClick={() => setProductoActual(prod)}
                        style={{
                          border: productoActual?.id_detalle === prod.id_detalle ? "none" : "1px solid #555",
                          borderRadius: "12px",
                          padding: "18px 15px",
                          color: "white",
                          cursor: "pointer",
                          textAlign: "center",
                          fontSize: "18px",
                          fontWeight: "500",
                          backgroundColor: productoActual?.id_detalle === prod.id_detalle ? "#444" : "transparent",
                          boxShadow: productoActual?.id_detalle === prod.id_detalle ? "inset 0 0 4px rgba(255,255,255,0.2)" : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {prod.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "60px" }}>
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>
                  Tiempo transcurrido: <span style={{ fontFamily: "monospace", fontSize: "24px", marginLeft: "10px" }}>{formatTiempo(segundos)}</span>
                </span>

                <Button
                  onClick={handleTerminarPedido}
                  style={{
                    backgroundColor: "#7CD97C",
                    color: "white",
                    border: "none",
                    borderRadius: "100px",
                    width: "200px",
                    height: "55px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    boxShadow: "0px 6px 15px rgba(124,217,124,0.3)",
                  }}
                >
                  Terminar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cocina;