import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  Alert,
} from "@mui/material";
import {
  Navigation,
  ContentCopy,
  CheckCircle,
  Phone,
  DirectionsCar,
  LocalParking,
  Place,
  Flight,
  TempleBuddhist,
  ShoppingBag,
  Nature,
  MapOutlined,
} from "@mui/icons-material";
import { CONTACTS, LOCATION, PROPERTY, SOCIAL_LINKS } from "@configs/app-settings";
import { useTranslation } from "react-i18next";
import LineIcon from "../assets/icons/line.svg";

function Map() {
  const isMobile = useMediaQuery("(max-width:800px)");
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);

  const coordinates = `${LOCATION.lat}, ${LOCATION.lng}`;

  const handleNavigation = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`;
    window.open(googleMapsUrl, "_blank");
  };

  const handleCopyGps = () => {
    navigator.clipboard.writeText(coordinates);
    setCopied(true);
  };

  const landmarks = [
    {
      icon: <Flight sx={{ color: "#2563eb", fontSize: 22 }} />,
      name: t("map.landmarkAirport"),
      time: t("map.landmarkAirportTime"),
    },
    {
      icon: <TempleBuddhist sx={{ color: "#d97706", fontSize: 22 }} />,
      name: t("map.landmarkTemple"),
      time: t("map.landmarkTempleTime"),
    },
    {
      icon: <ShoppingBag sx={{ color: "#db2777", fontSize: 22 }} />,
      name: t("map.landmarkMall"),
      time: t("map.landmarkMallTime"),
    },
    {
      icon: <Nature sx={{ color: "#16a34a", fontSize: 22 }} />,
      name: t("map.landmarkKiriwong"),
      time: t("map.landmarkKiriwongTime"),
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 1.5, sm: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      {/* Header Banner */}
      <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
        <Chip
          icon={<MapOutlined sx={{ fontSize: 16 }} />}
          label={t("map.title")}
          sx={{
            bgcolor: "rgba(176, 48, 82, 0.08)",
            color: "#B03052",
            fontWeight: 600,
            mb: 1.5,
            px: 1,
          }}
        />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1e293b",
            fontSize: { xs: "1.5rem", sm: "2rem" },
            mb: 1,
          }}
        >
          {i18n.language === "en" ? PROPERTY.nameEn : PROPERTY.nameThFull}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#64748b", maxWidth: 650, mx: "auto", fontSize: { xs: "0.9rem", sm: "1rem" } }}
        >
          {t("map.subtitle")}
        </Typography>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Interactive Map */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ position: "relative", width: "100%", flex: 1, minHeight: { xs: 350, sm: 440 } }}>
              <iframe
                src={LOCATION.googleMapsEmbed}
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  display: "block",
                  minHeight: isMobile ? "350px" : "440px",
                }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Aunya Pool Villa Location"
              />
            </Box>

            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                bgcolor: "#fff",
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<Navigation />}
                onClick={handleNavigation}
                size="large"
                sx={{
                  flex: { xs: "1 1 100%", sm: "auto" },
                  borderRadius: 3,
                  py: 1.2,
                  px: 3,
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(176, 48, 82, 0.3)",
                }}
              >
                {t("map.button")}
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                startIcon={copied ? <CheckCircle color="success" /> : <ContentCopy />}
                onClick={handleCopyGps}
                sx={{
                  flex: { xs: "1 1 100%", sm: "auto" },
                  borderRadius: 3,
                  borderColor: "#cbd5e1",
                  color: "#475569",
                  py: 1.2,
                  fontWeight: 500,
                  "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
                }}
              >
                {copied ? t("map.copiedGps") : t("map.copyGps")}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Address, Contact & Landmarks */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            {/* Card 1: Address & Coordinates */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                p: 2.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2.5,
                    bgcolor: "rgba(176, 48, 82, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#B03052",
                  }}
                >
                  <Place sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                  {t("map.addressTitle")}
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6, mb: 2 }}>
                {t("map.addressText")}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  bgcolor: "#f8fafc",
                  borderRadius: 2.5,
                  border: "1px solid #f1f5f9",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t("map.gpsLabel")}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#1e293b">
                    {coordinates}
                  </Typography>
                </Box>
                <Tooltip title={t("map.copyGps")}>
                  <IconButton size="small" onClick={handleCopyGps} sx={{ color: "#64748b" }}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Quick Contact Buttons */}
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 1 }}>
                {t("map.contactTitle")}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  component="a"
                  href={`tel:${CONTACTS[0].phone}`}
                  variant="outlined"
                  size="small"
                  startIcon={<Phone sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: 2.5,
                    borderColor: "#e2e8f0",
                    color: "#334155",
                    fontSize: "0.82rem",
                    justifyContent: "flex-start",
                    flex: 1,
                  }}
                >
                  {CONTACTS[0].phoneDisplay}
                </Button>
                <Button
                  component="a"
                  href={SOCIAL_LINKS.line}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                  startIcon={<Box component="img" src={LineIcon} width={15} />}
                  sx={{
                    borderRadius: 2.5,
                    borderColor: "#06C755",
                    color: "#059669",
                    fontSize: "0.82rem",
                    justifyContent: "flex-start",
                    flex: 1,
                  }}
                >
                  Line: {SOCIAL_LINKS.lineId}
                </Button>
              </Stack>
            </Card>

            {/* Card 2: Nearby Landmarks */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                p: 2.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2.5,
                    bgcolor: "rgba(37, 99, 235, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563eb",
                  }}
                >
                  <DirectionsCar sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                  {t("map.landmarksTitle")}
                </Typography>
              </Stack>

              <Stack spacing={1.5} divider={<Divider sx={{ borderColor: "#f1f5f9" }} />}>
                {landmarks.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 0.5,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ display: "flex", alignItems: "center" }}>{item.icon}</Box>
                      <Typography variant="body2" fontWeight={500} color="#334155">
                        {item.name}
                      </Typography>
                    </Stack>
                    <Chip
                      label={item.time}
                      size="small"
                      sx={{
                        bgcolor: "#f1f5f9",
                        color: "#475569",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        height: 24,
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Card>

            {/* Card 3: Parking Facility */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                bgcolor: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                p: 2.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2.5,
                    bgcolor: "rgba(22, 163, 74, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16a34a",
                    flexShrink: 0,
                  }}
                >
                  <LocalParking sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 0.5 }}>
                    {t("map.parkingTitle")}
                  </Typography>
                  <Typography variant="caption" color="#64748b" sx={{ lineHeight: 1.5, display: "block" }}>
                    {t("map.parkingDesc")}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Snackbar feedback */}
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setCopied(false)} severity="success" sx={{ width: "100%", borderRadius: 3 }}>
          {t("map.copiedGps")}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Map;

