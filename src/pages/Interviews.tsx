
import { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";

type InterviewStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED";

type Interview = {
  id: number;
  company: string;
  role: string;
  round: string;
  date: string;
  time: string;
  mode: string;
  location: string;
  status: InterviewStatus;
};

const sampleInterviews: Interview[] = [
  {
    id: 1,
    company: "Tech Solutions",
    role: "Software Developer",
    round: "Technical Interview",
    date: "2026-11-05",
    time: "10:00 AM",
    mode: "Online",
    location: "Google Meet",
    status: "SCHEDULED",
  },
  {
    id: 2,
    company: "Digital Systems",
    role: "Frontend Developer",
    round: "HR Interview",
    date: "2026-10-10",
    time: "02:00 PM",
    mode: "Offline",
    location: "Pune",
    status: "COMPLETED",
  },
];

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Interviews() {
  const [filter, setFilter] = useState("ALL");

  const interviews = sampleInterviews.filter(
    (interview) =>
      filter === "ALL" || interview.status === filter
  );

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
        >
          <MenuItem value="ALL">All Interviews</MenuItem>
          <MenuItem value="SCHEDULED">Scheduled</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </Select>
      </Box>

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
            value: sampleInterviews.length,
            color: "#2563EB",
          },
          {
            label: "Scheduled",
            value: sampleInterviews.filter(
              (item) => item.status === "SCHEDULED"
            ).length,
            color: "#7C3AED",
          },
          {
            label: "Completed",
            value: sampleInterviews.filter(
              (item) => item.status === "COMPLETED"
            ).length,
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
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {interviews.length === 0 ? (
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
              There are no interviews for this filter.
            </Typography>
          </CardContent>
        </Card>
      ) : (
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
          {interviews.map((interview) => (
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
                      {interview.mode} · {interview.location}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Typography
        variant="caption"
        sx={{ display: "block", color: "#94A3B8", mt: 3 }}
      >
        Demo data only. Interview information is not yet connected to the backend.
      </Typography>
    </Box>
  );
}

export default Interviews;
