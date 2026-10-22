
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

import axiosInstance from "../api/axiosInstance";

type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "REJECTED"
  | "SELECTED"
  | string;

type Application = {
  id: number;
  status: ApplicationStatus;
  appliedAt: string;
  student: {
    id: number;
    name: string;
    email: string;
  };
  placementDrive: {
    id: number;
    role: string;
    package: string | number | null;
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

function formatDate(dateValue?: string | null) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPackage(value: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  return String(value);
}

function getStatusStyle(status: string) {
  switch (status) {
    case "APPLIED":
      return {
        label: "Applied",
        color: "#1D4ED8",
        background: "#EFF6FF",
      };

    case "SHORTLISTED":
      return {
        label: "Shortlisted",
        color: "#7C3AED",
        background: "#F5F3FF",
      };

    case "SELECTED":
      return {
        label: "Selected",
        color: "#047857",
        background: "#ECFDF5",
      };

    case "REJECTED":
      return {
        label: "Not Selected",
        color: "#B91C1C",
        background: "#FEF2F2",
      };

    default:
      return {
        label: status.replaceAll("_", " "),
        color: "#475569",
        background: "#F1F5F9",
      };
  }
}

function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await axiosInstance.get<ApplicationsResponse>("/applications");

      if (Array.isArray(response.data?.data)) {
        setApplications(response.data.data);
      } else {
        setApplications([]);
        setError("The server returned an unexpected applications response.");
      }
    } catch (err: unknown) {
      let message = "Unable to load your applications. Please try again.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
          message?: string;
        };

        message =
          apiError.response?.data?.message ??
          apiError.message ??
          message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  const totalApplications = applications.length;

  const underReview = applications.filter(
    (application) =>
      application.status === "APPLIED" ||
      application.status === "SHORTLISTED"
  ).length;

  const selectedApplications = applications.filter(
    (application) => application.status === "SELECTED"
  ).length;

  const summaryItems = [
    {
      label: "Total Applications",
      value: totalApplications,
      color: "#2563EB",
      background: "#EFF6FF",
      icon: <AssignmentOutlinedIcon />,
    },
    {
      label: "Under Review",
      value: underReview,
      color: "#B45309",
      background: "#FFFBEB",
      icon: <HourglassEmptyRoundedIcon />,
    },
    {
      label: "Selected",
      value: selectedApplications,
      color: "#047857",
      background: "#ECFDF5",
      icon: <CheckCircleOutlineRoundedIcon />,
    },
  ];

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto", width: "100%" }}>
      {/* Page heading */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2.5,
              bgcolor: "#F5F3FF",
              color: "#7C3AED",
            }}
          >
            <AssignmentOutlinedIcon sx={{ fontSize: 30 }} />
          </Avatar>

          <Box>
            <Typography
              variant="h4"
              sx={{
                color: "#172554",
                fontWeight: 800,
                letterSpacing: "-0.8px",
                fontSize: { xs: "1.8rem", md: "2.25rem" },
              }}
            >
              My Applications
            </Typography>

            <Typography sx={{ color: "#64748B", mt: 0.7 }}>
              Track your applications and placement progress.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={() => void fetchApplications()}
          disabled={loading}
          sx={{
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 700,
            borderColor: "#DCE4F0",
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* API error */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void fetchApplications()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Summary cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2.5,
          mb: 3,
        }}
      >
        {summaryItems.map((item) => (
          <Card
            key={item.label}
            elevation={0}
            sx={{
              border: "1px solid #E8EDF5",
              borderRadius: 3,
              bgcolor: "#FFFFFF",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#64748B", fontWeight: 600 }}
                >
                  {item.label}
                </Typography>

                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: item.background,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Avatar>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  color: item.color,
                  fontWeight: 800,
                  mt: 1.5,
                  letterSpacing: "-0.5px",
                }}
              >
                {loading ? "—" : item.value}
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  width: 42,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: item.background,
                }}
              />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Loading state */}
      {loading && (
        <Box
          sx={{
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography sx={{ color: "#64748B" }}>
            Loading your applications...
          </Typography>
        </Box>
      )}

      {/* Empty state */}
      {!loading && !error && applications.length === 0 && (
        <Card
          elevation={0}
          sx={{
            border: "1px solid #E8EDF5",
            borderRadius: 3.5,
            bgcolor: "#FFFFFF",
          }}
        >
          <CardContent
            sx={{
              px: { xs: 2, md: 4 },
              py: { xs: 5, md: 7 },
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 76,
                height: 76,
                mx: "auto",
                mb: 2.5,
                bgcolor: "#F5F3FF",
                color: "#7C3AED",
              }}
            >
              <HourglassEmptyRoundedIcon sx={{ fontSize: 36 }} />
            </Avatar>

            <Typography
              variant="h6"
              sx={{ color: "#172554", fontWeight: 800 }}
            >
              No applications yet
            </Typography>

            <Typography
              sx={{
                color: "#64748B",
                mt: 1,
                maxWidth: 480,
                mx: "auto",
                lineHeight: 1.8,
              }}
            >
              Explore available placement drives and submit an application.
              Your application status and updates will appear here.
            </Typography>

            <Button
              variant="contained"
              onClick={() => {
                window.location.href = "/drives";
              }}
              sx={{
                mt: 3,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#2563EB",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#1D4ED8",
                  boxShadow: "none",
                },
              }}
            >
              Explore Placement Drives
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Applications list */}
      {!loading && !error && applications.length > 0 && (
        <Box>
          <Typography
            variant="h6"
            sx={{ color: "#172554", fontWeight: 800, mb: 2 }}
          >
            Application History
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2.5,
            }}
          >
            {applications.map((application) => {
              const statusStyle = getStatusStyle(application.status);

              return (
                <Card
                  key={application.id}
                  elevation={0}
                  sx={{
                    border: "1px solid #E8EDF5",
                    borderRadius: 3.5,
                    bgcolor: "#FFFFFF",
                    transition: "box-shadow 0.2s ease, transform 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
                    },
                  }}
                >
                  <CardContent
                    sx={{ p: 3, "&:last-child": { pb: 3 } }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 2.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          minWidth: 0,
                        }}
                      >
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 2.5,
                            bgcolor: "#EFF6FF",
                            color: "#2563EB",
                          }}
                        >
                          <BusinessRoundedIcon />
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#172554",
                              fontWeight: 800,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {application.placementDrive.company.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{ color: "#64748B", mt: 0.4 }}
                          >
                            {application.placementDrive.role}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        size="small"
                        label={statusStyle.label}
                        sx={{
                          flexShrink: 0,
                          bgcolor: statusStyle.background,
                          color: statusStyle.color,
                          fontWeight: 700,
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        mb: 2.5,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#94A3B8" }}
                        >
                          Package
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#334155", fontWeight: 700, mt: 0.5 }}
                        >
                          {formatPackage(application.placementDrive.package)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#94A3B8" }}
                        >
                          Location
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#334155", fontWeight: 700, mt: 0.5 }}
                        >
                          {application.placementDrive.company.location ||
                            "Not specified"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#94A3B8" }}
                        >
                          Applied on
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            mt: 0.5,
                          }}
                        >
                          <CalendarMonthRoundedIcon
                            sx={{ fontSize: 17, color: "#64748B" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "#334155", fontWeight: 600 }}
                          >
                            {formatDate(application.appliedAt)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#94A3B8" }}
                        >
                          Application ID
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#334155", fontWeight: 700, mt: 0.5 }}
                        >
                          #{application.id}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        pt: 2,
                        borderTop: "1px solid #F1F5F9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                        Deadline: {formatDate(application.placementDrive.deadline)}
                      </Typography>

                      <Chip
                        size="small"
                        label="Application submitted"
                        sx={{
                          bgcolor: "#F8FAFC",
                          color: "#475569",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default MyApplications;
