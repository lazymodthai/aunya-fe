import { Box, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

function UnderConstruction() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 250px)',
        textAlign: 'center',
        color: 'text.secondary'
      }}
    >
      <ConstructionIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
      <Typography variant="h4" component="h1" gutterBottom sx={{color: 'text.primary'}}>
        อยู่ระหว่างการปรับปรุง
      </Typography>
      <Typography variant="body1">
        ขออภัยในความไม่สะดวก ขณะนี้หน้าเพจนี้กำลังอยู่ในระหว่างการพัฒนา
      </Typography>
    </Box>
  );
}

export default UnderConstruction