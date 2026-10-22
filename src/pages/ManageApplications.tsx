
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

// Replace this path with the exact axiosInstance import path
// used in your existing MyApplications.tsx.
import axiosInstance from "../api/axiosInstance";

type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "REJECTED"
  | "SELECTED";

type Application = {
  id: number;
  status: ApplicationStatus;
  appliedAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
  placementDrive: {
    id: number;
    role: string;
    package: number | string | null;
    deadline: string;
    company: {
      id: number;
      name: string;
      location: string | null;
    };
  };
};

type ApplicationsResponse = {
  message: string;
  data: Application[];
};

const statuses: ApplicationStatus[] = [
  "APPLIED",
  "SHORTLISTED",
  "REJECTED",
  "SELECTED",
];

function getStatusColor(
  status: ApplicationStatus
): "default" | "info" | "warning" | "error" | "success" {
  switch (status) {
    case "APPLIED":
      return "info";
    case "SHORTLISTED":
      return "warning";
    case "REJECTED":
      return "error";
    case "SELECTED":
      return "success";
    default:
      return "default";
  }
}

function ManageApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<number, ApplicationStatus>
  >({});
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await axiosInstance.get<ApplicationsResponse>("/applications");

      const data = response.data.data ?? [];

      setApplications(data);

      setSelectedStatuses(
        Object.fromEntries(
          data.map((application) => [
            application.id,
            application.status,
          ])
        ) as Record<number, ApplicationStatus>
      );
    } catch (err: unknown) {
      console.error("Failed to fetch applications:", err);
      setError("Unable to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  const handleStatusUpdate = async (applicationId: number) => {
    const newStatus = selectedStatuses[applicationId];

    if (!newStatus) {
      return;
    }

    setUpdatingId(applicationId);
    setError("");
    setMessage("");

    try {
      await axiosInstance.patch(
        `/applications/${applicationId}`,
        { status: newStatus }
      );

      setApplications((previous) =>
        previous.map((application) =>
          application.id === applicationId
            ? { ...application, status: newStatus }
            : application
        )
      );

      setMessage(`Application #${applicationId} updated to ${newStatus}.`);
    } catch (err: unknown) {
      console.error("Failed to update application:", err);
      setError("Unable to update the application status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = applications.filter(
    (application) =>
      filterStatus === "ALL" ||
      application.status === filterStatus
  );

  const totalApplications = applications.length;
  const shortlistedCount = applications.filter(
    (application) => application.status === "SHORTLISTED"
  ).length;
  const selectedCount = applications.filter(
    (application) => application.status === "SELECTED"
  ).length;
  const rejectedCount = applications.filter(
    (application) => application.status === "REJECTED"
  ).length;

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 750, color: "#172554", mb: 1 }}
      >
        Manage Applications
      </Typography>

      <Typography sx={{ color: "#64748B", mb: 3 }}>
        Review student applications and update their selection status.
      </Typography>

      {/* Summary cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          { label: "Total", count: totalApplications },
          { label: "Shortlisted", count: shortlistedCount },
          { label: "Selected", count: selectedCount },
          { label: "Rejected", count: rejectedCount },
        ].map((item) => (
          <Card
            key={item.label}
            elevation={0}
            sx={{ border: "1px solid #E2E8F0", borderRadius: 3 }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 750, mt: 1 }}>
                {item.count}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchApplications}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {message && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      {/* Filter and refresh */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="application-status-filter">
            Filter by status
          </InputLabel>
          <Select
            labelId="application-status-filter"
            value={filterStatus}
            label="Filter by status"
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <MenuItem value="ALL">All statuses</MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={fetchApplications}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Applications table */}
      <TableContainer
        component={Card}
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 3,
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 1050 }}>
          <TableHead sx={{ bgcolor: "#F8FAFC" }}>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Package</TableCell>
              <TableCell>Applied On</TableCell>
              <TableCell>Current Status</TableCell>
              <TableCell>Update Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                  <Typography sx={{ mt: 1 }}>
                    Loading applications...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {applications.length === 0
                      ? "No applications found yet."
                      : "No applications match this status filter."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((application) => (
                <TableRow key={application.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 650 }}>
                      {application.user.name || "Unnamed student"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {application.user.email}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      {application.placementDrive.company.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {application.placementDrive.company.location || "—"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {application.placementDrive.role}
                  </TableCell>

                  <TableCell>
                    {application.placementDrive.package != null
                      ? `${application.placementDrive.package} LPA`
                      : "—"}
                  </TableCell>

                  <TableCell>
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={application.status}
                      color={getStatusColor(application.status)}
                    />
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, minWidth: 245 }}>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={
                            selectedStatuses[application.id] ??
                            application.status
                          }
                          onChange={(event) =>
                            setSelectedStatuses((previous) => ({
                              ...previous,
                              [application.id]: event.target.value as ApplicationStatus,
                            }))
                          }
                          disabled={updatingId === application.id}
                        >
                          {statuses.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Button
                        variant="contained"
                        size="small"
                        disabled={
                          updatingId === application.id ||
                          selectedStatuses[application.id] ===
                            application.status
                        }
                        onClick={() =>
                          void handleStatusUpdate(application.id)
                        }
                      >
                        {updatingId === application.id ? "Saving..." : "Save"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ManageApplications;
