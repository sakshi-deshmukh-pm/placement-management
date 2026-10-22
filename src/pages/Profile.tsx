import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

type UserProfile = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  rollNumber: string | null;
  branch: string | null;
  year: string | null;
};

type ProfileForm = {
  name: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  city: string;
  state: string;
  pincode: string;
};

type ProfileResponse = {
  message?: string;
  user?: UserProfile;
};

const emptyForm: ProfileForm = {
  name: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  city: "",
  state: "",
  pincode: "",
};

const toForm = (user: UserProfile): ProfileForm => ({
  name: user.name ?? "",
  phone: user.phone ?? "",
  gender: user.gender ?? "",
  dateOfBirth: user.dateOfBirth
    ? user.dateOfBirth.slice(0, 10)
    : "",
  city: user.city ?? "",
  state: user.state ?? "",
  pincode: user.pincode ?? "",
});

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result: ProfileResponse = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(result.message || "Unable to load your profile.");
        }

        if (!result.user) {
          throw new Error("The server did not return your profile.");
        }

        setUser(result.user);
        setForm(toForm(result.user));
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message === "Failed to fetch"
              ? "Cannot connect to the backend. Check that your server is running."
              : err.message
            : "Unable to load your profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [navigate]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("http://localhost:3000/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          gender: form.gender || null,
          dateOfBirth: form.dateOfBirth || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          pincode: form.pincode.trim() || null,
        }),
      });

      const result: ProfileResponse = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Unable to save your profile.");
      }

      if (!result.user) {
        throw new Error("The server did not return the updated profile.");
      }

      setUser(result.user);
      setForm(toForm(result.user));
      setSuccess(result.message || "Your profile was updated successfully.");

      // Keep the locally cached account name in sync if it exists.
      const cachedUserText = localStorage.getItem("user");

      if (cachedUserText) {
        try {
          const cachedUser = JSON.parse(cachedUserText);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...cachedUser, name: result.user.name }),
          );
        } catch {
          // The profile itself has already been saved successfully.
        }
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fb", p: { xs: 2, md: 5 } }}>
      <Box sx={{ maxWidth: 850, mx: "auto" }}>
        <Button onClick={() => navigate("/dashboard")} sx={{ mb: 2 }}>
          ← Back to Dashboard
        </Button>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            My Profile
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            View your account information and update your personal details.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {user && (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                  mb: 3,
                }}
              >
                <TextField
                  label="Email"
                  value={user.email}
                  disabled
                  fullWidth
                />

                <TextField
                  label="Roll Number"
                  value={user.rollNumber ?? "Not added"}
                  disabled
                  fullWidth
                />

                <TextField
                  label="Branch"
                  value={user.branch ?? "Not added"}
                  disabled
                  fullWidth
                />

                <TextField
                  label="Year"
                  value={user.year ?? "Not added"}
                  disabled
                  fullWidth
                />
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Personal Details
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <TextField
                    name="name"
                    label="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    fullWidth
                  />

                  <TextField
                    name="phone"
                    label="Phone"
                    value={form.phone}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="gender"
                    label="Gender"
                    value={form.gender}
                    onChange={handleChange}
                    select
                    fullWidth
                  >
                    <MenuItem value="">Prefer not to say</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>

                  <TextField
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                  />

                  <TextField
                    name="city"
                    label="City"
                    value={form.city}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="state"
                    label="State"
                    value={form.state}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="pincode"
                    label="Pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    fullWidth
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  sx={{ mt: 3, py: 1.3, fontWeight: 700 }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
