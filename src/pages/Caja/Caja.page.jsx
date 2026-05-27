// src/pages/Productos/Caja.page.jsx

import { Button, Spin, Modal } from "antd";

const CajaModales = ({ modalType, setModalType, cajaHoy, estimado, montoInput, setMontoInput, ejecutarApertura, ejecutarCierre, loadingCaja, showSuccess, setShowSuccess, successData }) => {
  
  // Si no hay ningún modal activo, este componente no dibuja nada en pantalla
  if (!modalType && !showSuccess) return null;

  return (
    <>
      {/* ======================================================== */}
      {/* --- SECCIÓN CAPA SUPERPUESTA (MODALES OSCUROS) -------- */}
      {/* ======================================================== */}

      {/* Modal Formulario Apertura */}
      {modalType === 'abrir' && (
        <div style={styles.overlay}>
          <div style={styles.modalDark}>
            <div onClick={() => setModalType(null)} style={styles.closeBtn}>X</div>
            <h2 style={styles.modalTitle}>Apertura de caja</h2>
            <p style={styles.modalSub}>Registrar monto inicial</p>
            <div style={styles.inputWrapper}>
              <input 
                type="number" 
                value={montoInput} 
                onChange={(e) => setMontoInput(e.target.value)}
                style={styles.hugeInput} 
                placeholder="$1600"
              />
            </div>
            <button onClick={ejecutarApertura} disabled={loadingCaja} style={styles.btnSubmit}>
              {loadingCaja ? <Spin size="small" /> : "Registrar"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Info Caja Ya Abierta */}
      {modalType === 'info' && (
        <div style={styles.overlay}>
          <div style={styles.modalDark}>
            <h2 style={styles.modalTitle}>Apertura de caja</h2>
            <p style={styles.modalSub}>La caja ya tiene un registro de apertura:</p>
            <div style={styles.infoBox}>
              <span>{cajaHoy?.usuario || "Alex López"}</span>
              <span> — </span>
              <strong>${cajaHoy?.montoInicial || "1600"}</strong>
            </div>
            <button onClick={() => setModalType(null)} style={styles.btnSubmit}>Okay</button>
          </div>
        </div>
      )}

      {/* Modal Formulario Cierre */}
      {modalType === 'cerrar' && (
        <div style={styles.overlay}>
          <div style={styles.modalDark}>
            <div onClick={() => setModalType(null)} style={styles.closeBtn}>X</div>
            <h2 style={styles.modalTitle}>Cierre de caja</h2>
            <div style={styles.rowInfo}>
              <div>
                <span style={{ color: "#aaa", fontSize: "14px" }}>Monto inicial</span>
                <p style={{ color: "#fff", fontWeight: "bold", fontSize: "18px", margin: "5px 0" }}>${cajaHoy?.montoInicial}</p>
              </div>
              <div>
                <span style={{ color: "#aaa", fontSize: "14px" }}>Final estimado</span>
                <p style={{ color: "#fff", fontWeight: "bold", fontSize: "18px", margin: "5px 0" }}>${estimado?.montoEstimado}</p>
              </div>
            </div>
            <p style={styles.modalSub}>Registrar monto final</p>
            <div style={styles.inputWrapper}>
              <input 
                type="number" 
                value={montoInput} 
                onChange={(e) => setMontoInput(e.target.value)}
                style={styles.hugeInput} 
                placeholder="$4600"
              />
            </div>
            <button onClick={ejecutarCierre} disabled={loadingCaja} style={styles.btnSubmit}>
              {loadingCaja ? <Spin size="small" /> : "Registrar"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Error Caja No Inicializada */}
      {modalType === 'error_cierre' && (
        <div style={styles.overlay}>
          <div style={styles.modalDark}>
            <h2 style={styles.modalTitle}>Cierre de caja</h2>
            <p style={{ ...styles.modalSub, padding: "0 10px", lineHeight: "1.6" }}>
              No se ha realizado una apertura de caja en el día. <br />
              Inicialice la caja para poder finalizarla.
            </p>
            <button onClick={() => setModalType(null)} style={styles.btnSubmit}>Okay</button>
          </div>
        </div>
      )}

      {/* --- MODAL DE ÉXITO VERDE DE ANT DESIGN --- */}
      <Modal
        open={showSuccess}
        footer={null}
        closable={false}
        centered
        width={380}
        styles={{ body: { backgroundColor: "#2ECC71", borderRadius: "18px", padding: "35px 20px", textAlign: "center" } }}
      >
        <div style={styles.successCheck}>✓</div>
        <h2 style={{ color: "#fff", fontWeight: "700", fontSize: "22px", marginTop: "15px" }}>{successData.title}</h2>
        <p style={{ color: "#fff", opacity: 0.9, fontSize: "14px", marginBottom: "25px" }}>{successData.text}</p>
        <Button onClick={() => setShowSuccess(false)} style={styles.btnSuccessOk}>
          Okay
        </Button>
      </Modal>
    </>
  );
};

// --- ESTILOS DE LOS MODALES OSCUROS ---
const styles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 },
  modalDark: { backgroundColor: "#2A2C2A", width: "460px", borderRadius: "20px", padding: "35px", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" },
  modalTitle: { color: "#F39C12", fontSize: "24px", fontWeight: "600", margin: 0 },
  modalSub: { color: "#fff", fontSize: "14px", marginTop: "15px", marginBottom: "15px", textAlign: "center", opacity: 0.9 },
  closeBtn: { position: "absolute", top: "15px", right: "20px", color: "#D9534F", fontSize: "20px", fontWeight: "bold", cursor: "pointer" },
  inputWrapper: { backgroundColor: "#404340", borderRadius: "12px", width: "85%", padding: "8px", display: "flex", justifyContent: "center", marginBottom: "20px" },
  hugeInput: { backgroundColor: "transparent", border: "none", color: "#fff", fontSize: "28px", fontWeight: "600", textAlign: "center", outline: "none", width: "100%" },
  btnSubmit: { backgroundColor: "#ECEFEA", color: "#2A2C2A", border: "none", borderRadius: "12px", padding: "8px 25px", fontWeight: "bold", cursor: "pointer", alignSelf: "flex-end", marginTop: "10px" },
  infoBox: { color: "#fff", fontSize: "20px", margin: "15px 0 25px 0", display: "flex", gap: "10px", alignItems: "center" },
  rowInfo: { display: "flex", justifyContent: "space-around", width: "100%", textAlign: "center", marginBottom: "15px" },
  
  successCheck: { width: "65px", height: "65px", border: "3px solid #fff", borderRadius: "50%", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", fontSize: "32px" },
  btnSuccessOk: { backgroundColor: "#27AE60", color: "#fff", border: "none", borderRadius: "20px", padding: "0 35px", fontWeight: "600", height: "36px" }
};

export default CajaModales;