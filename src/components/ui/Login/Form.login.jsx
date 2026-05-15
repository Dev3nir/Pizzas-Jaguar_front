import { useState } from "react";
import { TextField, Button, Typography, Box, Link } from "@mui/material";
import "../../../index.css";

const FormLogin = ({ isTablet, onSubmit, loading }) => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = () => {

        const payload = {
            username: username.trim(),
            password: password
        };

        if (!payload.username || !payload.password) {
            //console.log("Campos vacíos");
            return;
        }

        //console.log("Enviando:", payload);

        if (onSubmit) {
            onSubmit(payload);
        } else {
            //console.log(" onSubmit no definido");
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                maxWidth: 600,
                bgcolor: "transparent",
                p: isTablet ? 3 : 6,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: isTablet ? 2 : 3, mt: isTablet ? 2 : 10 }}>
                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            color: "var(--text-color)",
                            fontSize: isTablet ? "26px" : "36px",
                            fontWeight: 600,
                            mb: 1,
                            lineHeight: 1.2
                        }}
                    >
                        Iniciar Sesión
                    </Typography>

                    <Typography
                        sx={{
                            color: "var(--text-color)",
                            fontSize: isTablet ? "14px" : "18px",
                            fontWeight: 300,
                        }}
                    >
                        Escribe tu usuario y contraseña para usar el sistema
                    </Typography>
                </Box>

                <TextField
                    label="Usuario"
                    variant="outlined"
                    fullWidth
                    size={isTablet ? "small" : "medium"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{
                        "& .MuiInputBase-input": {
                            color: "var(--text-color)",
                            fontSize: isTablet ? "14px" : "16px",
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "#ccc" },
                            "&:hover fieldset": { borderColor: "var(--primary-color)" },
                            "&.Mui-focused fieldset": { borderColor: "var(--primary-color)" },
                        },
                        "& .MuiInputLabel-root": { color: "var(--text-color)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary-color)" },
                    }}
                />

                <TextField
                    label="Contraseña"
                    type="password"
                    variant="outlined"
                    fullWidth
                    size={isTablet ? "small" : "medium"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                        "& .MuiInputBase-input": {
                            color: "var(--text-color)",
                            fontSize: isTablet ? "14px" : "16px",
                        },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "#ccc" },
                            "&:hover fieldset": { borderColor: "var(--primary-color)" },
                            "&.Mui-focused fieldset": { borderColor: "var(--primary-color)" },
                        },
                        "& .MuiInputLabel-root": { color: "var(--text-color)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary-color)" },
                    }}
                />

                <Box sx={{ textAlign: "left" }}>
                    <Link
                        href="#"
                        underline="hover"
                        sx={{
                            color: "#21A0A0",
                            fontSize: isTablet ? "14px" : "18px",
                            fontWeight: 500,
                        }}
                    >
                        Olvidé mi contraseña
                    </Link>
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                        backgroundColor: "var(--primary-color)",
                        "&:hover": {
                            backgroundColor: "#d92d2a",
                        },
                        borderRadius: 2,
                        height: isTablet ? 40 : 48,
                        textTransform: "none",
                        fontSize: isTablet ? "16px" : "18px",
                        fontWeight: 600,
                        mt: isTablet ? 2 : 4,
                    }}
                >
                    {loading ? "Ingresando..." : "Iniciar"}
                </Button>
            </Box>
        </Box>
    );
};

export default FormLogin;