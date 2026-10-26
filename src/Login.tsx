import { useState, type FormEvent, type ChangeEvent } from "react";
import {
    useLocation,
    useNavigate,
    Link as RouterLink,
} from "react-router-dom";
import { useAppDispatch } from "./app/hooks";
import { setCredentials } from "./features/auth/authSlice";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Link,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

type LoginFormData = {
    email: string;
    password: string;
};

type LoginResponse = {
    statusCode?: number;
    message?: string;
    error?: string;
    token?: string;
    tokenType?: string;
    user?: {
        id: number;
        email: string;
        role: string;
        name?: string | null;
        isActive?: boolean;
        rollNumber?: string | null;
        branch?: string | null;
        year?: string | null;
    };
};

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    const registrationMessage = (
        location.state as { message?: string } | null
    )?.message;

    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(registrationMessage ?? "");

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        if (!email || !password.trim()) {
            setError("Please enter your email and password.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const result: LoginResponse = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    result.error ||
                    "Login failed. Please try again.",
                );
            }

            if (!result.token || !result.user) {
                throw new Error(
                    "Login response is missing the token or user details. Check the backend response.",
                );
            }

            if (result.user.isActive === false) {
                throw new Error(
                    "Your account is inactive. Please contact your administrator.",
                );
            }

            const user = {
                ...result.user,
                name: result.user.name ?? undefined,
                role: result.user.role.toUpperCase(),
            };

            dispatch(
                setCredentials({
                    token: result.token,
                    user,
                }),
            );
            if (user.role === "ADMIN") {
                navigate("/admin-dashboard", { replace: true });
            } else if (user.role === "PLACEMENT_COORDINATOR") {
                navigate("/coordinator-dashboard", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(
                    err.message === "Failed to fetch"
                        ? "Cannot connect to the server. Check that your backend is running on port 3000 and that CORS is configured."
                        : err.message,
                );
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                py: 4,
                background:
                    "linear-gradient(135deg, #f1f5ff 0%, #f8fafc 50%, #e8f0ff 100%)",
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 440,
                    p: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
                }}
            >
                <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            mx: "auto",
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 3,
                            bgcolor: "primary.main",
                            color: "common.white",
                        }}
                    >
                        <SchoolOutlinedIcon sx={{ fontSize: 34 }} />
                    </Box>

                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ textAlign: "center" }}
                    >
                        Welcome Back
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            mb: 3,
                            textAlign: "center",
                            color: "text.secondary",
                        }}
                    >
                        Sign in to your PlaceTrack account
                    </Typography>
                </Box>

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2.5,
                        }}
                    >
                        <TextField
                            name="email"
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                            fullWidth
                            disabled={loading}
                            placeholder="you@example.com"
                        />

                        <TextField
                            name="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                            fullWidth
                            disabled={loading}
                            placeholder="Enter your password"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                onClick={() =>
                                                    setShowPassword(
                                                        (previous) => !previous,
                                                    )
                                                }
                                                edge="end"
                                                disabled={loading}
                                            >
                                                {showPassword ? (
                                                    <VisibilityOffOutlinedIcon />
                                                ) : (
                                                    <VisibilityOutlinedIcon />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={loading}
                            sx={{
                                py: 1.4,
                                mt: 0.5,
                                borderRadius: 2,
                                textTransform: "none",
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </Box>
                </Box>

                <Typography
                    variant="body2"
                    sx={{
                        mt: 3,
                        textAlign: "center",
                        color: "text.secondary",
                    }}
                >
                    Don't have an account?{" "}
                    <Link
                        component={RouterLink}
                        to="/register"
                        underline="hover"
                    >
                        Register
                    </Link>
                </Typography>

                <Typography
                    variant="caption"
                    sx={{
                        mt: 3,
                        textAlign: "center",
                        display: "block",
                        color: "text.secondary",
                    }}
                >
                    PlaceTrack · Student Placement Portal
                </Typography>
            </Paper>
        </Box>
    );
}