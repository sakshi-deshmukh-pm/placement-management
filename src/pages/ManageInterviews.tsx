
import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Formik, Form } from "formik";
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
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import FormikTextField from "../components/forms/FormikTextField";
import FormikSelectField from "../components/forms/FormikSelectField";
import FormikDateField from "../components/forms/FormikDateField";
import { interviewValidationSchema } from "../validation/validationSchemas";

interface Interview {
  id: number;
  applicationId: number;
  round: string;
  scheduledAt: string;
  mode: string;
  meetingLink: string | null;
  status: string;
  feedback: string | null;
  application?: {
    user?: {
      id: number;
      name: string | null;
      email: string;
      rollNumber: string | null;
      branch: string | null;
      year: string | null;
    };
    placementDrive?: {
      role: string;
      company?: {
        name: string;
      };
    };
  };
}

interface InterviewFormValues {
  applicationId: string;
  round: string;
  scheduledAt: string;
  mode: string;
  meetingLink: string;
  status: string;
  feedback: string;
}

const emptyForm: InterviewFormValues = {
  applicationId: "",
  round: "",
  scheduledAt: "",
  mode: "ONLINE",
  meetingLink: "",
  status: "SCHEDULED",
  feedback: "",
};

const toLocalDateTime = (value: string): string => {
  const date = new Date(value);
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 16);
};

const formatDate = (value: string): string =>
  new Date(value).toLocaleString();

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = err.response;

    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = response.data;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }
    }
  }

  return fallback;
};

export default function ManageInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<InterviewFormValues>({ ...emptyForm });

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.get("/interviews");
      setInterviews(response.data.data ?? []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to fetch interviews."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInterviews();
  }, [fetchInterviews]);

  const openAddDialog = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setSuccess("");
    setDialogOpen(true);
  };

  const openEditDialog = (interview: Interview) => {
    setEditingId(interview.id);

    setForm({
      applicationId: String(interview.applicationId),
      round: interview.round,
      scheduledAt: toLocalDateTime(interview.scheduledAt),
      mode: interview.mode,
      meetingLink: interview.meetingLink ?? "",
      status: interview.status,
      feedback: interview.feedback ?? "",
    });

    setError("");
    setSuccess("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this interview?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await axiosInstance.delete(`/interviews/${id}`);
      setSuccess("Interview deleted successfully.");
      await fetchInterviews();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete the interview."));
    }
  };

  const scheduledCount = interviews.filter(
    (interview) => interview.status === "SCHEDULED"
  ).length;

  const completedCount = interviews.filter(
    (interview) => interview.status === "COMPLETED"
  ).length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <h1 style={{ margin: 0, fontSize: "1.8rem" }}>
            Manage Interviews
          </h1>
          <p style={{ color: "#777", marginTop: 8 }}>
            Schedule interviews and manage rounds, status, and feedback.
          </p>
        </Box>

        <Button variant="contained" onClick={openAddDialog}>
          Schedule Interview
        </Button>
      </Box>

      {error && !dialogOpen && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Box sx={{ color: "text.secondary", mb: 1 }}>
              Total Interviews
            </Box>
            <Box sx={{ fontSize: "2rem", fontWeight: 700 }}>
              {interviews.length}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ color: "text.secondary", mb: 1 }}>
              Scheduled
            </Box>
            <Box sx={{ fontSize: "2rem", fontWeight: 700 }}>
              {scheduledCount}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ color: "text.secondary", mb: 1 }}>
              Completed
            </Box>
            <Box sx={{ fontSize: "2rem", fontWeight: 700 }}>
              {completedCount}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
          Interview List
        </h2>

        <Button
          onClick={() => void fetchInterviews()}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : interviews.length === 0 ? (
        <Alert severity="info">
          No interviews found. Schedule your first interview to get started.
        </Alert>
      ) : (
        <TableContainer
          sx={{
            overflowX: "auto",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Company / Role</TableCell>
                <TableCell>Round</TableCell>
                <TableCell>Scheduled At</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Feedback</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.id} hover>
                  <TableCell>{interview.id}</TableCell>

                  <TableCell>
                    <Box sx={{ fontWeight: 600 }}>
                      {interview.application?.user?.name || "Unknown"}
                    </Box>
                    <Box sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                      {interview.application?.user?.email ?? "—"}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ fontWeight: 600 }}>
                      {interview.application?.placementDrive?.company?.name ??
                        "Unknown"}
                    </Box>
                    <Box sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                      {interview.application?.placementDrive?.role ?? "—"}
                    </Box>
                  </TableCell>

                  <TableCell>{interview.round}</TableCell>
                  <TableCell>{formatDate(interview.scheduledAt)}</TableCell>
                  <TableCell>{interview.mode}</TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={interview.status}
                      color={
                        interview.status === "COMPLETED"
                          ? "success"
                          : interview.status === "CANCELLED"
                            ? "error"
                            : "primary"
                      }
                    />
                  </TableCell>

                  <TableCell>{interview.feedback || "—"}</TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        size="small"
                        onClick={() => openEditDialog(interview)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        onClick={() => void handleDelete(interview.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingId !== null ? "Edit Interview" : "Schedule Interview"}
        </DialogTitle>

        <Formik<InterviewFormValues>
          key={editingId ?? "new-interview"}
          initialValues={form}
          enableReinitialize
          validationSchema={interviewValidationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError("");
            setSuccess("");

            try {
              const scheduledDate = new Date(values.scheduledAt);

              const payload = {
                applicationId: Number(values.applicationId),
                round: values.round.trim(),
                scheduledAt: scheduledDate.toISOString(),
                mode: values.mode,
                meetingLink: values.meetingLink.trim() || null,
                status: values.status,
                feedback: values.feedback.trim() || null,
              };

              if (editingId !== null) {
                await axiosInstance.patch(
                  `/interviews/${editingId}`,
                  payload
                );
                setSuccess("Interview updated successfully.");
              } else {
                await axiosInstance.post("/interviews", {
                  applicationId: payload.applicationId,
                  round: payload.round,
                  scheduledAt: payload.scheduledAt,
                  mode: payload.mode,
                  meetingLink: payload.meetingLink,
                });
                setSuccess("Interview scheduled successfully.");
              }

              setDialogOpen(false);
              setEditingId(null);
              setForm({ ...emptyForm });
              await fetchInterviews();
            } catch (err: unknown) {
              setError(
                getErrorMessage(err, "Failed to save the interview.")
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form>
              <DialogContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    pt: 1,
                  }}
                >
                  {error && <Alert severity="error">{error}</Alert>}

                  <FormikTextField
                    name="applicationId"
                    label="Application ID"
                    type="number"
                    required
                    disabled={isSubmitting}
                  />

                  <FormikTextField
                    name="round"
                    label="Interview Round"
                    placeholder="Technical Round 1"
                    required
                    disabled={isSubmitting}
                  />

                  <FormikDateField
                    name="scheduledAt"
                    label="Scheduled Date and Time"
                    type="datetime-local"
                    required
                    disabled={isSubmitting}
                  />

                  <FormikSelectField
                    name="mode"
                    label="Interview Mode"
                    required
                    disabled={isSubmitting}
                    options={[
                      { label: "Online", value: "ONLINE" },
                      { label: "Offline", value: "OFFLINE" },
                      { label: "Phone", value: "PHONE" },
                    ]}
                  />

                  <FormikTextField
                    name="meetingLink"
                    label="Meeting Link"
                    placeholder="https://..."
                    required={values.mode === "ONLINE"}
                    disabled={isSubmitting}
                    helperText={
                      values.mode === "ONLINE"
                        ? "A valid meeting URL is required for online interviews."
                        : "Optional for offline or phone interviews."
                    }
                  />

                  {editingId !== null && (
                    <>
                      <FormikSelectField
                        name="status"
                        label="Status"
                        disabled={isSubmitting}
                        options={[
                          { label: "Scheduled", value: "SCHEDULED" },
                          { label: "Completed", value: "COMPLETED" },
                          { label: "Cancelled", value: "CANCELLED" },
                        ]}
                      />

                      <FormikTextField
                        name="feedback"
                        label="Feedback"
                        multiline
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </>
                  )}
                </Box>
              </DialogContent>

              <DialogActions sx={{ p: 2 }}>
                <Button
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : editingId !== null ? (
                    "Save Changes"
                  ) : (
                    "Schedule Interview"
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
