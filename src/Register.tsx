
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

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

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  rollNumber: string;
  branch: string;
  year: string;
};

type ApiResponse = {
  message?: string;
  error?: string;
};

const initialFormData: RegisterFormData = {
  name: "",
  email: "",
  password: "",
  rollNumber: "",
  branch: "",
  year: "",
};

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<RegisterFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const payload: RegisterFormData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      rollNumber: formData.rollNumber.trim(),
      branch: formData.branch.trim(),
      year: formData.year.trim(),
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.password ||
      !payload.rollNumber ||
      !payload.branch ||
      !payload.year
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (payload.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Registration failed.",
        );
      }

      navigate("/login", {
        replace: true,
        state: {
          message:
            result.message || "Registration successful! Please log in.",
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(
          err.message === "Failed to fetch"
            ? "Cannot connect to the server. Please check your connection."
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
          maxWidth: 520,
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

          <Typography variant="h4" component="h1" gutterBottom>
            Student Registration
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "text.secondary" }}
          >
            Create your PlaceTrack account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
              fullWidth
              disabled={loading}
              placeholder="Enter your full name"
            />

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
              autoComplete="new-password"
              required
              fullWidth
              disabled={loading}
              helperText="Minimum 8 characters"
              slotProps={{
                htmlInput: {
                  minLength: 8,
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() =>
                          setShowPassword((previous) => !previous)
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

            <TextField
              name="rollNumber"
              label="Roll Number"
              value={formData.rollNumber}
              onChange={handleChange}
              required
              fullWidth
              disabled={loading}
              placeholder="e.g. CSE2026001"
            />

            <TextField
              name="branch"
              label="Branch"
              value={formData.branch}
              onChange={handleChange}
              required
              fullWidth
              disabled={loading}
              placeholder="e.g. CSE, IT, ENTC"
            />

            <TextField
              name="year"
              label="Academic Year"
              value={formData.year}
              onChange={handleChange}
              required
              fullWidth
              disabled={loading}
              placeholder="e.g. 4th Year"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                mt: 0.5,
                py: 1.4,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Account"
              )}
            </Button>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}
        >
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" underline="hover">
            Login
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
