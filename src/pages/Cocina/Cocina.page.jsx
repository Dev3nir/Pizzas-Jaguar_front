import { Button } from "antd";
import { useState, useEffect } from "react";
import axios from 'axios';
import HeaderComponent from "../../components/HeaderCocina.component.jsx";
import Logo from "../../assets/logos/logo.png";
import pizzaImage from '../../assets/pizz.png';
import API_URL from "../../config/backend.js";

// ENUM para las fases de la Pizza
const FASES_PIZZA = {
  AMASADO: "Amasado",
  VESTIDA: "Vestida",
  HORNEADA: "Horneada",
};

const Cocina = () => {
  // ========== ESTADOS ==========
  const [pedidos, setPedidos] = useState([]);
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [pedidoSeleccionadoId, setPedidoSeleccionadoId] = useState(null);
  const [productoActual, setProductoActual] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const [cronometroActivo, setCronometroActivo] = useState(false);

  // ========== ESTILOS REUTILIZABLES (DENTRO del componente) ==========
  const itemPedidoStyle = {
    color: "white",
    cursor: "pointer",
    display: "flex",
    transition: "all 0.3s ease",
    overflow: "hidden",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    backgroundColor: "#E13A30", // COLOR FIJO ROJO
  };

  const divisorVertical = {
    width: "1px",
    height: "25px",
    backgroundColor: "rgba(255,255,255,0.4)",
    margin: "0 20px",
  };

  // ==
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

  // ========== FUNCIONES DE BD ==========

  // Función para generar folio con prefijo según tipo de pedido
const generateFolio = (pedido) => {
  // Obtener el ID numérico del pedido (ej: de "123" o "001M")
  let numeroId = pedido.id_pedido;
  
  // Si el id_pedido es numérico, lo usamos directamente
  // Si ya tiene formato mixto, extraemos la parte numérica
  if (typeof pedido.id_pedido === 'string') {
    const match = pedido.id_pedido.match(/\d+/);
    numeroId = match ? match[0] : pedido.id_pedido;
  }
  
  // Formatear a 3 dígitos (001, 002, 015, 123, etc.)
  const folioNumero = String(numeroId).padStart(3, '0');
  
  // Determinar la letra según el tipo de pedido
  let letra = '';
  const tipo = (pedido.tipo_pedido || '').toLowerCase();
  
  if (tipo === 'Domicilio') {
    letra = 'D';
  } else if (tipo === 'Mostrador') {
    letra = 'M';
  } else if (tipo === 'Salón' || tipo === 'Salon') {
    letra = 'S';
  } else if (tipo === 'Rappi') {
    letra = 'R';
  } else {
    letra = ''; // Si no hay tipo, sin letra
  }
  
  return `${folioNumero}${letra}`;
};

const cargarPedidos = async () => {
  try {
    const url = `${API_URL}/cocina/`;
    const response = await axios.get(url);
    
    // Procesar los pedidos para agregar el folio generado
    const pedidosConFolio = response.data.map(pedido => ({
      ...pedido,
      folio: generateFolio(pedido) // Agregar el folio generado
    }));
    
    setPedidos(pedidosConFolio);
  } catch (error) {
    console.error("Error cargando pedidos:", error);
  }
};

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

  // ========== MANEJADORES ==========
  
  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

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
        extras: prod.extras?.map(e => e.insumo_nombre).join(', ') || "Ninguno",
        observaciones: prod.observaciones || "Ninguna",
        imagen: pizzaImage
      }));
      
      const pedidoConFases = { ...pedido, productos: productosConFase };
      
      setPedidoActivo(pedidoConFases);
      setProductoActual(productosConFase[0]);
      setPedidoSeleccionadoId(null);
      setSegundos(0);
      setCronometroActivo(true);
      
      await cargarPedidos();
    } catch (error) {
      console.error("Error al iniciar pedido:", error);
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
      const resultado = await cambiarAFinalizado(pedidoActivo.id_pedido);
      alertSuccess(resultado.message || `Pedido terminado correctamente`);
      setCronometroActivo(false);
      setPedidoActivo(null);
      setProductoActual(null);
      setSegundos(0);
      await cargarPedidos();
    } catch (error) {
      console.error("Error al terminar pedido:", error);
      const mensajeError = error.response?.data?.error || error.message || "No se pudo terminar el pedido";
      alertError(mensajeError);
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

                  return (
                    <div
                      key={pedido.id_pedido}
                      onClick={() => handleSelectPedido(pedido.id_pedido)}
                      style={{
                        ...itemPedidoStyle,
                        backgroundColor: isDesplegado ? "#aa2f29" : "#E13A30", // COLOR FIJO
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
            // PANTALLA 3 (tu código actual de pedido activo - se mantiene igual)
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#333", marginBottom: "35px" }}>
                Pedido actual
              </h2>

              <div style={{ display: "flex", gap: "50px", alignItems: "flex-start", marginTop: "10px" }}>
                
                {/* LADO IZQUIERDO */}
                <div style={{ flex: 2.3, display: "flex", flexDirection: "column" }}>
                  <div style={{ position: "relative", marginLeft: "80px" }}>
                    <div style={{ 
                      backgroundColor: "#E13A30", 
                      borderRadius: "35px", 
                      padding: "30px 40px 30px 200px",
                      color: "white", 
                      minHeight: "260px",
                      minWidth: "450px", 
                      display: "flex", 
                      alignItems: "flex-start",
                      gap: "30px",
                      boxShadow: "0px 10px 25px rgba(225,58,48,0.15)"
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "40px", borderBottom: "4px solid rgba(182, 43, 43, 0.86)", paddingBottom: "10px" }}>
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
                          backgroundColor: "#E13A30",
                          color: "white",
                          border: "none",
                          borderRadius: "100px",
                          padding: "0 40px",
                          height: "45px",
                          fontSize: "18px",
                          fontWeight: "bold",
                          boxShadow: "0px 4px 10px rgba(225,58,48,0.2)"
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