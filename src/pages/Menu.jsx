import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import {
    CircularProgress,
    Select,
    MenuItem,
    Box,
    Typography
} from "@mui/material";

import WEBSOCKET_URL from "../config/websockets.js";
import API_URL from "../config/backend.js";

import axios from "axios";

const socket = io(WEBSOCKET_URL);

const Menu = () => {

    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [role, setRole] = useState("");
    const [token, setToken] = useState(null);

    const [usuarios, setUsuarios] = useState([]);
    const [userID, setUserID] = useState("");

    // =========================
    // RESTAURAR SESIÓN
    // =========================
    useEffect(() => {

        const savedToken = localStorage.getItem("token_table");
        const expiresAt = localStorage.getItem("token_table_exp");

        if (savedToken && expiresAt) {

            const now = Date.now();

            // TOKEN VÁLIDO
            if (now < Number(expiresAt)) {

                setToken(savedToken);
                setSession(true);

                console.log("Sesión restaurada");

            } else {

                // TOKEN EXPIRADO
                localStorage.removeItem("token_table");
                localStorage.removeItem("token_table_exp");

                console.log("Token expirado");

                setSession(false);
            }

        } else {

            setSession(false);

        }

    }, []);

    // =========================
    // SOCKET AUTH
    // =========================
    useEffect(() => {

        // Ya hay token restaurado
        if (token) return;

        socket.emit("join-table", 1);

        socket.on("session-started", (data) => {

            if (data.session) {

                // 5 minutos
                const expiration =
                    Date.now() + (5 * 60 * 1000);

                localStorage.setItem(
                    "token_table",
                    data.token
                );

                localStorage.setItem(
                    "token_table_exp",
                    expiration.toString()
                );

                setToken(data.token);
                setSession(true);

                console.log("Nueva sesión iniciada");
            }
        });

        return () => {
            socket.off("session-started");
        };

    }, [token]);

    // =========================
    // VALIDAR EXPIRACIÓN
    // =========================
    useEffect(() => {

        if (!token) return;

        const interval = setInterval(() => {

            const expiresAt =
                localStorage.getItem("token_table_exp");

            if (expiresAt) {

                const now = Date.now();

                // EXPIRÓ
                if (now >= Number(expiresAt)) {

                    localStorage.removeItem("token_table");
                    localStorage.removeItem("token_table_exp");

                    setToken(null);
                    setSession(false);

                    console.log("Sesión expirada");
                }
            }

        }, 1000);

        return () => clearInterval(interval);

    }, [token]);

    // =========================
    // OBTENER USUARIOS
    // =========================
    const handleusuarios = async () => {

        try {

            const response = await axios.get(
                `${API_URL}/usuarios`
            );

            // EXCLUIR ADMINS
            const filtrados = response.data.filter(
                (u) => u.rol !== "Administrador"
            );

            setUsuarios(filtrados);

            console.log("Usuarios:", filtrados);

        } catch (error) {

            console.error(
                "Error al obtener usuarios:",
                error
            );

        }
    };

    // =========================
    // CAMBIO ROL
    // =========================
    const handleRoleChange = async (e) => {

        const selectedRole = e.target.value;

        setRole(selectedRole);

        // MOSTRADOR
        if (selectedRole === "mostrador") {

            await handleusuarios();

        }
    };

    // =========================
    // NAVEGACIÓN
    // =========================
    useEffect(() => {

        // MOSTRADOR
        if (
            role === "mostrador" &&
            token &&
            userID
        ) {

            navigate("/mostrador", {
                state: {
                    token: token,
                    userID: userID
                }
            });

        }

        // COCINA
        else if (
            role === "cocina" &&
            token
        ) {

            navigate("/cocina", {
                state: {
                    token: token
                }
            });

        }

    }, [role, token, userID, navigate]);

    // =========================
    // LOADING
    // =========================
    if (session === null) {

        return (

            <Box
                sx={{
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >

                <Typography variant="h6">
                    Esperando autenticación...
                </Typography>

                <CircularProgress sx={{ mt: 2 }} />

            </Box>
        );
    }

    // =========================
    // UI
    // =========================
    return (

        <Box
            sx={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: 3
            }}
        >

            <Typography variant="h5">
                Sesión activa
            </Typography>

            <Typography
                variant="body1"
                color="textSecondary"
            >
                Selecciona el área para continuar
            </Typography>

            {/* SELECT ROL */}
            <Select
                value={role}
                onChange={handleRoleChange}
                displayEmpty
                sx={{ minWidth: 250 }}
            >

                <MenuItem value="">
                    Selecciona el rol
                </MenuItem>

                <MenuItem value="mostrador">
                    🍕 Mostrador
                </MenuItem>

                <MenuItem value="cocina">
                    👨‍🍳 Cocina
                </MenuItem>

            </Select>

            {/* SELECT USUARIO */}
            {
                role === "mostrador" && (

                    <Select
                        value={userID}
                        onChange={(e) =>
                            setUserID(e.target.value)
                        }
                        displayEmpty
                        sx={{ minWidth: 250 }}
                    >

                        <MenuItem value="">
                            Selecciona el usuario
                        </MenuItem>

                        {
                            usuarios.map((usuario) => (

                                <MenuItem
                                    key={usuario.id_usuario}
                                    value={usuario.id_usuario}
                                >
                                    {usuario.nombre}
                                </MenuItem>

                            ))
                        }

                    </Select>

                )
            }

        </Box>
    );
};

export default Menu;