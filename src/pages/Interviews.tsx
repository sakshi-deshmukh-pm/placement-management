
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";

import axiosInstance from "../api/axiosInstance";

type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface InterviewApiItem {
  id: number;
  round: string;
  scheduledAt: string;
  mode: string;
  meetingLink?: string | null;
  status: InterviewStatus;
  feedback?: string | null;
  application: {
    user: {
      id: number;
      name: string;
      email: string;
      rollNumber: string;
      branch: string;
      year: number;
    };
    placementDrive: {
      company: {
        name: string;
      };
      [key: string]: unknown;
    };
  };
}

interface Interview {
  id: number;
  company: string;
  role: string;
  round: string;
  date: string;
  time: string;
  mode: string;
  location: string;
  meetingLink?: string | null;
  status: InterviewStatus;
  feedback?: string | null;
  studentId: number;
}

interface ApiResponse {
  message: string;
  data: InterviewApiItem[];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRole(drive: Record<string, unknown>) {
  const possibleFields = ["jobRole", "role", "title", "position"];

  for (const field of possibleFields) {
    const value = drive[field];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "Placement Opportunity";
}

function getCurrentUserId(): number | null {
  // Update this function to match the user object stored by your login flow.
  const possibleKeys = ["user", "loggedInUser", "currentUser"];

  for (const key of possibleKeys) {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) continue;

    try {
      const parsed = JSON.parse(rawValue) as {
        id?: number | string;
        user?: { id?: number | string };
      };

      const id = parsed.user?.id ?? parsed.id;
      const numericId = Number(id);

      if (Number.isInteger(numericId) && numericId > 0) {
        return numericId;
      }
    } catch {
      // Ignore values that are not JSON.
    }
  }

  return null;
}

function Interviews() {
  const [filter, setFilter] = useState("ALL");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchInterviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axiosInstance.get<ApiResponse>("/interviews");

        if (!active) return;

        const currentUserId = getCurrentUserId();

        if (currentUserId === null) {
          setInterviews([]);
          setError(
            "Unable to identify the logged-in student. Please check your login user storage."
          );
          return;
        }

        const mappedInterviews: Interview[] = response.data.data
          .filter(
            (item) => item.application.user.id === currentUserId
          )
          .map((item) => {
            const drive = item.application.placementDrive;

            return {
              id: item.id,
              company: drive.company.name,
              role: getRole(drive),
              round: item.round,
              date: item.scheduledAt,
              time: formatTime(item.scheduledAt),
              mode: item.mode,
              location:
                item.meetingLink ||
                (item.mode === "ONLINE" ? "Online meeting" : "Venue not specified"),
              meetingLink: item.meetingLink,
              status: item.status,
              feedback: item.feedback,
              studentId: item.application.user.id,
            };
          });

        setInterviews(mappedInterviews);
      } catch {
        if (active) {
          setError(
            "Unable to load interviews. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchInterviews();

    return () => {
      active = false;
    };
  }, []);

  const filteredInterviews = useMemo(
    () =>
      interviews.filter(
        (interview) =>
          filter === "ALL" || interview.status === filter
      ),
    [interviews, filter]
  );

  const scheduledCount = interviews.filter(
    (item) => item.status === "SCHEDULED"
  ).length;

  const completedCount = interviews.filter(
    (item) => item.status === "COMPLETED"
  ).length;

  const statusStyle = (status: InterviewStatus) => {
    switch (status) {
      case "SCHEDULED":
        return { color: "#1D4ED8", bgcolor: "#EFF6FF" };
      case "COMPLETED":
        return { color: "#047857", bgcolor: "#ECFDF5" };
      case "CANCELLED":
        return { color: "#B91C1C", bgcolor: "#FEF2F2" };
    }
  };

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 56,
              height: 56,
              bgcolor: "#EAF1FF",
              color: "#2458D3",
              borderRadius: 2.5,
            }}
          >
            <EventAvailableRoundedIcon sx={{ fontSize: 30 }} />
          </Avatar>

          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#172554",
                fontSize: { xs: "1.8rem", md: "2.25rem" },
              }}
            >
              My Interviews
            </Typography>

            <Typography sx={{ color: "#64748B", mt: 0.7 }}>
              Keep track of your placement interview schedule.
            </Typography>
          </Box>
        </Box>

        <Select
          size="small"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          sx={{ minWidth: 170, borderRadius: 2.5 }}
          aria-label="Filter interviews by status"
        >
          <MenuItem value="ALL">All Interviews</MenuItem>
          <MenuItem value="SCHEDULED">Scheduled</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </Select>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button
            size="small"
            onClick={() => window.location.reload()}
            sx={{ ml: 1 }}
          >
            Retry
          </Button>
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          {
            label: "Total Interviews",
            value: interviews.length,
            color: "#2563EB",
          },
          {
            label: "Scheduled",
            value: scheduledCount,
            color: "#7C3AED",
          },
          {
            label: "Completed",
            value: completedCount,
            color: "#047857",
          },
        ].map((item) => (
          <Card
            key={item.label}
            elevation={0}
            sx={{ border: "1px solid #E8EDF5", borderRadius: 3 }}
          >
            <CardContent>
              <Typography sx={{ color: "#64748B", fontWeight: 600 }}>
                {item.label}
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: item.color, fontWeight: 800, mt: 1 }}
              >
                {loading ? "—" : item.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            py: 8,
          }}
        >
          <CircularProgress size={28} />
          <Typography color="text.secondary">
            Loading interviews...
          </Typography>
        </Box>
      ) : !error && filteredInterviews.length === 0 ? (
        <Card
          elevation={0}
          sx={{ border: "1px solid #E8EDF5", borderRadius: 3 }}
        >
          <CardContent sx={{ py: 6, textAlign: "center" }}>
            <EventAvailableRoundedIcon
              sx={{ fontSize: 48, color: "#94A3B8", mb: 1 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              No interviews found
            </Typography>
            <Typography sx={{ color: "#64748B", mt: 1 }}>
              {filter === "ALL"
                ? "Your scheduled interviews will appear here."
                : `There are no ${filter.toLowerCase()} interviews.`}
            </Typography>
          </CardContent>
        </Card>
      ) : !error ? (
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
          {filteredInterviews.map((interview) => (
            <Card
              key={interview.id}
              elevation={0}
              sx={{
                border: "1px solid #E8EDF5",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 2,
                    mb: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Avatar
                      variant="rounded"
                      sx={{
                        bgcolor: "#EFF6FF",
                        color: "#2563EB",
                        width: 48,
                        height: 48,
                      }}
                    >
                      <BusinessRoundedIcon />
                    </Avatar>

                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: "#172554", fontWeight: 800 }}
                      >
                        {interview.company}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748B" }}>
                        {interview.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    size="small"
                    label={interview.status.replace("_", " ")}
                    sx={{
                      ...statusStyle(interview.status),
                      fontWeight: 700,
                    }}
                  />
                </Box>

                <Typography sx={{ fontWeight: 700, color: "#334155", mb: 2 }}>
                  {interview.round}
                </Typography>

                <Box sx={{ display: "grid", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EventAvailableRoundedIcon
                      sx={{ color: "#64748B", fontSize: 20 }}
                    />
                    <Typography variant="body2">
                      {formatDate(interview.date)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeRoundedIcon
                      sx={{ color: "#64748B", fontSize: 20 }}
                    />
                    <Typography variant="body2">{interview.time}</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnRoundedIcon
                      sx={{ color: "#64748B", fontSize: 20 }}
                    />
                    <Typography variant="body2">
                      {interview.mode} · {interview.mode === "ONLINE" ? "Online" : interview.location}
                    </Typography>
                  </Box>

                  {interview.meetingLink && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <VideocamRoundedIcon
                        sx={{ color: "#64748B", fontSize: 20 }}
                      />
                      <Button
                        component="a"
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ textTransform: "none" }}
                      >
                        Join interview
                      </Button>
                    </Box>
                  )}

                  {interview.feedback && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        bgcolor: "#F8FAFC",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748B", fontWeight: 700 }}
                      >
                        FEEDBACK
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {interview.feedback}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

export default Interviews;
