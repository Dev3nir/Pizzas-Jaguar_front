// src/pages/admin/Inventario.page.jsx

import {
  Layout,
  Typography,
  Spin,
  message,
  Button,
} from "antd";

import { useEffect, useState } from "react";
import axios from "axios";

import HeaderComponent from "../../components/Header.component";
import MenuAdmin from "../../components/Menu_admin.componente";

import Logo from "../../assets/logos/logo.png";
import API_URL from "../../config/backend.js";

import {
  alertSuccess,
  alertError,
} from "../../utils/alerts.js";

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

const Inventario = () => {
  const isTablet = useResponsive();
  const headerHeight = isTablet ? 70 : 90;

  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(false);
const [token, setToken] = useState(localStorage.getItem("token") || null);
useEffect(() => {
        if (!token) {
            window.location.href = "/";
        }
    }, [token]);
  // MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FORM
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [nivelMinimo, setNivelMinimo] = useState("");
  const [unidad, setUnidad] = useState("");
  const [costoUnitario, setCostoUnitario] = useState("");

  // EDIT
  const [isEdit, setIsEdit] = useState(false);
  const [idInsumo, setIdInsumo] = useState(null);

  // DETALLE
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // MERMAS
  const [mermas, setMermas] = useState([]);
  const [tiposMerma, setTiposMerma] = useState([]);
  const [isMermaModalOpen, setIsMermaModalOpen] = useState(false);
  const [isMermaHistorialModalOpen, setIsMermaHistorialModalOpen] = useState(false);
  const [selectedInsumoParaMerma, setSelectedInsumoParaMerma] = useState(null);
  const [cantidadMerma, setCantidadMerma] = useState("");
  const [tipoMermaId, setTipoMermaId] = useState("");
  const [comentariosMerma, setComentariosMerma] = useState("");

  // Obtener mermas
  const getMermas = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventario/mermas`);
      setMermas(response.data);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar historial de mermas");
    }
  };

  // Obtener tipos de merma
  const getTiposMerma = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventario/tipos-merma`);
      setTiposMerma(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Registrar merma
  const handleRegistrarMerma = async () => {
    if (!cantidadMerma || !tipoMermaId) {
      message.warning("Completa todos los campos");
      return;
    }

    try {
      await axios.post(`${API_URL}/inventario/mermas`, {
        id_insumo: selectedInsumoParaMerma.id_insumo,
        cantidad: parseFloat(cantidadMerma),
        id_tipo_merma: parseInt(tipoMermaId),
        comentarios: comentariosMerma
      });

      alertSuccess("Merma registrada correctamente");
      setIsMermaModalOpen(false);
      getInventario(); // Actualizar inventario
      getMermas(); // Actualizar historial
      limpiarFormularioMerma();
    } catch (error) {
      console.error(error);
      alertError("Error al registrar merma");
    }
  };

  const limpiarFormularioMerma = () => {
    setCantidadMerma("");
    setTipoMermaId("");
    setComentariosMerma("");
    setSelectedInsumoParaMerma(null);
  };

  // =========================
  // OBTENER INVENTARIO
  // =========================
  const getInventario = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/inventario/insumos`);

      setInventario(response.data);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInventario();
    getTiposMerma();
  }, []);

  // =========================
  // LIMPIAR FORMULARIO
  // =========================
  const limpiarFormulario = () => {
    setNombre("");
    setCantidad("");
    setNivelMinimo("");
    setUnidad("");
    setCostoUnitario("");

    setIsEdit(false);
    setIdInsumo(null);
  };

  // =========================
  // GUARDAR INSUMO
  // =========================
  const handleGuardar = async () => {
    if (
      !nombre.trim() ||
      !cantidad ||
      !nivelMinimo ||
      !unidad.trim() ||
      !costoUnitario
    ) {
      message.warning("Completa todos los campos");
      return;
    }

    const payload = {
      nombre,
      cantidad: parseFloat(cantidad),
      nivel_minimo: parseFloat(nivelMinimo),
      unidad,
      costo_unitario: parseFloat(costoUnitario),
    };

    try {
      setLoading(true);

      if (isEdit) {
        await axios.put(
          `${API_URL}/inventario/insumos/${idInsumo}`,
          payload
        );

        alertSuccess("Insumo actualizado correctamente");
      } else {
        await axios.post(
          `${API_URL}/inventario/insumos`,
          payload
        );

        alertSuccess("Insumo agregado correctamente");
      }

      limpiarFormulario();
      setIsModalOpen(false);

      getInventario();
    } catch (error) {
      console.error(error);

      const mensaje =
        error.response?.data?.message ||
        "Error al guardar el insumo";

      alertError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ELIMINAR
  // =========================
  const handleEliminar = async (id) => {
    try {
      setLoading(true);

      await axios.delete(`${API_URL}/inventario/insumos/${id}`);

      alertSuccess("Insumo eliminado correctamente");

      setIsDetailModalOpen(false);

      getInventario();
    } catch (error) {
      console.error(error);

      const mensaje =
        error.response?.data?.message ||
        "Error al eliminar";

      alertError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ABRIR EDIT
  // =========================
  const abrirEditar = (insumo) => {
    setIsEdit(true);

    setIdInsumo(insumo.id_insumo);

    setNombre(insumo.nombre);
    setCantidad(insumo.cantidad);
    setNivelMinimo(insumo.nivel_minimo);
    setUnidad(insumo.unidad);
    setCostoUnitario(insumo.costo_unitario);

    setIsDetailModalOpen(false);
    setIsModalOpen(true);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
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
            backgroundColor: "#535750",
            position: "fixed",
            left: 0,
            top: headerHeight,
            bottom: 0,
            overflow: "auto",
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
            {/* HEADER CONTENIDO */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "50px",
              }}
            >
              <Title
                level={2}
                style={{
                  margin: 25,
                  color: "#313131",
                  fontWeight: 700,
                  fontSize: "39px",
                }}
              >
                Inventario
              </Title>

              <Button
                type="primary"
                onClick={() => {
                  limpiarFormulario();
                  setIsModalOpen(true);
                }}
                style={{
                  backgroundColor: "#444B42",
                  color: "#97C56A",
                  borderRadius: "14px",
                  border: "3px solid #97C56A",
                  height: "50px",
                  width: "220px",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                Nuevo insumo
              </Button>

            </div>


            {/* LISTA */}
            <div
              className="scroll-container"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                overflowY: "auto",
                paddingRight: "10px",
                maxHeight: "65vh",
              }}
            >
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "100px",
                  }}
                >
                  <Spin size="large" />
                </div>
              ) : inventario.length > 0 ? (
                inventario.map((item) => (
                  <div
                    key={item.id_insumo}
                    onClick={() => {
                      setSelectedInsumo(item);
                      setIsDetailModalOpen(true);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#FFFFFF",
                      border: "4px solid #97C56A",
                      borderRadius: "16px",
                      padding: "18px 24px",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                  >
                    <Text
                      style={{
                        flex: 2,
                        fontWeight: 600,
                        fontSize: "22px",
                      }}
                    >
                      {item.nombre}
                    </Text>

                    <Text
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: "18px",
                      }}
                    >
                      Stock: {item.cantidad}
                    </Text>

                    <Text
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: "18px",
                      }}
                    >
                      Min: {item.nivel_minimo}
                    </Text>

                    <Text
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: "18px",
                      }}
                    >
                      {item.unidad}
                    </Text>

                    <Text
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: "18px",
                      }}
                    >
                      ${item.costo_unitario}
                    </Text>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "80px",
                  }}
                >
                  <Text>No hay insumos registrados</Text>
                </div>
              )}
              <Button
                type="primary"
                onClick={() => {
                  getMermas();
                  setIsMermaHistorialModalOpen(true);
                }}
                style={{
                  backgroundColor: "#444B42",
                  color: "#F1A139",
                  borderRadius: "14px",
                  border: "3px solid #F1A139",
                  height: "50px",
                  width: "220px",
                  fontWeight: "bold",
                  fontSize: "18px",
                  marginLeft: "15px",
                }}
              >
                Ver Mermas
              </Button>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* MODAL HISTORIAL DE MERMAS */}
      {isMermaHistorialModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "#383838",
              width: "700px",
              maxHeight: "80vh",
              borderRadius: "12px",
              padding: "24px 32px",
              position: "relative",
              overflow: "auto",
            }}
          >
            <div
              onClick={() => setIsMermaHistorialModalOpen(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "24px",
                color: "#E73F3F",
                fontSize: "24px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              X
            </div>

            <h2
              style={{
                color: "#F1A139",
                marginBottom: "24px",
              }}
            >
              Historial de Mermas
            </h2>

            {mermas.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  maxHeight: "60vh",
                  overflowY: "auto",
                  paddingRight: "10px",
                }}
              >
                {mermas.map((merma) => (
                  <div
                    key={merma.id_merma}
                    style={{
                      backgroundColor: "#2a2a2a",
                      borderRadius: "8px",
                      padding: "16px",
                      borderLeft: `4px solid ${merma.tipo_merma === "Caducidad"
                          ? "#E73F3F"
                          : merma.tipo_merma === "Rotura"
                            ? "#F1A139"
                            : "#97C56A"
                        }`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <Text
                        style={{
                          color: "#F1A139",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        {merma.insumo}
                      </Text>
                      <Text
                        style={{
                          color: "#E6E6E6",
                          fontSize: "14px",
                        }}
                      >
                        {new Date(merma.fecha).toLocaleString()}
                      </Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        marginBottom: "8px",
                      }}
                    >
                      <Text style={{ color: "#fff" }}>
                        Cantidad: <span style={{ color: "#97C56A", fontWeight: "bold" }}>{merma.cantidad} {merma.unidad}</span>
                      </Text>
                      <Text style={{ color: "#fff" }}>
                        Tipo: <span style={{ color: "#F1A139" }}>{merma.tipo_merma}</span>
                      </Text>
                    </div>

                    {merma.comentarios && (
                      <Text
                        style={{
                          color: "#A3A3A3",
                          fontSize: "14px",
                          fontStyle: "italic",
                        }}
                      >
                        Comentarios: {merma.comentarios}
                      </Text>

                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                }}
              >

                <Text style={{ color: "#E6E6E6" }}>
                  No hay registros de mermas
                </Text>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR MERMA */}
      {isMermaModalOpen && selectedInsumoParaMerma && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2100,
          }}
        >
          <div
            style={{
              backgroundColor: "#383838",
              width: "500px",
              borderRadius: "12px",
              padding: "24px 32px",
              position: "relative",
            }}
          >
            <div
              onClick={() => {
                setIsMermaModalOpen(false);
                limpiarFormularioMerma();
              }}
              style={{
                position: "absolute",
                top: "20px",
                right: "24px",
                color: "#E73F3F",
                fontSize: "24px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              X
            </div>

            <h2
              style={{
                color: "#F1A139",
                marginBottom: "24px",
              }}
            >
              Registrar Merma - {selectedInsumoParaMerma.nombre}
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div>
                <label style={{ color: "#fff", display: "block", marginBottom: "8px" }}>
                  Tipo de Merma
                </label>
                <select
                  value={tipoMermaId}
                  onChange={(e) => setTipoMermaId(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "6px",
                    padding: "0 10px",
                    backgroundColor: "#E6E6E6",
                    border: "none",
                    outline: "none",
                  }}
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposMerma.map((tipo) => (
                    <option key={tipo.id_tipo_merma} value={tipo.id_tipo_merma}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ color: "#fff", display: "block", marginBottom: "8px" }}>
                  Cantidad a descontar
                </label>
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={cantidadMerma}
                  onChange={(e) => setCantidadMerma(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "6px",
                    padding: "0 10px",
                    backgroundColor: "#E6E6E6",
                    border: "none",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ color: "#fff", display: "block", marginBottom: "8px" }}>
                  Comentarios (opcional)
                </label>
                <textarea
                  placeholder="Comentarios"
                  value={comentariosMerma}
                  onChange={(e) => setComentariosMerma(e.target.value)}
                  rows="3"
                  style={{
                    width: "100%",
                    borderRadius: "6px",
                    padding: "10px",
                    backgroundColor: "#E6E6E6",
                    border: "none",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "30px",
              }}
            >
              <button
                onClick={handleRegistrarMerma}
                style={{
                  backgroundColor: "#545753",
                  color: "#97C56A",
                  border: "none",
                  borderRadius: "20px",
                  padding: "8px 24px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Registrar Merma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO / EDITAR */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "#383838",
              width: "550px",
              borderRadius: "12px",
              padding: "24px 32px",
              position: "relative",
            }}
          >
            <div
              onClick={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "24px",
                color: "#E73F3F",
                fontSize: "24px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              X
            </div>

            <h2
              style={{
                color: "#F1A139",
                marginBottom: "24px",
              }}
            >
              {isEdit ? "Editar Insumo" : "Nuevo Insumo"}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <label style={{ color: "#fff" }}>
                  Nombre
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ color: "#fff" }}>
                  Unidad
                </label>

                <input
                  type="text"
                  value={unidad}
                  onChange={(e) =>
                    setUnidad(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ color: "#fff" }}>
                  Cantidad
                </label>

                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) =>
                    setCantidad(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ color: "#fff" }}>
                  Nivel mínimo
                </label>

                <input
                  type="number"
                  value={nivelMinimo}
                  onChange={(e) =>
                    setNivelMinimo(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ color: "#fff" }}>
                  Costo unitario
                </label>

                <input
                  type="number"
                  value={costoUnitario}
                  onChange={(e) =>
                    setCostoUnitario(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "30px",
              }}
            >
              <button
                onClick={handleGuardar}
                style={{
                  backgroundColor: "#545753",
                  color: "#F1A139",
                  border: "none",
                  borderRadius: "20px",
                  padding: "8px 24px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {isDetailModalOpen && selectedInsumo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "#383838",
              width: "500px",
              borderRadius: "12px",
              padding: "24px 32px",
              position: "relative",
            }}
          >
            <div
              onClick={() => setIsDetailModalOpen(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "24px",
                color: "#E73F3F",
                fontSize: "24px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              X
            </div>

            <h2
              style={{
                color: "#F1A139",
                marginBottom: "24px",
              }}
            >
              Detalle del insumo
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <Text style={detailStyle}>
                Nombre: {selectedInsumo.nombre}
              </Text>

              <Text style={detailStyle}>
                Cantidad: {selectedInsumo.cantidad}
              </Text>

              <Text style={detailStyle}>
                Nivel mínimo: {selectedInsumo.nivel_minimo}
              </Text>

              <Text style={detailStyle}>
                Unidad: {selectedInsumo.unidad}
              </Text>

              <Text style={detailStyle}>
                Costo unitario: $
                {selectedInsumo.costo_unitario}
              </Text>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "30px",
              }}
            >
              <button
                onClick={() => {
                  setSelectedInsumoParaMerma(selectedInsumo);
                  setIsMermaModalOpen(true);
                  setIsDetailModalOpen(false);
                }}
                style={{
                  backgroundColor: "#545753",
                  color: "#97C56A",
                  border: "none",
                  borderRadius: "20px",
                  padding: "8px 24px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Registrar Merma
              </button>
              <button
                onClick={() => abrirEditar(selectedInsumo)}
                style={editButton}
              >
                Editar
              </button>

              <button
                onClick={() =>
                  handleEliminar(selectedInsumo.id_insumo)
                }
                style={deleteButton}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCROLL */}
      <style>{`
        .scroll-container::-webkit-scrollbar {
          width: 8px;
        }

        .scroll-container::-webkit-scrollbar-thumb {
          background-color: #A3A3A3;
          border-radius: 10px;
        }
      `}</style>
    </Layout>
  );
};

const inputStyle = {
  width: "100%",
  height: "36px",
  border: "none",
  borderRadius: "6px",
  marginTop: "8px",
  padding: "0 10px",
  outline: "none",
  backgroundColor: "#E6E6E6",
};

const detailStyle = {
  color: "#fff",
  fontSize: "16px",
};

const editButton = {
  backgroundColor: "#545753",
  color: "#F1A139",
  border: "none",
  borderRadius: "20px",
  padding: "8px 24px",
  fontWeight: "bold",
  cursor: "pointer",
};

const deleteButton = {
  backgroundColor: "#545753",
  color: "#E73F3F",
  border: "none",
  borderRadius: "20px",
  padding: "8px 24px",
  fontWeight: "bold",
  cursor: "pointer",
};

export default Inventario;