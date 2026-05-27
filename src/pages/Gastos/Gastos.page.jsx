// src/pages/admin/Gastos.page.jsx

import { Layout, Button, Typography, Spin, message, Modal } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import HeaderComponent from "../../components/Header.component";
import MenuAdmin from "../../components/Menu_admin.componente";
import Logo from "../../assets/logos/logo.png";
import API_URL from "../../config/backend.js";

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

const GastosPage = () => {
  const isTablet = useResponsive();
  const headerHeight = isTablet ? 70 : 90;

  // --- ESTADOS PRINCIPALES ---
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState(null);

  // --- CONTROL DE MODALES ---
  const [modalType, setModalType] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    text: "",
    onConfirm: () => {}
  });

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    text: ""
  });

  // --- ESTADOS DE FORMULARIO ---
  const [formConcepto, setFormConcepto] = useState("");
  const [formMonto, setFormMonto] = useState("");
  const [formIdCategoria, setFormIdCategoria] = useState("");
  const [formComentarios, setFormComentarios] = useState("");
  const [formUsaCaja, setFormUsaCaja] = useState(false);
  const [formTieneFactura, setFormTieneFactura] = useState(false);
  const [formFactura, setFormFactura] = useState("");

  // --- OBTENER GASTOS ---
  const getGastos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/gastos/`);
      setGastos(response.data);
    } catch (error) {
      console.error("Error fetching gastos:", error);
      message.error("Error al cargar la lista de gastos");
    } finally {
      setLoading(false);
    }
  };

  // --- OBTENER CATEGORÍAS ---
  const getCategorias = async () => {
    try {
      const response = await axios.get(`${API_URL}/gastos/categorias`);
      setCategorias(response.data);
      if (response.data.length > 0) {
        setFormIdCategoria(response.data[0].id_categoria_gasto);
      }
    } catch (error) {
      console.error("Error fetching categorias:", error);
      message.error("Error al cargar las categorías");
    }
  };

  useEffect(() => {
    getGastos();
    getCategorias();
  }, []);

  // --- LIMPIAR FORMULARIO ---
  const resetForm = () => {
    setFormConcepto("");
    setFormMonto("");
    setFormIdCategoria(categorias.length > 0 ? categorias[0].id_categoria_gasto : "");
    setFormComentarios("");
    setFormUsaCaja(false);
    setFormTieneFactura(false);
    setFormFactura("");
  };

  // --- ABRIR EDICIÓN ---
  const handleOpenEdit = (gasto) => {
    setSelectedGasto(gasto); // 🛠️ FIJADO: Ahora sí se guarda la referencia del gasto a editar
    setFormConcepto(gasto.concepto || "");
    setFormMonto(gasto.monto || "");
    setFormIdCategoria(gasto.id_categoria_gasto || "");
    setFormComentarios(gasto.comentarios || "");
    setFormUsaCaja(!!gasto.id_caja);
    setFormTieneFactura(!!gasto.factura);
    setFormFactura(gasto.factura || "");
    setModalType('editar');
  };

  // --- CONSTRUIR PAYLOAD ---
  const buildPayload = () => ({
    concepto: formConcepto.trim(),
    monto: parseFloat(formMonto),
    id_categoria: parseInt(formIdCategoria),
    comentarios: formComentarios.trim() || null,
    usaCaja: formUsaCaja,
    factura: formTieneFactura ? formFactura.trim() || null : null
  });

  // --- VALIDACIONES ---
  const preGuardarGasto = () => {
    if (!formConcepto.trim() || !formMonto || parseFloat(formMonto) <= 0) {
      message.error("Por favor completa el concepto y define un monto válido.");
      return;
    }
    if (!formIdCategoria) {
      message.error("Por favor selecciona una categoría.");
      return;
    }
    if (formTieneFactura && !formFactura.trim()) {
      message.error("Por favor ingresa el folio de la factura.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "¿Confirmar el registro?",
      text: "Confirme el registro del gasto",
      onConfirm: ejecutarGuardarGasto
    });
  };

  const preEditarGasto = () => {
    if (!formConcepto.trim() || !formMonto || parseFloat(formMonto) <= 0) {
      message.error("Por favor completa el concepto y define un monto válido.");
      return;
    }
    if (!formIdCategoria) {
      message.error("Por favor selecciona una categoría.");
      return;
    }
    if (formTieneFactura && !formFactura.trim()) {
      message.error("Por favor ingresa el folio de la factura.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "¿Confirmar modificación?",
      text: "Confirme la actualización del gasto",
      onConfirm: ejecutarEditarGasto
    });
  };

  const preEliminarGasto = () => {
    setConfirmModal({
      isOpen: true,
      title: "¿Confirmar eliminación?",
      text: "Confirme la eliminación del gasto",
      onConfirm: ejecutarEliminarGasto // 🛠️ FIJADO: Apuntamos directamente a la función limpia
    });
  };

  // --- SOLICITUDES HTTP (AXIOS) ---
  const ejecutarGuardarGasto = async () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    try {
      await axios.post(`${API_URL}/gastos/`, buildPayload());
      setModalType(null);
      resetForm();
      getGastos();
      setSuccessModal({
        isOpen: true,
        title: "¡Registro exitoso!",
        text: "El gasto ha sido registrado con éxito"
      });
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.error || "Error al registrar el gasto");
    }
  };

  const ejecutarEditarGasto = async () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    if (!selectedGasto || !selectedGasto.id_gasto) {
      message.error("Error Interno: No se encontró el identificador del gasto.");
      return;
    }

    try {
      await axios.put(`${API_URL}/gastos/${selectedGasto.id_gasto}`, buildPayload());
      setModalType(null);
      resetForm();
      getGastos();
      setSuccessModal({
        isOpen: true,
        title: "¡Actualización exitosa!",
        text: "El gasto ha sido actualizado con éxito"
      });
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.error || "Error al actualizar el gasto");
    }
  };

  const ejecutarEliminarGasto = async () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    if (!selectedGasto || !selectedGasto.id_gasto) {
      message.error("Error Interno: No se encontró el gasto para eliminar.");
      return;
    }

    try {
      await axios.delete(`${API_URL}/gastos/${selectedGasto.id_gasto}`); // 🛠️ FIJADO: Consistencia en el ID
      setModalType(null);
      getGastos();
      message.success("Registro eliminado correctamente");
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.error || "No se pudo eliminar el gasto");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* HEADER */}
      <Header style={{
        padding: 0, height: headerHeight, lineHeight: `${headerHeight}px`,
        backgroundColor: "#fff", position: "fixed", top: 0, left: 0, width: "100%",
        zIndex: 1000, boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}>
        <HeaderComponent text="ADMINISTRADOR" logo={Logo} height={headerHeight} isTablet={isTablet} />
      </Header>

      <Layout>
        {/* MENU LATERAL */}
        <Sider width={260} style={{
          backgroundColor: "#535750", position: "fixed", left: 0, top: headerHeight, bottom: 0, overflow: "auto"
        }}>
          <MenuAdmin />
        </Sider>

        {/* CONTENIDO PRINCIPAL */}
        <Layout style={{ marginLeft: 260, marginTop: headerHeight, backgroundColor: "#FAFBFA" }}>
          <Content style={{ padding: "40px", minHeight: "calc(100vh - 90px)", display: "flex", flexDirection: "column" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
              <Title level={2} style={{ margin: 0, color: "#313131", fontWeight: 700, fontSize: "36px" }}>
                Gastos recientes
              </Title>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#fff", color: "#F1A139", borderRadius: "14px",
                  border: "2px solid #F1A139", height: "45px", width: "180px",
                  fontWeight: "bold", fontSize: "16px"
                }}
                onClick={() => { resetForm(); setModalType('nuevo'); }}
              >
                Nuevo gasto
              </Button>
            </div>

            {/* LISTADO DE GASTOS */}
            <div className="scroll-container" style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", maxHeight: "65vh", flex: 1 }}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                  <Spin size="large" />
                </div>
              ) : gastos.length > 0 ? (
                gastos.map((gasto) => (
                  <div
                    key={gasto.id_gasto}
                    onClick={() => { setSelectedGasto(gasto); setModalType('detalle'); }}
                    style={{
                      display: "flex", alignItems: "center", backgroundColor: "#FFFFFF",
                      border: "3px solid #F1A139", borderRadius: "16px", padding: "16px 24px", cursor: "pointer",
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.01)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <Text style={{ flex: 1.5, fontWeight: 500, fontSize: "20px", color: "#313131" }}>{gasto.concepto}</Text>
                    <div style={{ height: "24px", width: "1px", backgroundColor: "#D1D5CB", margin: "0 16px" }} />
                    <Text style={{ flex: 1, textAlign: "center", fontSize: "18px", fontWeight: "bold" }}>${gasto.monto}</Text>
                    <div style={{ height: "24px", width: "1px", backgroundColor: "#D1D5CB", margin: "0 16px" }} />
                    <Text style={{ flex: 1, textAlign: "center", fontSize: "18px" }}>{gasto.categoria || gasto.nombre_categoria || "Gasto"}</Text>
                    <div style={{ height: "24px", width: "1px", backgroundColor: "#D1D5CB", margin: "0 16px" }} />
                    <Text style={{ flex: 1.2, textAlign: "right", fontSize: "18px", color: "#666" }}>
                      {gasto.fecha ? new Date(gasto.fecha).toLocaleDateString() : ""}
                    </Text>
                  </div>
                ))
              ) : (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "100px" }}>
                  <Text style={{ fontSize: "22px", fontWeight: 500, color: "#555" }}>
                    No hay gastos registrados
                  </Text>
                </div>
              )}
            </div>

            {gastos.length > 0 && (
              <Text style={{ marginTop: "20px", color: "#888", fontSize: "14px" }}>
                Seleccione un gasto para consultar sus detalles
              </Text>
            )}

          </Content>
        </Layout>
      </Layout>

      {/* =========================================================
          MODAL DINÁMICO (REGISTRAR / EDITAR GASTO)
         ========================================================= */}
      {(modalType === 'nuevo' || modalType === 'editar') && (
        <div style={styles.overlay}>
          <div style={styles.modalDarkBox}>
            <div onClick={() => setModalType(null)} style={styles.closeBtn}>X</div>

            <h2 style={styles.modalTitle}>
              {modalType === 'nuevo' ? "Registrar gasto" : "Editar gasto"}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px' }}>

              {/* Concepto */}
              <div>
                <label style={styles.label}>Concepto</label>
                <input
                  type="text" value={formConcepto} onChange={(e) => setFormConcepto(e.target.value)}
                  placeholder="Ej: Gas" style={styles.input}
                />
              </div>

              {/* Monto */}
              <div>
                <label style={styles.label}>Monto</label>
                <div style={styles.montoWrapper}>
                  <span style={{ color: "#777", marginRight: "5px" }}>$</span>
                  <input
                    type="number" value={formMonto} onChange={(e) => setFormMonto(e.target.value)}
                    placeholder="0.00" style={{ ...styles.input, backgroundColor: "transparent", padding: 0 }}
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label style={styles.label}>Categoría</label>
                <select
                  value={formIdCategoria}
                  onChange={(e) => setFormIdCategoria(e.target.value)}
                  style={styles.select}
                >
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria_gasto} value={cat.id_categoria_gasto}>
                      {cat.nombre || cat.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" }}>

                {/* Toggle: ¿Dinero de caja? */}
                <div style={styles.toggleRow}>
                  <span style={styles.toggleLabel}>¿Se hizo con dinero de caja?</span>
                  <div style={styles.toggleSwitch} onClick={() => setFormUsaCaja(!formUsaCaja)}>
                    <span style={!formUsaCaja ? styles.toggleActiveNo : styles.toggleInactive}>No</span>
                    <span style={formUsaCaja ? styles.toggleActiveSi : styles.toggleInactive}>Sí</span>
                  </div>
                </div>

                {/* Toggle: ¿Tiene factura? */}
                <div style={styles.toggleRow}>
                  <span style={styles.toggleLabel}>¿Registrar gasto como factura?</span>
                  <div style={styles.toggleSwitch} onClick={() => { setFormTieneFactura(!formTieneFactura); setFormFactura(""); }}>
                    <span style={!formTieneFactura ? styles.toggleActiveNo : styles.toggleInactive}>No</span>
                    <span style={formTieneFactura ? styles.toggleActiveSi : styles.toggleInactive}>Sí</span>
                  </div>
                </div>

              </div>

              {/* Folio de factura */}
              {formTieneFactura && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Folio de factura</label>
                  <input
                    type="text" value={formFactura} onChange={(e) => setFormFactura(e.target.value)}
                    placeholder="Ej: FAC-2026-001" style={styles.input}
                  />
                </div>
              )}

              {/* Comentarios */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.label}>Comentarios</label>
                <textarea
                  rows={3} value={formComentarios} onChange={(e) => setFormComentarios(e.target.value)}
                  style={styles.textarea}
                />
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={modalType === 'nuevo' ? preGuardarGasto : preEditarGasto}
                style={styles.btnGuardar}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DETALLE DE GASTO
         ========================================================= */}
      {modalType === 'detalle' && selectedGasto && (
        <div style={styles.overlay}>
          <div style={styles.modalDarkBox}>
            <div onClick={() => setModalType(null)} style={styles.closeBtn}>X</div>

            <h2 style={styles.modalTitle}>Información de gasto</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px', marginBottom: "20px" }}>
              <div>
                <label style={styles.labelDetailHeader}>Concepto</label>
                <div style={styles.textDetailData}>{selectedGasto.concepto}</div>
              </div>
              <div>
                <label style={styles.labelDetailHeader}>Monto</label>
                <div style={{ ...styles.textDetailData, color: "#fff", fontWeight: "bold" }}>$ {selectedGasto.monto}</div>
              </div>
              <div>
                <label style={styles.labelDetailHeader}>Categoría</label>
                <div style={styles.textDetailData}>{selectedGasto.categoria || selectedGasto.nombre_categoria || "General"}</div>
              </div>
              <div>
                <label style={styles.labelDetailHeader}>Fecha</label>
                <div style={styles.textDetailData}>
                  {selectedGasto.fecha ? new Date(selectedGasto.fecha).toLocaleDateString() : ""}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedGasto.id_caja && (
                  <div style={styles.pillBadge}>Realizado con dinero de caja</div>
                )}
                {selectedGasto.factura && (
                  <div style={styles.pillBadge}>Factura: {selectedGasto.factura}</div>
                )}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.labelDetailHeader}>Comentarios</label>
                <div style={styles.textareaDetail}>
                  {selectedGasto.comentarios || "Sin comentarios"}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: "15px", marginTop: '30px' }}>
              <button onClick={() => handleOpenEdit(selectedGasto)} style={styles.btnEditar}>
                Editar
              </button>
              <button onClick={preEliminarGasto} style={styles.btnEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL CONFIRMACIÓN
         ========================================================= */}
      <Modal
        open={confirmModal.isOpen}
        footer={null}
        closable={false}
        centered
        width={360}
        zIndex={3000}
        bodyStyle={styles.confirmModalBody}
      >
        <div style={styles.iconCircleQuestion}>?</div>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: "15px 0 5px 0" }}>{confirmModal.title}</h3>
        <p style={{ color: "#777", fontSize: "14px", marginBottom: "25px" }}>{confirmModal.text}</p>
        <div style={{ display: "flex", gap: "15px", width: "100%" }}>
          <Button onClick={confirmModal.onConfirm} type="primary" style={styles.btnModalConfirm}>Confirmar</Button>
          <Button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} style={styles.btnModalCancel}>Cancelar</Button>
        </div>
      </Modal>

      {/* =========================================================
          MODAL ÉXITO
         ========================================================= */}
      <Modal
        open={successModal.isOpen}
        footer={null}
        closable={false}
        centered
        width={360}
        zIndex={3000}
        bodyStyle={styles.successModalBody}
      >
        <div style={styles.iconCircleCheck}>✓</div>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: "15px 0 5px 0" }}>{successModal.title}</h3>
        <p style={{ color: "#777", fontSize: "14px", marginBottom: "25px" }}>{successModal.text}</p>
        <Button onClick={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))} style={styles.btnModalOkay}>Okay</Button>
      </Modal>

      <style>{`
        .scroll-container::-webkit-scrollbar { width: 8px; }
        .scroll-container::-webkit-scrollbar-track { background: transparent; }
        .scroll-container::-webkit-scrollbar-thumb { background-color: #A3A3A3; border-radius: 10px; }
      `}</style>
    </Layout>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
  },
  modalDarkBox: {
    backgroundColor: '#383838', width: '600px', borderRadius: '12px', padding: '24px 32px', position: 'relative',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: 'sans-serif'
  },
  closeBtn: {
    position: 'absolute', top: '20px', right: '24px', color: '#E73F3F', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer'
  },
  modalTitle: { color: '#F1A139', margin: '0 0 24px 0', fontSize: '22px', fontWeight: 'bold' },
  label: { color: '#fff', display: 'block', marginBottom: '6px', fontSize: '14px' },
  input: {
    width: '100%', height: '36px', backgroundColor: '#E6E6E6', border: 'none', padding: '0 12px',
    outline: 'none', color: '#333', borderRadius: '6px', fontSize: '14px'
  },
  montoWrapper: {
    display: 'flex', alignItems: 'center', height: '36px', backgroundColor: '#E6E6E6', padding: '0 12px', borderRadius: '6px'
  },
  select: {
    width: '100%', height: '36px', backgroundColor: '#E6E6E6', border: 'none', padding: '0 8px',
    outline: 'none', color: '#333', borderRadius: '6px', fontSize: '14px', cursor: 'pointer'
  },
  textarea: {
    width: '100%', backgroundColor: '#E6E6E6', border: 'none', padding: '10px 12px',
    outline: 'none', color: '#333', borderRadius: '8px', fontSize: '14px', resize: 'none'
  },
  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  toggleLabel: { color: "#fff", fontSize: "12px" },
  toggleSwitch: {
    display: "flex", backgroundColor: "#777", borderRadius: "12px", padding: "2px", cursor: "pointer", width: "70px"
  },
  toggleInactive: { flex: 1, textAlign: "center", color: "#bbb", fontSize: "11px", padding: "2px 0" },
  toggleActiveSi: { flex: 1, textAlign: "center", color: "#fff", backgroundColor: "#4F9E4A", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", padding: "2px 0" },
  toggleActiveNo: { flex: 1, textAlign: "center", color: "#fff", backgroundColor: "#A3A3A3", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", padding: "2px 0" },
  btnGuardar: {
    backgroundColor: '#545753', color: '#F1A139', border: 'none', borderRadius: '20px',
    padding: '8px 30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px'
  },
  labelDetailHeader: { color: '#F1A139', display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: "500" },
  textDetailData: { color: '#E6E6E6', fontSize: '16px', padding: "4px 0" },
  pillBadge: {
    backgroundColor: "#555", color: "#ccc", borderRadius: "12px", padding: "4px 12px", fontSize: "11px", width: "fit-content"
  },
  textareaDetail: {
    border: "1px solid #666", borderRadius: "10px", padding: "10px", color: "#E6E6E6", fontSize: "14px", minHeight: "60px"
  },
  btnEditar: {
    backgroundColor: '#545753', color: '#fff', border: 'none', borderRadius: '20px',
    padding: '8px 24px', cursor: 'pointer', fontSize: '14px'
  },
  btnEliminar: {
    backgroundColor: '#E73F3F', color: '#fff', border: 'none', borderRadius: '20px',
    padding: '8px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: "bold"
  },
  confirmModalBody: { display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 20px" },
  successModalBody: { display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 20px" },
  iconCircleQuestion: {
    width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "#7FA4C7",
    color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "40px"
  },
  iconCircleCheck: {
    width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "#4CD964",
    color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "40px"
  },
  btnModalConfirm: { backgroundColor: "#7FA4C7", borderColor: "#7FA4C7", color: "#fff", flex: 1, borderRadius: "8px", height: "38px" },
  btnModalCancel: { backgroundColor: "#E73F3F", borderColor: "#E73F3F", color: "#fff", flex: 1, borderRadius: "8px", height: "38px" },
  btnModalOkay: { backgroundColor: "#4CD964", borderColor: "#4CD964", color: "#fff", width: "120px", borderRadius: "20px", height: "38px", fontWeight: "bold" }
};

export default GastosPage;