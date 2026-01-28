import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import { Navigation } from "@mui/icons-material";
import { LOCATION } from "@configs/app-settings";

function Map() {
  const isMobile = useMediaQuery("(max-width:800px)");

  const handleNavigation = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <Box sx={{
      width: isMobile ? '95vw' : '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Typography sx={{ fontSize: 24, fontWeight: 600, my: 2 }}>แผนที่</Typography>
      <iframe
        src={LOCATION.googleMapsEmbed}
        width={isMobile ? "100%" : 600}
        height="450"
        style={{ border: 0, borderRadius: '16px' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Navigation />}
          onClick={handleNavigation}
          size="large"
        >
          นำทางด้วย Google Maps
        </Button>
      </Box>
    </Box>
  );
}

export default Map;
