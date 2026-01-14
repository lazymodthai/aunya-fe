import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'

import Navbar from './components/main/Navbar'
import Main from './pages/Main'
import Room from './pages/Room'
import Map from './pages/Map'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import Booking from './pages/Booking'
import Login from './pages/member/Login'
import Register from './pages/member/Register'

import PhoneIcon from "./assets/icons/phone.svg"
import LineIcon from "./assets/icons/line.svg"

import PoolIcon from './assets/icons/pool.svg'
import KaraokeIcon from './assets/icons/karaoke.svg'
import TreesIcon from './assets/icons/trees.svg'
import BilliardIcon from './assets/icons/billiard.svg'
import UnderConstruction from '@pages/UnderConstruction'

const bookingData = [
  { m: 4, d: 1, price: 5500, promotion: 'no', reserved: 'yes', maintenance: 'no' },
  { m: 4, d: 2, price: 5500, promotion: 'no', reserved: 'yes', maintenance: 'no' },
  { m: 4, d: 3, price: 6000, promotion: 'no', reserved: 'no', maintenance: 'no' },
  { m: 4, d: 4, price: 6000, promotion: 'no', reserved: 'no', maintenance: 'no' },
  { m: 4, d: 5, price: 5500, promotion: 'no', reserved: 'no', maintenance: 'no' },
  { m: 4, d: 6, price: 5500, promotion: 'no', reserved: 'yes', maintenance: 'no' },
];

// สร้าง theme สำหรับ MUI
const theme = createTheme({
  palette: {
    primary: {
      main: '#B03052',
    },
    secondary: {
      main: '#E8A87C',
    },
    background: {
      default: '#e3e3e3',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: [
      'Kanit',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          // กำหนดขนาดความกว้างขั้นต่ำ
          minWidth: '390px',
          overflowX: 'auto', // ให้มี scroll bar เมื่อขนาดหน้าจอเล็กกว่าขนาดขั้นต่ำ
        },
        body: {
          minWidth: '390px', // กำหนดขนาดความกว้างขั้นต่ำ
        },
      },
    },
  },
});

function App() {
  const isMobile = useMediaQuery("(max-width:800px)");

  // นำค่า padding มาสร้างเป็นตัวแปรเพื่อใช้กำหนดให้สอดคล้องกับการแสดงผลบนมือถือหรือเดสก์ท็อป
  const padding = isMobile ? '8px' : '12px';
  const paddingTop = isMobile ? 10 : 12;
  const paddingBottom = isMobile ? 10 : 12;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        width: '100vw',
        minWidth: '390px',
        minHeight: '100vh',
        bgcolor: 'rgba(255, 255, 255, 0.87)'
      }}>
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          minWidth: '390px'
        }}>
          <Navbar />
        </Box>
        <Box sx={{
          padding: padding,
          display: 'flex',
          justifyContent: 'center',
          pt: paddingTop,
          pb: paddingBottom,
          minWidth: `calc(390px - ${padding} * 2)`
        }}>
          <Routes>
            <Route path="/" element={<Main />} />
            {/* <Route path="/room" element={<Room />} /> */}
            <Route path="/room" element={<UnderConstruction />} />
            <Route path="/map" element={<Map />} />
            {/* <Route path="/booking" element={<Booking bookingData={bookingData}/>} /> */}
            <Route path="/booking" element={<UnderConstruction />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            {/* Member system */}
            <Route path="/member/login" element={<Login />} />
            {/* <Route path="/member/login" element={<UnderConstruction />} /> */}
            <Route path="/member/register" element={<Register />} />
            {/* <Route path="/member/register" element={<UnderConstruction />} /> */}

          </Routes>
        </Box>
        {!isMobile && (
          <Box
            sx={{
              width: '100vw',
              bgcolor: "#2D336B",
              color: "#fff",
              padding: 4,
              zIndex: 1000
            }}
          >
            <Box sx={{ maxWidth: 1366, margin: '0 auto', px: 2 }}>
              <Grid container spacing={4}>
                <Grid size={4}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    อันหยาพูลวิลล่า นครศรีธรรมราช
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                    Aunya Pool Villa Nakhon Si Thammarat
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, opacity: 0.9 }}>
                    บ้านพักตากอากาศที่มาพร้อมกับสิ่งอำนวยความสะดวกครบครัน
                    เหมาะสำหรับการพักผ่อนกับครอบครัวและเพื่อนฝูง
                  </Typography>
                </Grid>

                <Grid size={4}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    ติดต่อเรา
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component={'img'} src={PhoneIcon} width={16} sx={{ filter: 'brightness(0) invert(1)' }} />
                    <Typography variant="body2">088-084-4455 (คุณธนิก)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component={'img'} src={PhoneIcon} width={16} sx={{ filter: 'brightness(0) invert(1)' }} />
                    <Typography variant="body2">083-181-8502 (คุณสุ)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component={'img'} src={LineIcon} width={16} />
                    <Typography variant="body2">Line: jent11</Typography>
                  </Box>
                </Grid>

                <Grid size={4}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    สิ่งอำนวยความสะดวกเด่น
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component={'img'} src={PoolIcon} width={16} sx={{ filter: 'brightness(0) invert(1)' }} />
                    <Typography variant="body2">สระว่ายน้ำระบบเกลือ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component={'img'} src={KaraokeIcon} width={16} sx={{ filter: 'brightness(0) invert(1)' }} />
                    <Typography variant="body2">ลำโพง JBL Partybox</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component={'img'} src={TreesIcon} width={16} sx={{ filter: 'brightness(0) invert(1)' }} />
                    <Typography variant="body2">ชั้นดาดฟ้าชมวิว 360°</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component={'img'} src={BilliardIcon} width={16} sx={{ filter: 'brightness(0) invert(1)' }} />
                    <Typography variant="body2">โต๊ะพูล 7 ฟุต</Typography>
                  </Box>
                </Grid>

              </Grid>

              <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', mt: 3, pt: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  © 2024 อันหยาพูลวิลล่า นครศรีธรรมราช - All rights reserved
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default App