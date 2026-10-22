
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import axiosInstance from "../api/axiosInstance";

type Company = {
  id: number;
  name: string;
  location: string | null;
};

type PlacementDrive = {
  id: number;
  role: string;
  package: number | null;
  eligibilityCriteria: string;
  deadline: string;
  status: string;
  companyId: number;
  company: Company;
};

type PlacementDriveResponse = {
  message: string;
  data: PlacementDrive[];
};

type Application = {
  id: number;
  placementDrive: {
    id: number;
  };
};

type ApplicationsResponse = {
  message: string;
  data: Application[];
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
};

function PlacementDrives() {
  const navigate = useNavigate();

  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyError, setApplyError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [applyingDriveId, setApplyingDriveId] = useState<number | null>(null);
  const [appliedDriveIds, setAppliedDriveIds] = useState<number[]>([]);

  const loadDrives = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get<PlacementDriveResponse>("/placement-drives");

      setDrives(response.data.data);
    } catch (err) {
      console.error("Failed to load placement drives:", err);
      setError("Unable to load placement drives. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadMyApplications = async () => {
    try {
      const response =
        await axiosInstance.get<ApplicationsResponse>("/applications");

      const ids = response.data.data.map(
        (application) => application.placementDrive.id
      );

      setAppliedDriveIds(ids);
    } catch (err) {
      console.error("Failed to load existing applications:", err);
    }
  };

  useEffect(() => {
    void loadDrives();
    void loadMyApplications();
  }, []);

  const handleApply = async (driveId: number) => {
    if (applyingDriveId !== null || appliedDriveIds.includes(driveId)) {
      return;
    }

    try {
      setApplyingDriveId(driveId);
      setApplyError("");
      setSuccessMessage("");

      const response = await axiosInstance.post("/applications", {
        placementDriveId: driveId,
      });

      setAppliedDriveIds((previousIds) =>
        previousIds.includes(driveId)
          ? previousIds
          : [...previousIds, driveId]
      );

      setSuccessMessage(
        response.data?.message || "Application submitted successfully!"
      );
    } catch (err) {
      const apiError = err as ApiError;

      setApplyError(
        apiError.response?.data?.message ||
          apiError.response?.data?.error ||
          "Unable to submit your application. Please try again."
      );
    } finally {
      setApplyingDriveId(null);
    }
  };

  const filteredDrives = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return drives;
    }

    return drives.filter((drive) => {
      const companyName = drive.company?.name ?? "";
      const location = drive.company?.location ?? "";

      return (
        drive.role.toLowerCase().includes(searchText) ||
        companyName.toLowerCase().includes(searchText) ||
        location.toLowerCase().includes(searchText) ||
        drive.eligibilityCriteria.toLowerCase().includes(searchText)
      );
    });
  }, [drives, search]);

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
      return "Not specified";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          color: "#FFFFFF",
          background: "linear-gradient(120deg, #1D4ED8, #4F46E5)",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Placement Drives
        </Typography>

        <Typography variant="body1" sx={{ color: "#DBEAFE" }}>
          Explore opportunities, discover companies, and track placement
          deadlines.
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mt: 3, flexWrap: "wrap" }}>
          <Chip
            label={`${drives.length} opportunities`}
            sx={{
              bgcolor: "#FFFFFF",
              color: "#1D4ED8",
              fontWeight: 700,
            }}
          />
        </Box>
      </Box>

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
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#172554" }}>
            Available Opportunities
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B", mt: 1 }}>
            Search by role, company, location, or eligibility.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            void loadDrives();
            void loadMyApplications();
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search jobs or companies..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            bgcolor: "#FFFFFF",
            borderRadius: 3,
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void loadDrives()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
          {" "}
          <Button
            size="small"
            color="inherit"
            onClick={() => navigate("/applications")}
          >
            View applications
          </Button>
        </Alert>
      )}

      {applyError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setApplyError("")}
        >
          {applyError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !error && filteredDrives.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 6, borderRadius: 4 }}>
          <CardContent>
            <BusinessCenterOutlinedIcon
              sx={{ fontSize: 48, color: "#94A3B8", mb: 1 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {drives.length === 0
                ? "No placement drives available"
                : "No matching opportunities"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mt: 1 }}>
              Try changing your search or check back later.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 3,
          }}
        >
          {filteredDrives.map((drive) => {
            const alreadyApplied = appliedDriveIds.includes(drive.id);
            const deadlinePassed = new Date(drive.deadline) <= new Date();
            const isOpen = drive.status === "OPEN" && !deadlinePassed;

            return (
              <Card
                key={drive.id}
                sx={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 4,
                  boxShadow: "0 4px 18px rgba(15,23,42,0.04)",
                  transition: "0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 12px 28px rgba(15,23,42,0.09)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, color: "#172554" }}
                      >
                        {drive.company?.name ?? "Company not specified"}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ color: "#64748B", mt: 0.5 }}
                      >
                        {drive.role}
                      </Typography>
                    </Box>

                    <Chip
                      label={deadlinePassed ? "CLOSED" : drive.status}
                      size="small"
                      color={isOpen ? "success" : "default"}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                      }}
                    >
                      <LocationOnOutlinedIcon fontSize="small" />
                      <Typography variant="body2" sx={{ color: "#64748B" }}>
                        {drive.company?.location ?? "Location not specified"}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: "#64748B" }}>
                      Package:{" "}
                      {drive.package != null
                        ? `${drive.package} LPA`
                        : "Not specified"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#F8FAFC",
                      borderRadius: 2,
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748B", fontWeight: 700 }}
                    >
                      ELIGIBILITY
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "#334155", mt: 0.5 }}
                    >
                      {drive.eligibilityCriteria || "Not specified"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 3,
                    }}
                  >
                    <CalendarMonthOutlinedIcon fontSize="small" />
                    <Typography variant="body2" sx={{ color: "#64748B" }}>
                      Deadline: {formatDeadline(drive.deadline)}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    disabled={
                      !isOpen ||
                      alreadyApplied ||
                      applyingDriveId !== null
                    }
                    onClick={() => void handleApply(drive.id)}
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: "none",
                    }}
                  >
                    {applyingDriveId === drive.id ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : alreadyApplied ? (
                      "Already Applied"
                    ) : !isOpen ? (
                      "Applications Closed"
                    ) : (
                      "Apply Now"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default PlacementDrives;
