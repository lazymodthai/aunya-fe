import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'

import Navbar from './components/main/Navbar'
import Main from './pages/Main'
import Room from './pages/Room'
import Map from './pages/Map'
import { useMediaQuery } from '@mui/material'
import Booking from './pages/Booking'
import Login from './pages/member/Login'
import Register from './pages/member/Register'

const bookingData = [
  {m: 4, d: 1, price: 5500, promotion: 'no', reserved: 'yes', maintenance: 'no' },
  {m: 4, d: 2, price: 5500, promotion: 'no', reserved: 'yes', maintenance: 'no' },
  {m: 4, d: 3, price: 6000, promotion: 'no', reserved: 'no', maintenance: 'no' },
  {m: 4, d: 4, price: 6000, promotion: 'no', reserved: 'no', maintenance: 'no' },
  {m: 4, d: 5, price: 5500, promotion: 'no', reserved: 'no', maintenance: 'no' },
  {m: 4, d: 6, price: 5500, promotion: 'no', reserved: 'yes', maintenance: 'no' },
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
  const isMobile = useMediaQuery("(max-width:390px)");
  
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
              <Route path="/room" element={<Room />} />
              <Route path="/map" element={<Map />} />
              <Route path="/booking" element={<Booking bookingData={bookingData}/>} />
              <Route path="*" element={<Navigate to="/" replace />} />
              {/* Member system */}
              <Route path="/member/login" element={<Login />} />
              <Route path="/member/register" element={<Register />} />

            </Routes>
          </Box>
        </Box>
    </ThemeProvider>
  )
}

export default App