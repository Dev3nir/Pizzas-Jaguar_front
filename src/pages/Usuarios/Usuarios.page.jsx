// src/pages/admin/Usuarios.page.jsx

import { Layout, Button, Typography, Spin, message } from "antd";
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderComponent from "../../components/Header.component";
import MenuAdmin from "../../components/Menu_admin.componente"; 
import Logo from "../../assets/logos/logo.png";
import API_URL from "../../config/backend.js";

import { alertSuccess, alertError } from '../../utils/alerts.js';
import Swal from 'sweetalert2';

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

const UsuariosPage = () => {
  const navigate = useNavigate();
  const isTablet = useResponsive();
  const headerHeight = isTablet ? 70 : 90;

  // Estados para usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [idUsuarioSel, setIdUsuarioSel] = useState(null);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rolUsuario, setRolUsuario] = useState('');
  const [estadoUsuario, setEstadoUsuario] = useState(true);

  // Estados para edición
  const [editNombre, setEditNombre] = useState('');
  const [editNombreUsuario, setEditNombreUsuario] = useState('');
  const [editRolUsuario, setEditRolUsuario] = useState('');
  const [editEstadoUsuario, setEditEstadoUsuario] = useState(true);


  const [token, setToken] = useState(localStorage.getItem("token") || null);
useEffect(() => {
        if (!token) {
            window.location.href = "/";
        }
    }, [token]);
  // ==========================================
  // MÉTODOS DE API
  // ==========================================

  // Obtener todos los usuarios
  const getUsuarios = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/usuarios/`);
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error fetching usuarios:", error);
      message.error("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Cargar roles
  const cargarRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios/roles`);
      setRoles(response.data);
    } catch (error) {
      console.error("Error cargando roles:", error);
    }
  };

  // Guardar nuevo usuario
  const handleGuardarUsuario = async () => {
    if (!nombre.trim() || !nombreUsuario.trim() || !contrasena.trim() || !rolUsuario) {
      message.error("Por favor, completa todos los campos del usuario.");
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      nombreUsuario: nombreUsuario.trim(),
      contrasena: contrasena.trim(),
      id_rol: parseInt(rolUsuario)
    };

    try {
      setLoading(true);
      await axios.post(`${API_URL}/usuarios/`, payload);
      alertSuccess("Usuario creado exitosamente");
      
      setIsModalOpen(false);
      limpiarCampos();
      getUsuarios();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      const mensajeError = error.response?.data?.error || "No se pudo crear el usuario";
      message.error(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  // Ver detalle de usuario
  const verUsuario = async (idUsuario) => {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const response = await axios.get(`${API_URL}/usuarios/${idUsuario}`);
      setSelectedUsuario(response.data);
    } catch (error) {
      console.error("Error fetching usuario details:", error);
      message.error("Error al cargar los detalles del usuario");
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Abrir modal de edición
  const abrirModalEdicion = async (idUsuario) => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
    setDetailLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/usuarios/${idUsuario}`);
      const userData = response.data;
      
      setIdUsuarioSel(idUsuario);
      setEditNombre(userData.nombre);
      setEditNombreUsuario(userData.nombreUsuario);
      setEditRolUsuario(userData.id_rol);
      setEditEstadoUsuario(userData.estado === 1);
    } catch (error) {
      console.error("Error:", error);
      message.error("Error al cargar los datos del usuario");
      setIsEditModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Guardar cambios del usuario
  const handleGuardarCambios = async () => {
    if (!editNombre.trim() || !editNombreUsuario.trim() || !editRolUsuario) {
      message.error("El nombre, usuario y rol son obligatorios.");
      return;
    }

    const payload = {
      nombre: editNombre.trim(),
      nombreUsuario: editNombreUsuario.trim(),
      estado: editEstadoUsuario ? 1 : 0,
      id_rol: parseInt(editRolUsuario)
    };

    try {
      setLoading(true);
      await axios.put(`${API_URL}/usuarios/${idUsuarioSel}`, payload);
      alertSuccess("Usuario actualizado correctamente");
      setIsEditModalOpen(false);
      limpiarCamposEdicion();
      getUsuarios();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      message.error("No se pudo actualizar el usuario");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar Usuario
  const handleEliminarUsuario = async (idUsuario, nombreUser) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Estás seguro de que deseas eliminar permanentemente a "${nombreUser}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/usuarios/${idUsuario}`);
        alertSuccess('Usuario eliminado correctamente');
        getUsuarios();
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alertError("No se pudo eliminar el usuario");
      } finally {
        setLoading(false);
      }
    }
  };

  // Limpiar campos del formulario
  const limpiarCampos = () => {
    setNombre('');
    setNombreUsuario('');
    setContrasena('');
    setRolUsuario('');
  };

  const limpiarCamposEdicion = () => {
    setEditNombre('');
    setEditNombreUsuario('');
    setEditRolUsuario('');
    setEditEstadoUsuario(true);
    setIdUsuarioSel(null);
  };

  // Obtener nombre del rol por ID
const getNombreRol = (idRol) => {
    const rol = roles.find(r => r.id_rol === idRol);
    return rol ? rol.rol : 'Desconocido'; 
};
  useEffect(() => {
    getUsuarios();
    cargarRoles();
  }, []);

  // ==========================================
  // RENDER
  // ==========================================

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
                Usuarios actuales
              </Title>
              <Button
                type="primary"
                style={{
                  backgroundColor: "#FAFBFA",
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
                Agregar usuario
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
              ) : usuarios.length > 0 ? (
                usuarios.map((usuario) => {
                  const colorEstado = usuario.estado === 0 ? "#bb3737" : "#71a457";

                  return (
                    <div
                      key={usuario.id_usuario}
                      onClick={() => verUsuario(usuario.id_usuario)}
                      style={{
                        display: "flex",
                        alignItems: "stretch", 
                        backgroundColor: "#313131",
                        borderRadius: "16px", 
                        overflow: "hidden", 
                        cursor: "pointer",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.05)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.01)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.05)";
                      }}
                    >
                      {/* Sección izquierda */}
                      <div style={{
                        backgroundColor: colorEstado,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 46px",
                        fontSize: "34px",
                        color: "#313131"
                      }}>
                        <UserOutlined />
                      </div>

                      {/* Sección derecha */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                        padding: "16px 43px",
                      }}>
                        <Text style={{ flex: 1, fontWeight: 600, fontSize: "24px", color: "#FFFFFF" }}>
                          {usuario.nombre}
                        </Text>
                        
                        <div style={{ height: "28px", width: "3px", backgroundColor: colorEstado, margin: "0 80px" }} />
                        
                        <Text style={{ flex: 1, fontSize: "24px", color: "#FFFFFF" }}>
                          {usuario.rol}
                        </Text>
                        
                        <div 
                          style={{ display: "flex", gap: "180px", alignItems: "center", fontSize: "35px", marginLeft: "auto" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EditOutlined 
                            style={{ color: colorEstado, cursor: "pointer" }} 
                            onClick={() => abrirModalEdicion(usuario.id_usuario)}
                          />
                          <DeleteOutlined 
                            style={{ color: colorEstado, cursor: "pointer" }} 
                            onClick={() => handleEliminarUsuario(usuario.id_usuario, usuario.nombre)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "80px" }}>
                  <Text style={{ fontSize: "16px", fontWeight: 500, color: "#313131" }}>
                    No hay usuarios registrados en el sistema
                  </Text>
                </div>
              )}
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* MODAL DE DETALLE DEL USUARIO */}
      {isDetailModalOpen && (
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
            width: '600px',
            borderRadius: '12px',
            padding: '24px 32px',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            
            <div 
              onClick={() => setIsDetailModalOpen(false)}
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

            {detailLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
              </div>
            ) : selectedUsuario ? (
              <>
                <h2 style={{ color: '#F1A139', margin: '0 0 24px 0', fontSize: '20px', fontWeight: 'bold' }}>
                  Detalle del Usuario
                </h2>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    <div>
                      <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>Nombre completo</label>
                      <div style={{ display: 'flex', height: '40px', backgroundColor: '#383838', border: '1px solid #E6E6E6', alignItems: 'center', paddingLeft: '15px', borderRadius: '8px' }}>
                        <span style={{ color: '#E6E6E6', fontSize: '16px' }}>{selectedUsuario.nombre}</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>Nombre de usuario</label>
                      <div style={{ display: 'flex', height: '40px', backgroundColor: '#383838', border: '1px solid #E6E6E6', alignItems: 'center', paddingLeft: '15px', borderRadius: '8px' }}>
                        <span style={{ color: '#E6E6E6', fontSize: '16px' }}>{selectedUsuario.nombreUsuario}</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>Rol</label>
                      <div style={{ display: 'flex', height: '40px', backgroundColor: '#383838', border: '1px solid #E6E6E6', alignItems: 'center', paddingLeft: '15px', borderRadius: '8px' }}>
                        <span style={{ color: '#E6E6E6', fontSize: '16px' }}>{selectedUsuario.rol}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <span style={{ color: '#fff' }}>No se encontraron detalles para este usuario</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CREAR USUARIO */}
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
              Crear nuevo usuario
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 30px' }}>
              {/* Nombre */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nombre</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden', borderRadius: '4px' }}>
                  <input 
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ingresa el nombre"
                    style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555' }}
                  />
                </div>
              </div>

              {/* Rol del usuario - columna 2 */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Rol del usuario</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden', borderRadius: '4px' }}>
                  <select 
                    value={rolUsuario}
                    onChange={(e) => setRolUsuario(e.target.value)}
                    style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555', cursor: 'pointer', appearance: 'none' }}
                  >
                    <option value="">Selecciona un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id_rol} value={rol.id_rol}>{rol.rol}</option>
                    ))}
                  </select>
                  <div style={{ width: '32px', backgroundColor: '#D4D4D4', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontWeight: 'bold', borderLeft: '1px solid #C4C4C4', pointerEvents: 'none' }}>V</div>
                </div>
              </div>

              {/* Nombre de usuario */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nombre de usuario</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden', borderRadius: '4px' }}>
                  <input 
                    type="text"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    placeholder="Ingresa el nombre de usuario"
                    style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555' }}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Contraseña</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden', borderRadius: '4px' }}>
                  <input 
                    type="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="Ingresa la contraseña"
                    style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555' }}
                  />
                </div>
              </div>
            </div>

            {/* Botón Guardar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button 
                onClick={handleGuardarUsuario}
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
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN DE USUARIO */}
      {isEditModalOpen && (
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
            width: '600px',
            borderRadius: '12px',
            padding: '24px 32px',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            
            <div 
              onClick={() => setIsEditModalOpen(false)}
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
              Modificar Usuario
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 30px' }}>
              {/* Nombre */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nombre</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden', borderRadius: '4px' }}>
                  <input 
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    placeholder="Ingresa el nombre"
                    style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555' }}
                  />
                </div>
              </div>

              {/* Rol del usuario - columna 2 */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Rol del usuario</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden', borderRadius: '4px' }}>
                  <select 
                    value={editRolUsuario}
                    onChange={(e) => setEditRolUsuario(e.target.value)}
                    style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555', cursor: 'pointer', appearance: 'none' }}
                  >
                    <option value="">Selecciona un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id_rol} value={rol.id_rol}>{rol.rol}</option>
                    ))}
                  </select>
                  <div style={{ width: '32px', backgroundColor: '#D4D4D4', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontWeight: 'bold', borderLeft: '1px solid #C4C4C4', pointerEvents: 'none' }}>V</div>
                </div>
              </div>

              {/* Nombre de usuario */}
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nombre de usuario</label>
                <div style={{ display: 'flex', height: '32px', backgroundColor: '#E6E6E6', overflow: 'hidden', borderRadius: '4px' }}>
                  <input 
                    type="text"
                    value={editNombreUsuario}
                    onChange={(e) => setEditNombreUsuario(e.target.value)}
                    placeholder="Ingresa el nombre de usuario"
                    style={{ flex: 1, border: 'none', backgroundColor: 'transparent', padding: '0 10px', outline: 'none', color: '#555' }}
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' }}>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={{ 
                  backgroundColor: '#545753', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '20px', 
                  padding: '8px 24px', 
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleGuardarCambios}
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
                Guardar Cambios
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

export default UsuariosPage;