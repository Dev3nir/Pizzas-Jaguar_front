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

const socket = io(WEBSOCKET_URL);

const Menu = () => {

    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [role, setRole] = useState("");
    const [token, setToken] = useState(null);

    // =========================
    // RESTAURAR SESIÓN
    // =========================
    useEffect(() => {

        const savedToken =
            localStorage.getItem("token_table");

        const expiresAt =
            localStorage.getItem("token_table_exp");

        if (savedToken && expiresAt) {

            const now = Date.now();

            if (now < Number(expiresAt)) {

                setToken(savedToken);
                setSession(true);

                console.log("Sesión restaurada");

            } else {

                localStorage.removeItem("token_table");
                localStorage.removeItem("token_table_exp");

                setSession(false);

                console.log("Token expirado");
            }

        } else {

            setSession(false);

        }

    }, []);

    // =========================
    // SOCKET AUTH
    // =========================
    useEffect(() => {

        if (token) return;

        socket.emit("join-table", 1);

        socket.on("session-started", (data) => {

            if (data.session) {

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
    // CAMBIO DE ROL
    // =========================
    const handleRoleChange = (e) => {

        const selectedRole = e.target.value;

        setRole(selectedRole);

        // MOSTRADOR
        if (selectedRole === "mostrador") {

            navigate("/mostrador", {
                state: {
                    token
                }
            });

        }

        // COCINA
        else if (selectedRole === "cocina") {

            navigate("/cocina", {
                state: {
                    token
                }
            });

        }
    };

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
                    Mostrador
                </MenuItem>

                <MenuItem value="cocina">
                    Cocina
                </MenuItem>

            </Select>

        </Box>
    );
};

export default Menu;