import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { CircularProgress, Select, MenuItem, Box, Typography } from "@mui/material";
import BACKEND_URL from "../config/backend.js";

const socket = io("http://localhost:3001");

const Menu = () => {

    const [session, setSession] = useState(null);
    const [role, setRole] = useState("");

    useEffect(() => {

        socket.emit("join-table", 1);
        socket.on("session-started", (data) => {
            //console.log("Evento recibido:", data);
            if (data.session) {
                localStorage.setItem("token_table", data.token);
                setSession(true);
            }
        });

        return () => {
            socket.off("session-started");
        };

    }, []);

    if (session === null) {
        return (
            <Box sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Typography variant="h6">
                    Esperando autenticación...
                </Typography>
                <CircularProgress sx={{ mt: 2 }} />
            </Box>
        );
    }

    return (
        <Box sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 3
        }}>

            <Typography variant="h5">
                Sesión activa
            </Typography>

            <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                displayEmpty
                sx={{ minWidth: 200 }}
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