
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { NavLink, useLocation } from "react-router-dom";

const drawerWidth = 260;

type MenuItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

type SideNavProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

function SideNav({
  mobileOpen = false,
  onClose,
}: SideNavProps) {
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");

  const menuItems: MenuItem[] = isAdmin
    ? [
        {
          label: "Dashboard",
          path: "/admin-dashboard",
          icon: <DashboardRoundedIcon />,
        },
        {
          label: "Manage Students",
          path: "/admin/students",
          icon: <PeopleOutlineRoundedIcon />,
        },
        {
          label: "Placement Drives",
          path: "/admin/drives",
          icon: <WorkOutlineRoundedIcon />,
        },
        {
          label: "Applications",
          path: "/admin/applications",
          icon: <AssignmentOutlinedIcon />,
        },
        {
          label: "Interviews",
          path: "/admin/interviews",
          icon: <EventAvailableRoundedIcon />,
        },
      ]
    : [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: <DashboardRoundedIcon />,
        },
        {
          label: "Placement Drives",
          path: "/drives",
          icon: <WorkOutlineRoundedIcon />,
        },
        {
          label: "My Applications",
          path: "/applications",
          icon: <AssignmentOutlinedIcon />,
        },
        {
          label: "Interviews",
          path: "/interviews",
          icon: <EventAvailableRoundedIcon />,
        },
        {
          label: "My Profile",
          path: "/profile",
          icon: <PeopleOutlineRoundedIcon />,
        },
      ];

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FFFFFF",
        px: 2,
        py: 2.5,
        boxSizing: "border-box",
      }}
    >

      {/* Menu heading */}
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "1.2px",
          color: "#94A3B8",
          mb: 1,
          px: 1.5,
        }}
      >
        {isAdmin ? "ADMINISTRATION" : "STUDENT PORTAL"}
      </Typography>

      <Typography
        sx={{
          fontSize: 12,
          color: "#8290A5",
          mb: 2.5,
          px: 1.5,
          lineHeight: 1.6,
        }}
      >
        {isAdmin
          ? "Manage placement activities and records."
          : "Your journey towards the next opportunity."}
      </Typography>

      {/* Navigation items */}
      <List disablePadding>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onClose}
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              borderRadius: 2.5,
              mb: 0.7,
              px: 1.5,
              py: 1.35,
              color: "#64748B",
              transition: "all 0.2s ease",

              "& .MuiListItemIcon-root": {
                minWidth: 40,
                color: "inherit",
                transition: "color 0.2s ease",
              },

              "& .MuiListItemText-primary": {
                fontSize: 13.5,
                fontWeight: 600,
              },

              "&.active": {
                bgcolor: "#EAF1FF",
                color: "#2458D3",

                "& .MuiListItemIcon-root": {
                  color: "#2458D3",
                },

                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "20%",
                  height: "60%",
                  width: 3,
                  borderRadius: "0 4px 4px 0",
                  bgcolor: "#2458D3",
                },
              },

              "&:hover": {
                bgcolor: "#F4F7FC",
                color: "#2458D3",
              },

              "&.active:hover": {
                bgcolor: "#EAF1FF",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>

            <ListItemText
              primary={item.label}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: 13.5,
                    fontWeight: 600,
                  },
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Bottom information card */}
      <Box sx={{ mt: "auto", pt: 3 }}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            p: 2,
            borderRadius: 3,
            bgcolor: "#F1F5FF",
            border: "1px solid #E2EAFE",
          }}
        >
          <Box
            sx={{
              width: 35,
              height: 35,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: "#FFFFFF",
              color: "#2458D3",
              mb: 1.5,
            }}
          >
            <SchoolRoundedIcon fontSize="small" />
          </Box>

          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 750,
              color: "#2449A5",
              mb: 0.8,
            }}
          >
            {isAdmin
              ? "Everything in one place"
              : "Your next opportunity awaits!"}
          </Typography>

          <Typography
            sx={{
              fontSize: 11.5,
              color: "#64748B",
              lineHeight: 1.7,
            }}
          >
            {isAdmin
              ? "Keep student records and placement activities organized."
              : "Keep your profile updated and stay ready for placement drives."}
          </Typography>

          {!isAdmin && (
            <Box
              component={NavLink}
              to="/profile"
              onClick={onClose}
              sx={{
                mt: 1.5,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                color: "#2458D3",
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 700,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Update profile
              <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
            </Box>
          )}
        </Box>

        <Typography
          sx={{
            textAlign: "center",
            color: "#94A3B8",
            fontSize: 10.5,
            mt: 2,
          }}
        >
          PlaceTrack · Placement Portal
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            position: "relative",
            height: "100%",
            borderRight: "1px solid #E8EDF5",
            bgcolor: "#FFFFFF",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            maxWidth: "85vw",
            boxSizing: "border-box",
            bgcolor: "#FFFFFF",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default SideNav;
