
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
} from "@mui/material";
import { Formik, Form } from "formik";
import axiosInstance from "../api/axiosInstance";
import FormikTextField from "../components/forms/FormikTextField";
import FormikSelectField from "../components/forms/FormikSelectField";
import FormikDateField from "../components/forms/FormikDateField";
import { placementDriveValidationSchema } from "../validation/validationSchemas";

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

interface DriveFormValues {
  role: string;
  package: string;
  eligibilityCriteria: string;
  deadline: string;
  companyId: string;
}

const initialForm: DriveFormValues = {
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
  const [form, setForm] = useState<DriveFormValues>(initialForm);

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

      setError(
        e.response?.data?.message || e.message || "Failed to load data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

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

  const deleteDrive = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this drive?")) {
      return;
    }

    setError("");

    try {
      await axiosInstance.delete(`/placement-drives/${id}`);
      await loadData();
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      setError(
        e.response?.data?.message || e.message || "Failed to delete drive."
      );
    }
  };

  const filteredDrives = drives.filter(
    (drive) =>
      drive.role.toLowerCase().includes(search.toLowerCase()) ||
      (drive.company?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          color: "#fff",
          background:
            "linear-gradient(135deg, #173b72 0%, #2865b3 65%, #4388d8 100%)",
          boxShadow: "0 8px 24px rgba(31, 78, 140, 0.18)",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "2rem" },
              mb: 0.7,
            }}
          >
            Manage Placement Drives
          </Typography>

          <Typography sx={{ color: "rgba(255,255,255,0.82)" }}>
            Create, update, and manage campus placement opportunities.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => openForm()}
          sx={{
            bgcolor: "#fff",
            color: "#1e4f91",
            fontWeight: 700,
            px: 2.5,
            py: 1.2,
            borderRadius: 2,
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#eaf1fb" },
          }}
        >
          + Add Drive
        </Button>
      </Box>

      {/* Summary and Search */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid #e3e9f2",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Placement Opportunities
              </Typography>

              <Typography variant="body2" color="text.secondary">
                View and manage all available placement drives.
              </Typography>
            </Box>

            <Chip
              label={`${filteredDrives.length} ${
                filteredDrives.length === 1 ? "Drive" : "Drives"
              }`}
              sx={{
                bgcolor: "#e8f0fe",
                color: "#1d4f91",
                fontWeight: 700,
                borderRadius: 2,
              }}
            />
          </Box>

          <TextField
            fullWidth
            label="Search by job role or company"
            placeholder="e.g. Software Developer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              maxWidth: 520,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#fff",
                borderRadius: 2,
              },
            }}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Loading, Empty, and Drive Cards */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">
            Loading placement drives...
          </Typography>
        </Box>
      ) : filteredDrives.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px dashed #cbd5e1",
            borderRadius: 3,
            textAlign: "center",
            py: 7,
            px: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {search
              ? "No matching placement drives"
              : "No placement drives yet"}
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2.5 }}>
            {search
              ? "Try searching with a different role or company name."
              : "Add your first placement drive to get started."}
          </Typography>

          {!search && (
            <Button variant="contained" onClick={() => openForm()}>
              + Add First Drive
            </Button>
          )}
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2.5,
          }}
        >
          {filteredDrives.map((drive) => (
            <Card
              key={drive.id}
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid #e3e9f2",
                borderRadius: 3,
                bgcolor: "#fff",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 25px rgba(25, 55, 100, 0.09)",
                },
              }}
            >
              <CardContent
                sx={{
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxSizing: "border-box",
                  "&:last-child": { pb: 2.5 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1e3557",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {drive.role}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {drive.company?.name ?? "Company not available"}
                    </Typography>
                  </Box>

                  <Chip
                    label={drive.status ?? "Placement Drive"}
                    size="small"
                    sx={{
                      flexShrink: 0,
                      bgcolor: "#edf3ff",
                      color: "#2858a4",
                      fontWeight: 600,
                      maxWidth: 130,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    bgcolor: "#f2f6fd",
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Annual Package
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#245da8" }}
                  >
                    {drive.package} LPA
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 600 }}
                  >
                    Application Deadline
                  </Typography>

                  <Typography variant="body2" sx={{ color: "#26364b" }}>
                    {new Date(drive.deadline).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2.5, flexGrow: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontWeight: 600 }}
                  >
                    Eligibility Criteria
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#46566c",
                      lineHeight: 1.7,
                      overflowWrap: "anywhere",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {drive.eligibilityCriteria}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    pt: 2,
                    borderTop: "1px solid #edf0f5",
                  }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => openForm(drive)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={() => void deleteDrive(drive.id)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Formik Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#1e3557",
            borderBottom: "1px solid #edf0f5",
            px: 3,
            py: 2.5,
          }}
        >
          {editingId !== null ? "Edit Placement Drive" : "Add Placement Drive"}
        </DialogTitle>

        <Formik<DriveFormValues>
          key={editingId ?? "new-drive"}
          initialValues={form}
          enableReinitialize
          validationSchema={placementDriveValidationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError("");

            try {
              const payload = {
                role: values.role.trim(),
                package: Number(values.package),
                eligibilityCriteria: values.eligibilityCriteria.trim(),
                deadline: new Date(
                  `${values.deadline}T23:59:59`
                ).toISOString(),
                companyId: Number(values.companyId),
              };

              if (editingId !== null) {
                await axiosInstance.put(
                  `/placement-drives/${editingId}`,
                  payload
                );
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

              setError(
                e.response?.data?.message ||
                  e.message ||
                  "Failed to save drive."
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <DialogContent sx={{ px: 3, py: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2.5 }}
                >
                  Enter the placement details below.
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                    pt: 0.5,
                  }}
                >
                  <FormikTextField
                    name="role"
                    label="Job Role"
                    placeholder="e.g. Software Developer"
                    required
                    disabled={isSubmitting}
                  />

                  <FormikTextField
                    name="package"
                    label="Package (LPA)"
                    type="number"
                    required
                    disabled={isSubmitting}
                  />

                  <FormikTextField
                    name="eligibilityCriteria"
                    label="Eligibility Criteria"
                    placeholder="Enter required skills, CGPA, branch, etc."
                    multiline
                    rows={3}
                    required
                    disabled={isSubmitting}
                  />

                  <FormikDateField
                    name="deadline"
                    label="Deadline"
                    required
                    disabled={isSubmitting}
                  />

                  <FormikSelectField
                    name="companyId"
                    label="Company"
                    required
                    disabled={isSubmitting || companies.length === 0}
                    options={companies.map((company) => ({
                      label: company.name,
                      value: String(company.id),
                    }))}
                  />

                  {companies.length === 0 && (
                    <Alert severity="warning">
                      No companies are available. Add a company before creating
                      a placement drive.
                    </Alert>
                  )}
                </Box>
              </DialogContent>

              <DialogActions
                sx={{
                  px: 3,
                  py: 2.5,
                  borderTop: "1px solid #edf0f5",
                  gap: 1,
                }}
              >
                <Button
                  onClick={() => setOpen(false)}
                  variant="outlined"
                  disabled={isSubmitting}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || companies.length === 0}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : editingId !== null ? (
                    "Update Drive"
                  ) : (
                    "Save Drive"
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}
