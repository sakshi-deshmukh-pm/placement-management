
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from "@mui/material";

import { Link } from "react-router-dom";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

function CoordinatorDashboard() {
  const cards = [
    {
      title: "Students",
      description: "View and manage student records.",
      link: "/coordinator/students",
      button: "Manage Students",
      icon: <PeopleAltOutlinedIcon />,
      color: "#2563EB",
      background: "#DBEAFE",
    },
    {
      title: "Placement Drives",
      description: "Create and manage placement drives.",
      link: "/coordinator/drives",
      button: "Manage Drives",
      icon: <BusinessOutlinedIcon />,
      color: "#0D9488",
      background: "#CCFBF1",
    },
    {
      title: "Applications",
      description: "Review student applications.",
      link: "/coordinator/applications",
      button: "Manage Applications",
      icon: <AssignmentOutlinedIcon />,
      color: "#7C3AED",
      background: "#EDE9FE",
    },
    {
      title: "Interviews",
      description: "Manage interview schedules and results.",
      link: "/coordinator/interviews",
      button: "Manage Interviews",
      icon: <EventAvailableOutlinedIcon />,
      color: "#D97706",
      background: "#FEF3C7",
    },
    {
  title: "Add Company",
  description: "Register and manage company details.",
  link: "/coordinator/companies",
  button: "Add Company",
  icon: <BusinessOutlinedIcon />,
  color: "#0891B2",
  background: "#CFFAFE",
},
 
  ];

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 750, color: "#172554", mb: 1 }}
      >
        Placement Coordinator Dashboard
      </Typography>

      <Typography sx={{ color: "#64748B", mb: 4 }}>
        Manage students and coordinate placement activities.
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
                  sx={{ fontWeight: 700, color: "#172554", mb: 1 }}
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: "#64748B", minHeight: 42, mb: 2 }}
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

export default CoordinatorDashboard;
