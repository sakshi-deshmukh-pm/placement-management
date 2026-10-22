
import { Box, Divider, Typography } from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#FFFFFF",
        borderTop: "1px solid #E8EDF5",
        mt: "auto",
        px: { xs: 2, md: 4 },
        py: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SchoolRoundedIcon sx={{ color: "#2563EB", fontSize: 20 }} />

          <Typography
            variant="body2"
            sx={{ color: "#64748B", fontWeight: 600 }}
          >
            PlaceTrack
          </Typography>
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: "none", sm: "block" }, borderColor: "#E8EDF5" }}
        />

        <Typography
          variant="caption"
          sx={{ color: "#94A3B8", textAlign: "center" }}
        >
          © {new Date().getFullYear()} PlaceTrack · Student Placement Portal
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: "#64748B", textAlign: "center" }}
        >
          Learn. Apply. Grow.
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
