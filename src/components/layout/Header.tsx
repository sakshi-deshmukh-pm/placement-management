
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";

import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);

  const role = user?.role?.toUpperCase() ?? "STUDENT";

  const displayRole =
    role === "ADMIN"
      ? "Administrator"
      : role === "STUDENT"
        ? "Student"
        : role;

  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#FFFFFF",
        color: "#172554",
        borderBottom: "1px solid #E8EDF5",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 76 },
          px: { xs: 2, sm: 3, md: 4 },
          gap: { xs: 1, sm: 2 },
        }}
      >
        {/* Application branding */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: 2,
              bgcolor: "#2458D3",
              color: "#FFFFFF",
            }}
          >
            <SchoolRoundedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: 18, md: 21 },
                fontWeight: 800,
                letterSpacing: "-0.6px",
                color: "#172554",
                lineHeight: 1.3,
              }}
            >
              PlaceTrack
            </Typography>

            <Typography
              sx={{
                display: { xs: "none", sm: "block" },
                fontSize: 12,
                color: "#8290A5",
                mt: 0.3,
              }}
            >
              Student Placement Portal
            </Typography>
          </Box>
        </Box>

        {/* User role */}
        <Chip
          label={displayRole}
          size="small"
          variant="outlined"
          sx={{
            display: { xs: "none", sm: "inline-flex" },
            fontWeight: 650,
            fontSize: 11.5,
            borderRadius: 2,
            color: role === "ADMIN" ? "#6D28D9" : "#2458D3",
            bgcolor: role === "ADMIN" ? "#F5F0FF" : "#EFF5FF",
            borderColor: role === "ADMIN" ? "#DDD0FF" : "#D5E3FF",
          }}
        />

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            aria-label="Notifications"
            sx={{
              width: 40,
              height: 40,
              color: "#64748B",
              border: "1px solid #E8EDF5",
              borderRadius: 2.5,
              "&:hover": {
                bgcolor: "#F1F5FF",
                color: "#2458D3",
              },
            }}
          >
            <NotificationsNoneRoundedIcon />
          </IconButton>
        </Tooltip>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            display: { xs: "none", sm: "block" },
            my: 2,
            borderColor: "#E8EDF5",
          }}
        />

        {/* User details */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 1.2,
            maxWidth: 190,
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#2458D3",
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 3px 8px rgba(36, 88, 211, 0.18)",
            }}
          >
            {initials || "U"}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#172554",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 125,
              }}
            >
              {displayName}
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                color: "#8290A5",
              }}
            >
              {displayRole}
            </Typography>
          </Box>

          <KeyboardArrowDownRoundedIcon
            sx={{
              color: "#94A3B8",
              fontSize: 20,
            }}
          />
        </Box>

        {/* Logout */}
        <Tooltip title="Logout">
          <IconButton
            onClick={handleLogout}
            aria-label="Logout"
            sx={{
              width: 40,
              height: 40,
              color: "#DC2626",
              border: "1px solid #FEE2E2",
              borderRadius: 2.5,
              "&:hover": {
                bgcolor: "#FEF2F2",
                borderColor: "#FECACA",
              },
            }}
          >
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
