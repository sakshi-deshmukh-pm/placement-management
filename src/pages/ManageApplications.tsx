
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import type {
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";

import axiosInstance from "../api/axiosInstance";
import ReusableDataGrid from "../components/commmon/ReusableDataGrid";

interface Student {
  id: number;
  name?: string | null;
  email?: string;
}

interface Company {
  id: number;
  name: string;
  location?: string;
}

interface PlacementDrive {
  id: number;
  role: string;
  package?: number | string | null;
  deadline?: string;
  company?: Company;
}

interface Application {
  id: number;
  status: string;
  appliedAt?: string;
  user?: Student;
  placementDrive?: PlacementDrive;
}

interface ApplicationApiResponse {
  statusCode: number;
  message: string;
  data: Application[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "SELECTED",
  "REJECTED",
];

const getStudentName = (application: Application): string =>
  application.user?.name ??
  application.user?.email ??
  `Student #${application.user?.id ?? "Unknown"}`;

const getApplicationDate = (application: Application): string => {
  const date = application.appliedAt;

  if (!date || Number.isNaN(Date.parse(date))) {
    return "Not available";
  }

  return new Date(date).toLocaleDateString("en-IN");
};

const getStatusColor = (
  status: string
): "default" | "success" | "info" | "warning" | "error" => {
  switch (status.toUpperCase()) {
    case "SELECTED":
      return "success";
    case "SHORTLISTED":
      return "info";
    case "REJECTED":
      return "error";
    case "APPLIED":
      return "warning";
    default:
      return "default";
  }
};

export default function ManageApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [paginationModel, setPaginationModel] =
    useState<GridPaginationModel>({
      page: 0,
      pageSize: 10,
    });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "id", sort: "asc" },
  ]);

  const loadApplications = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const response =
        await axiosInstance.get<ApplicationApiResponse>(
          "/applications",
          {
            params: {
              page: paginationModel.page + 1,
              pageSize: paginationModel.pageSize,
              search: search.trim() || undefined,
              status:
                statusFilter === "ALL" ? undefined : statusFilter,
            },
          }
        );

      setApplications(response.data.data);
      setTotalApplications(
        response.data.pagination?.total ??
          response.data.data.length
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Unable to load applications. Please try again."
        );
      } else {
        setError("Unable to load applications. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    search,
    statusFilter,
  ]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const updateApplicationStatus = async (
    applicationId: number,
    status: string
  ): Promise<void> => {
    setUpdatingId(applicationId);
    setError("");

    try {
      await axiosInstance.patch(
        `/applications/${applicationId}`,
        { status }
      );

      setApplications((previous) =>
        previous.map((application) =>
          application.id === applicationId
            ? { ...application, status }
            : application
        )
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Unable to update application status."
        );
      } else {
        setError("Unable to update application status.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    setPaginationModel((previous) => ({
      ...previous,
      page: 0,
    }));
  };

  const handleStatusFilterChange = (value: string): void => {
    setStatusFilter(value);
    setPaginationModel((previous) => ({
      ...previous,
      page: 0,
    }));
  };

  const columns: GridColDef<Application>[] = [
    {
      field: "id",
      headerName: "Application ID",
      minWidth: 125,
      flex: 0.7,
      renderCell: (params) => `#${params.row.id}`,
    },
    {
      field: "studentName",
      headerName: "Student",
      minWidth: 200,
      flex: 1.2,
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            height: "100%",
            minWidth: 0,
          }}
        >
          <Avatar
            sx={{
              width: 35,
              height: 35,
              bgcolor: "#DBEAFE",
              color: "#1D4ED8",
            }}
          >
            {getStudentName(params.row).charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                overflowWrap: "anywhere",
              }}
            >
              {getStudentName(params.row)}
            </Typography>

            {params.row.user?.email && (
              <Typography
                sx={{ fontSize: 11, color: "#64748B" }}
              >
                {params.row.user.email}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      field: "driveRole",
      headerName: "Placement Drive",
      minWidth: 170,
      flex: 1,
      sortable: false,
      renderCell: (params) =>
        params.row.placementDrive?.role ?? "Not available",
    },
    {
      field: "companyName",
      headerName: "Company",
      minWidth: 160,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BusinessOutlinedIcon
            sx={{ fontSize: 19, color: "#64748B" }}
          />
          <Typography sx={{ fontSize: 13 }}>
            {params.row.placementDrive?.company?.name ??
              "Not available"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "appliedAt",
      headerName: "Applied Date",
      minWidth: 140,
      flex: 0.8,
      renderCell: (params) => getApplicationDate(params.row),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 140,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.status}
          color={getStatusColor(params.row.status)}
          sx={{ fontWeight: 700, fontSize: 11 }}
        />
      ),
    },
    {
      field: "updateStatus",
      headerName: "Update Status",
      sortable: false,
      filterable: false,
      minWidth: 165,
      flex: 1,
      renderCell: (params) => (
        <TextField
          select
          size="small"
          value={params.row.status}
          disabled={updatingId === params.row.id}
          onChange={(event) => {
            void updateApplicationStatus(
              params.row.id,
              event.target.value
            );
          }}
          sx={{
            minWidth: 145,
            "& .MuiInputBase-root": { fontSize: 12 },
          }}
        >
          {STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          color: "#fff",
          background:
            "linear-gradient(135deg, #173b72 0%, #2865b3 65%, #4388d8 100%)",
        }}
      >
        <Typography
          component="h1"
          sx={{
            m: 0,
            mb: 1,
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontWeight: 700,
          }}
        >
          Manage Applications
        </Typography>

        <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>
          Review student applications and track their selection status.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          border: "1px solid #e3e9f2",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              component="h2"
              sx={{ m: 0, fontSize: "1.2rem" }}
            >
              Student Applications
            </Typography>

            <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
              {totalApplications} matching application(s)
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={
              loading ? (
                <CircularProgress size={16} />
              ) : (
                <RefreshRoundedIcon />
              )
            }
            onClick={() => void loadApplications()}
            disabled={loading}
            sx={{ textTransform: "none" }}
          >
            Refresh
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <TextField
            label="Search applications"
            placeholder="Student, email, company, role or ID"
            value={search}
            onChange={(event) =>
              handleSearchChange(event.target.value)
            }
            size="small"
            sx={{ flex: 1, minWidth: 220 }}
          />

          <TextField
            select
            label="Application status"
            value={statusFilter}
            onChange={(event) =>
              handleStatusFilterChange(event.target.value)
            }
            size="small"
            sx={{ width: { xs: "100%", sm: 210 } }}
          >
            <MenuItem value="ALL">All statuses</MenuItem>
            {STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1, md: 2 },
          border: "1px solid #e3e9f2",
          borderRadius: 3,
        }}
      >
        <ReusableDataGrid<Application>
          rows={applications}
          columns={columns}
          loading={loading}
          rowCount={totalApplications}
          paginationModel={paginationModel}
          onPaginationModelChange={(nextModel) => {
            setPaginationModel(nextModel);
          }}
          sortModel={sortModel}
          onSortModelChange={(nextModel) => {
            setSortModel(nextModel);
            setPaginationModel((previous) => ({
              ...previous,
              page: 0,
            }));
          }}
          getRowId={(application: Application) => application.id}
          pageSizeOptions={[10, 20, 50]}
          height={600}
        />
      </Paper>
    </Box>
  );
}
