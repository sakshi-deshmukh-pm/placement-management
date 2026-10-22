import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import axiosInstance from "../api/axiosInstance";

interface Company {
  id: number;
  name: string;
}

interface Drive {
  id: number;
  role: string;
  package: number;
  eligibilityCriteria: string;
  deadline: string;
  companyId: number;
  company?: Company;
  status?: string;
}

interface ApiResponse<T> {
  data: T;
}

const initialForm = {
  role: "",
  package: "",
  eligibilityCriteria: "",
  deadline: "",
  companyId: "",
};

export default function ManagePlacementDrives() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [driveRes, companyRes] = await Promise.all([
        axiosInstance.get<ApiResponse<Drive[]>>("/placement-drives"),
        axiosInstance.get<ApiResponse<Company[]>>("/companies"),
      ]);

      setDrives(driveRes.data.data);
      setCompanies(companyRes.data.data);
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(e.response?.data?.message || e.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const updateForm = (field: keyof typeof initialForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const openForm = (drive?: Drive) => {
    setError("");
    setEditingId(drive?.id ?? null);

    if (drive) {
      const date = new Date(drive.deadline);
      const deadline = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      setForm({
        role: drive.role,
        package: String(drive.package),
        eligibilityCriteria: drive.eligibilityCriteria,
        deadline,
        companyId: String(drive.companyId),
      });
    } else {
      setForm(initialForm);
    }

    setOpen(true);
  };

  const saveDrive = async () => {
    if (
      !form.role.trim() ||
      !form.package ||
      !form.eligibilityCriteria.trim() ||
      !form.deadline ||
      !form.companyId
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const packageValue = Number(form.package);
    const companyId = Number(form.companyId);

    if (!Number.isFinite(packageValue) || packageValue <= 0) {
      setError("Package must be greater than zero.");
      return;
    }

    try {
      const payload = {
        role: form.role.trim(),
        package: packageValue,
        eligibilityCriteria: form.eligibilityCriteria.trim(),
        deadline: new Date(`${form.deadline}T23:59:59`).toISOString(),
        companyId,
      };

      if (editingId !== null) {
        await axiosInstance.put(`/placement-drives/${editingId}`, payload);
      } else {
        await axiosInstance.post("/placement-drives", payload);
      }

      setOpen(false);
      await loadData();
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(e.response?.data?.message || e.message || "Failed to save drive.");
    }
  };

  const deleteDrive = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this drive?")) return;

    try {
      await axiosInstance.delete(`/placement-drives/${id}`);
      await loadData();
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(e.response?.data?.message || e.message || "Failed to delete drive.");
    }
  };

  const filteredDrives = drives.filter(
    (drive) =>
      drive.role.toLowerCase().includes(search.toLowerCase()) ||
      (drive.company?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Manage Placement Drives
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="Search role or company"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={() => openForm()}>
          Add Drive
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : filteredDrives.length === 0 ? (
        <Typography>No placement drives found.</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 2,
          }}
        >
          {filteredDrives.map((drive) => (
            <Card key={drive.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{drive.role}</Typography>
                <Typography>
                  Company: {drive.company?.name ?? "Not available"}
                </Typography>
                <Typography>Package: {drive.package} LPA</Typography>
                <Typography>
                  Deadline: {new Date(drive.deadline).toLocaleDateString("en-IN")}
                </Typography>
                <Typography>
                  Eligibility: {drive.eligibilityCriteria}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Button onClick={() => openForm(drive)}>Edit</Button>
                  <Button color="error" onClick={() => void deleteDrive(drive.id)}>
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId !== null ? "Edit Placement Drive" : "Add Placement Drive"}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Job Role"
              value={form.role}
              onChange={(e) => updateForm("role", e.target.value)}
              required
            />

            <TextField
              label="Package (LPA)"
              type="number"
              value={form.package}
              onChange={(e) => updateForm("package", e.target.value)}
              slotProps={{ htmlInput: { min: 0.1, step: 0.1 } }}
              required
            />

            <TextField
              label="Eligibility Criteria"
              value={form.eligibilityCriteria}
              onChange={(e) => updateForm("eligibilityCriteria", e.target.value)}
              multiline
              required
            />

            <TextField
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => updateForm("deadline", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              required
            />

            <TextField
              select
              label="Company"
              value={form.companyId}
              onChange={(e) => updateForm("companyId", e.target.value)}
              required
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={String(company.id)}>
                  {company.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void saveDrive()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}