
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Link,
} from "react-router-dom";

import type { ReactNode } from "react";

import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";

import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import PlacementDrives from "./pages/PlacementDrives";
import MyApplications from "./pages/MyApplications";
import Interviews from "./pages/Interviews";
import ManageStudents from "./pages/ManageStudents";
import ManageApplications from "./pages/ManageApplications";
import ManagePlacementDrives from "./pages/ManagePlacementDrives";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from "@mui/material";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

// Logged-in user information saved in localStorage.
type SavedUser = {
  email?: string;
  name?: string;
  role?: string;
};

function getSavedUser(): SavedUser | null {
  try {
    const user = localStorage.getItem("user");

    if (!user) {
      return null;
    }

    return JSON.parse(user) as SavedUser;
  } catch {
    return null;
  }
}

function getUserRole(): string | null {
  const user = getSavedUser();
  const role = user?.role ?? localStorage.getItem("role");

  return role ? role.toUpperCase() : null;
}

// Protect routes that require login.
function RequireAuth({
  children,
}: {
  children: ReactNode;
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Protect routes according to the user's role.
function RequireRole({
  allowedRole,
  children,
}: {
  allowedRole: string;
  children: ReactNode;
}) {
  const role = getUserRole();

  if (role !== allowedRole) {
    if (role === "ADMIN") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    if (role === "STUDENT") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Placeholder for admin sections not yet implemented.
function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 750, color: "#172554", mb: 1 }}
      >
        {title}
      </Typography>

      <Typography sx={{ color: "#64748B", mb: 2 }}>
        {description}
      </Typography>

      <Typography sx={{ color: "#64748B" }}>
        This section is ready for implementation.
      </Typography>
    </Box>
  );
}

// Admin dashboard with MUI management cards.
function AdminDashboard() {
  const cards = [
    {
      title: "Students",
      description: "View and manage student records.",
      link: "/admin/students",
      button: "Manage Students",
      icon: <PeopleAltOutlinedIcon />,
      color: "#2563EB",
      background: "#DBEAFE",
    },
    {
      title: "Placement Drives",
      description: "Create and manage placement drives.",
      link: "/admin/drives",
      button: "Manage Drives",
      icon: <BusinessOutlinedIcon />,
      color: "#0D9488",
      background: "#CCFBF1",
    },
    {
      title: "Applications",
      description: "Review student applications.",
      link: "/admin/applications",
      button: "Manage Applications",
      icon: <AssignmentOutlinedIcon />,
      color: "#7C3AED",
      background: "#EDE9FE",
    },
    {
      title: "Interviews",
      description: "Manage interview schedules and results.",
      link: "/admin/interviews",
      button: "Manage Interviews",
      icon: <EventAvailableOutlinedIcon />,
      color: "#D97706",
      background: "#FEF3C7",
    },
  ];

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 750,
          color: "#172554",
          mb: 1,
        }}
      >
        Admin Dashboard
      </Typography>

      <Typography sx={{ color: "#64748B", mb: 4 }}>
        Welcome to the PlaceTrack administration portal.
        Manage students, placement drives, applications, and interviews.
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid #E2E8F0",
                borderRadius: 3,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: card.background,
                    color: card.color,
                    mb: 2.5,
                  }}
                >
                  {card.icon}
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#172554",
                    mb: 1,
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    minHeight: 42,
                    mb: 2,
                  }}
                >
                  {card.description}
                </Typography>

                <Button
                  component={Link}
                  to={card.link}
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    px: 0,
                    textTransform: "none",
                    fontWeight: 650,
                    color: card.color,
                  }}
                >
                  {card.button}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <RequireRole allowedRole="STUDENT">
                <DashboardLayout>
                  <DashboardHome />
                </DashboardLayout>
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Student profile */}
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <RequireRole allowedRole="STUDENT">
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Placement drives */}
        <Route
          path="/drives"
          element={
            <RequireAuth>
              <RequireRole allowedRole="STUDENT">
                <DashboardLayout>
                  <PlacementDrives />
                </DashboardLayout>
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Student applications */}
        <Route
          path="/applications"
          element={
            <RequireAuth>
              <RequireRole allowedRole="STUDENT">
                <DashboardLayout>
                  <MyApplications />
                </DashboardLayout>
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Student interviews */}
        <Route
          path="/interviews"
          element={
            <RequireAuth>
              <RequireRole allowedRole="STUDENT">
                <DashboardLayout>
                  <Interviews />
                </DashboardLayout>
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Admin dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <RequireAuth>
              <RequireRole allowedRole="ADMIN">
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Admin: Manage students */}
        <Route
          path="/admin/students"
          element={
            <RequireAuth>
              <RequireRole allowedRole="ADMIN">
                <DashboardLayout>
                  <ManageStudents />
                </DashboardLayout>
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Admin: Manage placement drives */}
        <Route
          path="/admin/drives"
          element={
            <RequireAuth>
              <RequireRole allowedRole="ADMIN">
                <DashboardLayout>
                  <ManagePlacementDrives />
                </DashboardLayout>
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Admin: Manage applications */}
        <Route
          path="/admin/applications"
          element={
            <RequireAuth>
              <RequireRole allowedRole="ADMIN">
                <DashboardLayout>
                  <ManageApplications />
                </DashboardLayout>
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Admin: Manage interviews */}
        <Route
          path="/admin/interviews"
          element={
            <RequireAuth>
              <RequireRole allowedRole="ADMIN">
                <DashboardLayout>
                  <PlaceholderPage
                    title="Manage Interviews"
                    description="Manage interview schedules and results."
                  />
                </DashboardLayout>
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* Default route */}
        <Route
          path="/"
          element={
            getUserRole() === "ADMIN" ? (
              <Navigate to="/admin-dashboard" replace />
            ) : localStorage.getItem("token") ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={
            localStorage.getItem("token") ? (
              <Navigate
                to={
                  getUserRole() === "ADMIN"
                    ? "/admin-dashboard"
                    : "/dashboard"
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
