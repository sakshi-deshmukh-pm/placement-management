
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
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import axiosInstance from "../api/axiosInstance";

type PlacementDriveResponse = {
  message: string;
  data: unknown[];
};

function DashboardHome() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const [driveCount, setDriveCount] = useState(0);
  const [loadingDrives, setLoadingDrives] = useState(true);
  const [driveError, setDriveError] = useState("");

  const fetchDrives = useCallback(async () => {
    try {
      setLoadingDrives(true);
      setDriveError("");

      const response =
        await axiosInstance.get<PlacementDriveResponse>(
          "/placement-drives"
        );

      setDriveCount(response.data.data.length);
    } catch (error) {
      console.error("Unable to load placement drives:", error);

      setDriveError(
        "Placement drives could not be loaded. Please try again."
      );
    } finally {
      setLoadingDrives(false);
    }
  }, []);

  useEffect(() => {
    void fetchDrives();
  }, [fetchDrives]);

  const firstName =
    user?.name?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0]?.split(/[._-]/)[0] ||
    "Student";

  const summaryItems = [
    {
      title: "Available Drives",
      count: loadingDrives
        ? null
        : driveError
          ? "—"
          : driveCount,
      description: "Explore new opportunities",
      icon: <WorkOutlineRoundedIcon />,
      color: "#2563EB",
      background: "#EFF6FF",
      path: "/drives",
    },
    {
      title: "My Applications",
      count: "—",
      description: "Track your application status",
      icon: <AssignmentOutlinedIcon />,
      color: "#7C3AED",
      background: "#F5F3FF",
      path: "/applications",
    },
    {
      title: "Upcoming Interviews",
      count: "—",
      description: "Stay prepared for interviews",
      icon: <EventAvailableRoundedIcon />,
      color: "#0F766E",
      background: "#F0FDFA",
      path: "/interviews",
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: 1440, mx: "auto" }}>
      {/* Welcome banner */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: 3, md: 4 },
          p: { xs: 3, md: 4 },
          mb: 4,
          color: "#FFFFFF",
          background:
            "linear-gradient(120deg, #172554 0%, #1D4ED8 58%, #6366F1 100%)",
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.07)",
            right: -60,
            top: -110,
          }}
        />

        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "50%",
            border: "28px solid rgba(255,255,255,0.06)",
            right: { xs: -25, sm: 100 },
            bottom: -110,
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            icon={<SchoolRoundedIcon />}
            label="STUDENT PORTAL"
            size="small"
            sx={{
              mb: 2,
              color: "#FFFFFF",
              bgcolor: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.2)",
              fontWeight: 700,
              "& .MuiChip-icon": { color: "#FFFFFF" },
            }}
          />

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.8px",
              fontSize: { xs: "1.8rem", md: "2.4rem" },
              overflowWrap: "anywhere",
            }}
          >
            Welcome back, {firstName}!
          </Typography>

          <Typography
            sx={{
              mt: 1.5,
              maxWidth: 620,
              color: "#DBEAFE",
              lineHeight: 1.8,
            }}
          >
            Your next career opportunity could be one application away.
            Explore placement drives and keep your profile ready.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mt: 3, alignItems: { xs: "stretch", sm: "center" } }}
          >
            <Button
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => navigate("/drives")}
              sx={{
                bgcolor: "#FFFFFF",
                color: "#1D4ED8",
                borderRadius: 2.5,
                px: 2.5,
                py: 1.2,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#EFF6FF" },
              }}
            >
              Explore Placement Drives
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/profile")}
              sx={{
                color: "#FFFFFF",
                borderColor: "rgba(255,255,255,0.45)",
                borderRadius: 2.5,
                px: 2.5,
                py: 1.2,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#FFFFFF",
                  bgcolor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              View My Profile
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Overview heading */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: "#172554",
              fontWeight: 800,
              fontSize: { xs: "1.3rem", sm: "1.5rem" },
            }}
          >
            Your Placement Overview
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "#64748B", mt: 0.7 }}
          >
            A quick look at your placement journey.
          </Typography>
        </Box>

        <Chip
          icon={<TrendingUpRoundedIcon />}
          label="Career progress"
          sx={{
            bgcolor: "#ECFDF5",
            color: "#047857",
            fontWeight: 700,
            "& .MuiChip-icon": { color: "#059669" },
          }}
        />
      </Box>

      {/* Drive loading and error feedback */}
      {driveError && (
        <Alert
          severity="error"
          sx={{ mb: 2.5, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void fetchDrives()}
              disabled={loadingDrives}
            >
              Retry
            </Button>
          }
        >
          {driveError}
        </Alert>
      )}

      {/* Summary cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        {summaryItems.map((item) => (
          <Card
            key={item.title}
            elevation={0}
            sx={{
              minWidth: 0,
              height: "100%",
              border: "1px solid #E8EDF5",
              borderRadius: 3,
              bgcolor: "#FFFFFF",
              transition:
                "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow:
                  "0 12px 28px rgba(15, 23, 42, 0.08)",
              },
            }}
          >
            <CardContent
              sx={{ p: 3, "&:last-child": { pb: 3 } }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748B", fontWeight: 600 }}
                  >
                    {item.title}
                  </Typography>

                  <Box
                    sx={{
                      mt: 1.5,
                      minHeight: 46,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.count === null ? (
                      <CircularProgress
                        size={28}
                        aria-label="Loading placement drives"
                      />
                    ) : (
                      <Typography
                        variant="h3"
                        sx={{
                          color: "#172554",
                          fontWeight: 800,
                          letterSpacing: "-1px",
                          fontSize: "2.5rem",
                        }}
                      >
                        {item.count}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Avatar
                  variant="rounded"
                  sx={{
                    width: 52,
                    height: 52,
                    flexShrink: 0,
                    borderRadius: 2.5,
                    bgcolor: item.background,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Avatar>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                  mt: 1.5,
                  minHeight: 20,
                  lineHeight: 1.6,
                }}
              >
                {item.description}
              </Typography>

              <Button
                onClick={() => navigate(item.path)}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  mt: 2.5,
                  px: 0,
                  color: item.color,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "transparent",
                    opacity: 0.8,
                  },
                }}
              >
                View details
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Placement guidance */}
      <Card
        elevation={0}
        sx={{
          mt: 4,
          border: "1px solid #E8EDF5",
          borderRadius: 3,
          bgcolor: "#FFFFFF",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#172554",
                  fontSize: { xs: "1.05rem", sm: "1.25rem" },
                }}
              >
                Make the most of your placement journey
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                  mt: 1,
                  lineHeight: 1.8,
                }}
              >
                Keep your student profile updated, check eligibility
                criteria before applying, and review your applications
                regularly so you don't miss important placement updates.
              </Typography>

              <Button
                variant="outlined"
                onClick={() => navigate("/profile")}
                sx={{
                  mt: 2.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Review profile
              </Button>
            </Box>

            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                justifyContent: "center",
                width: 54,
                height: 54,
                flexShrink: 0,
                borderRadius: 3,
                bgcolor: "#EFF6FF",
                color: "#2563EB",
              }}
            >
              <SchoolRoundedIcon sx={{ fontSize: 28 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default DashboardHome;
