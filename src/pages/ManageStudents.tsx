import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";

import type {
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";

import axiosInstance from "../api/axiosInstance";
import ReusableDataGrid from "../components/commmon/ReusableDataGrid";

interface Student {
  id: number;
  name: string | null;
  email: string;
  rollNumber: string | null;
  branch: string | null;
  year: string | null;
  city?: string | null;
}

interface StudentsResponse {
  message?: string;
  data: Student[];
  pagination: {
    page: number;
    pageSize?: number;
    limit?: number;
    total: number;
    totalPages: number;
  };
}

const avatarColors = [
  { background: "#DBEAFE", color: "#1D4ED8" },
  { background: "#F3E8FF", color: "#7E22CE" },
  { background: "#CCFBF1", color: "#0F766E" },
  { background: "#FEF3C7", color: "#B45309" },
  { background: "#FFE4E6", color: "#BE123C" },
];

const allowedSortFields = [
  "id",
  "name",
  "email",
  "rollNumber",
  "branch",
  "year",
  "city",
] as const;

type StudentSortField = (typeof allowedSortFields)[number];

const getInitials = (name: string | null | undefined): string => {
  const safeName = name?.trim();

  if (!safeName) {
    return "S";
  }

  return safeName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export default function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");

  const [paginationModel, setPaginationModel] =
    useState<GridPaginationModel>({
      page: 0,
      pageSize: 10,
    });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "id", sort: "asc" },
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPaginationModel((previous) => ({
      ...previous,
      page: 0,
    }));
  }, [debouncedSearch, branchFilter]);

  const fetchStudents = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const currentSort = sortModel[0];

      const sortBy: StudentSortField =
        currentSort &&
        allowedSortFields.includes(
          currentSort.field as StudentSortField
        )
          ? (currentSort.field as StudentSortField)
          : "id";

      const sortOrder =
        currentSort?.sort === "desc" ? "desc" : "asc";

      const response = await axiosInstance.get<StudentsResponse>(
        "/students",
        {
          params: {
            page: paginationModel.page + 1,
            pageSize: paginationModel.pageSize,
            search: debouncedSearch || undefined,
            branch:
              branchFilter !== "ALL" ? branchFilter : undefined,
            sortBy,
            sortOrder,
          },
        }
      );

      if (!Array.isArray(response.data.data)) {
        throw new Error("Invalid students response.");
      }

      setStudents(response.data.data);
      setTotalStudents(response.data.pagination.total);
    } catch (err: unknown) {
      console.error("Failed to fetch students:", err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Unable to load students. Please try again."
        );
      } else {
        setError("Unable to load students. Please try again.");
      }

      setStudents([]);
      setTotalStudents(0);
    } finally {
      setLoading(false);
    }
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    debouncedSearch,
    branchFilter,
    sortModel,
  ]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const handlePaginationModelChange = (
    nextPaginationModel: GridPaginationModel
  ): void => {
    setPaginationModel(nextPaginationModel);
  };

  const handleSortModelChange = (
    nextSortModel: GridSortModel
  ): void => {
    setSortModel(nextSortModel);

    setPaginationModel((previous) => ({
      ...previous,
      page: 0,
    }));
  };

  const handleClearFilters = (): void => {
    setSearch("");
    setDebouncedSearch("");
    setBranchFilter("ALL");

    setPaginationModel((previous) => ({
      ...previous,
      page: 0,
    }));
  };

  const columns: GridColDef<Student>[] = [
    {
      field: "name",
      headerName: "Student",
      minWidth: 220,
      flex: 1.2,
      renderCell: (params) => {
        const student = params.row;
        const color =
          avatarColors[student.id % avatarColors.length];

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              height: "100%",
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: color.background,
                color: color.color,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {getInitials(student.name)}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "#172554",
                  overflowWrap: "anywhere",
                }}
              >
                {student.name?.trim() || "Unnamed Student"}
              </Typography>

              <Typography
                sx={{ fontSize: 11, color: "#94A3B8" }}
              >
                ID: {student.id}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: "rollNumber",
      headerName: "Roll Number",
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.row.rollNumber || "—"}
          size="small"
          variant="outlined"
          sx={{
            fontSize: 11,
            borderColor: "#E2E8F0",
            color: "#475569",
          }}
        />
      ),
    },
    {
      field: "branch",
      headerName: "Branch",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <Chip
          label={params.row.branch || "—"}
          size="small"
          sx={{
            bgcolor: "#EFF6FF",
            color: "#1D4ED8",
            fontWeight: 700,
            fontSize: 11,
          }}
        />
      ),
    },
    {
      field: "year",
      headerName: "Academic Year",
      minWidth: 140,
      flex: 0.7,
      renderCell: (params) => params.row.year ?? "—",
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 230,
      flex: 1.2,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            overflow: "hidden",
            height: "100%",
          }}
        >
          <MailOutlineRoundedIcon
            sx={{ fontSize: 17, color: "#94A3B8", flexShrink: 0 }}
          />

          <Typography
            sx={{
              fontSize: 12.5,
              color: "#475569",
              overflowWrap: "anywhere",
            }}
          >
            {params.row.email || "—"}
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: 1440, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "1.65rem", md: "2rem" },
              fontWeight: 800,
              color: "#172554",
            }}
          >
            Manage Students
          </Typography>

          <Typography
            sx={{ color: "#64748B", mt: 0.8, fontSize: 14 }}
          >
            View, search, filter, and sort student records.
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
          onClick={() => void fetchStudents()}
          disabled={loading}
          sx={{
            borderRadius: 2.5,
            px: 2,
            py: 1.1,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Refresh
        </Button>
      </Box>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid #E2E8F0",
          borderRadius: 3,
          background:
            "linear-gradient(110deg, #FFFFFF 0%, #F5F8FF 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: { xs: 2.5, md: 3 },
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              width: 54,
              height: 54,
              borderRadius: 2.5,
              bgcolor: "#DBEAFE",
              color: "#2563EB",
            }}
          >
            <PeopleAltOutlinedIcon sx={{ fontSize: 28 }} />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13,
                color: "#64748B",
                fontWeight: 600,
              }}
            >
              Total students
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.4,
                color: "#172554",
                fontWeight: 800,
              }}
            >
              {totalStudents}
            </Typography>
          </Box>

          <Chip
            icon={<SchoolOutlinedIcon />}
            label="Student Records"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              bgcolor: "#EFF6FF",
              color: "#1D4ED8",
              fontWeight: 700,
              "& .MuiChip-icon": { color: "#1D4ED8" },
            }}
          />
        </Box>
      </Card>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2,
          border: "1px solid #E8EDF5",
          borderRadius: 3,
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "#172554",
            mb: 2,
          }}
        >
          Search and Filters
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Search students"
            placeholder="Name, email, or roll number"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: "#94A3B8" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
              },
            }}
          />

          <TextField
            select
            size="small"
            label="Branch"
            value={branchFilter}
            onChange={(event) => setBranchFilter(event.target.value)}
            sx={{
              minWidth: { xs: "100%", md: 190 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
              },
            }}
          >
            <MenuItem value="ALL">All branches</MenuItem>
            <MenuItem value="CSE">CSE</MenuItem>
            <MenuItem value="IT">IT</MenuItem>
            <MenuItem value="ENTC">ENTC</MenuItem>
            <MenuItem value="E&TC">E&TC</MenuItem>
            <MenuItem value="Mechanical">Mechanical</MenuItem>
            <MenuItem value="Electrical">Electrical</MenuItem>
            <MenuItem value="Civil">Civil</MenuItem>
          </TextField>

          <Button
            onClick={handleClearFilters}
            sx={{
              whiteSpace: "nowrap",
              textTransform: "none",
            }}
          >
            Clear Filters
          </Button>
        </Box>

        <Typography
          sx={{ color: "#64748B", fontSize: 12.5, mt: 2 }}
        >
          {loading
            ? "Loading records..."
            : `Showing ${students.length} records on this page out of ${totalStudents} students`}
        </Typography>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2.5 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void fetchStudents()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!error && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1, md: 2 },
            border: "1px solid #E8EDF5",
            borderRadius: 3,
          }}
        >
          <ReusableDataGrid<Student>
            rows={students}
            columns={columns}
            loading={loading}
            rowCount={totalStudents}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            getRowId={(student: Student) => student.id}
            pageSizeOptions={[10, 20, 50, 100]}
            height={600}
          />
        </Paper>
      )}
    </Box>
  );
}