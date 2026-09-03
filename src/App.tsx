import './App.css'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'

import Navbar from './components/main/Navbar'
import Main from './pages/Main'
import Map from './pages/Map'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import Login from './pages/member/Login'
import Register from './pages/member/Register'

import PhoneIcon from "./assets/icons/phone.svg"
import LineIcon from "./assets/icons/line.svg"
import { CONTACTS, SOCIAL_LINKS, PROPERTY } from "@configs/app-settings"

import PoolIcon from './assets/icons/pool.svg'
import KaraokeIcon from './assets/icons/karaoke.svg'
import TreesIcon from './assets/icons/trees.svg'
import BilliardIcon from './assets/icons/billiard.svg'
import Room from '@pages/Room'
import VisitorAPI from '@apis/visitor'
import { useEffect, useState } from 'react'
import UnderConstruction from '@pages/UnderConstruction'
import ManangeBooking from '@pages/ManangeBooking'
import AdminPage from '@pages/member/AdminPage'
import UserPage from '@pages/member/UserPage'
import { userSelector } from '@store/slices/userSlice'
import { useSelector } from 'react-redux'
import Booking from '@pages/Booking'
import { useTranslation } from 'react-i18next'
import.meta.env.MODE

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
          margin: 0,
        },
        body: {
          margin: 0,
        },
      },
    },
  },
});

function App() {
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery("(max-width:800px)");
  const isDev = import.meta.env.MODE === 'development';

  // นำค่า padding มาสร้างเป็นตัวแปรเพื่อใช้กำหนดให้สอดคล้องกับการแสดงผลบนมือถือหรือเดสก์ท็อป
  const padding = isMobile ? '8px' : '12px';
  const paddingTop = isMobile ? 10 : 12;
  const paddingBottom = isMobile ? 10 : 12;

  const { userData } = useSelector(userSelector)
  const location = useLocation();
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        if (!sessionStorage.getItem('_v')) {
          const { data } = await VisitorAPI.ping();
          setVisitorCount(data.count);
          sessionStorage.setItem('_v', '1');
        } else {
          const { data } = await VisitorAPI.getCount();
          setVisitorCount(data.count);
        }
      } catch { /* ignore */ }
    };
    trackVisit();
  }, []);

  const isAdminPage = location.pathname.startsWith('/member/admin') || location.pathname.startsWith('/member/user');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5'
      }}>
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
        }}>
          <Navbar />
        </Box>
        <Box sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: isAdminPage ? { xs: '56px', sm: '64px' } : { xs: '72px', sm: '88px' },
          px: isAdminPage ? 0 : { xs: 1.5, sm: 2.5 },
          pb: isAdminPage ? { xs: 8, sm: 0 } : { xs: 8, sm: 4 },
          boxSizing: 'border-box',
        }}>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/room" element={<Room />} />
            <Route path="/map" element={<Map />} />
            <Route path="/booking" element={<Booking bookingData={bookingData} />} />
            {/* <Route path="/booking" element={<UnderConstruction />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
            {/* Member system */}
            <Route path="/member/login" element={userData.isAdmin ? <Navigate to="/member/admin" /> : userData.isActive ? <Navigate to="/member/user" /> : <Login />} />
            {/* <Route path="/member/login" element={<UnderConstruction />} /> */}
            <Route path="/member/admin" element={<AdminPage />} />
            <Route path="/member/user" element={<UserPage />} />

            <Route path="/member/register" element={<Register />} />
            {isDev ? (
              <Route path="/manage" element={<ManangeBooking />} />
            ) : (
              <Route path="/manage" element={<UnderConstruction />} />
            )}
            {/* <Route path="/member/register" element={<UnderConstruction />} /> */}

          </Routes>
        </Box>
        {isMobile && visitorCount !== null && location.pathname === '/' && (
          <Box sx={{ textAlign: 'center', py: 1, pb: 11, bgcolor: 'transparent' }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11 }}>
              {t('footer.visitorCount', { count: visitorCount })}
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <Box
            component="footer"
            sx={{
              width: '100%',
              bgcolor: "#2D336B",
              color: "#fff",
              padding: 4,
              mt: 'auto',
              zIndex: 1000
            }}
          >
            <Box sx={{ maxWidth: 1366, margin: '0 auto', px: 2 }}>
              <Grid container spacing={4}>
                <Grid size={4}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {i18n.language === 'en' ? PROPERTY.nameEn : PROPERTY.nameThFull}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
                    {i18n.language === 'en' ? PROPERTY.nameThFull : PROPERTY.nameEn}
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, opacity: 0.9 }}>
                    {t('footer.aboutDescription')}
                  </Typography>
                </Grid>

                <Grid size={4}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('footer.contactUs')}
                  </Typography>
                  {CONTACTS.map((c) => (
                    <Box key={c.phone} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box component={'img'} src={PhoneIcon} width={16} sx={{ filter: 'brightness(0) invert(1)' }} />
                      <Typography variant="body2">{c.phoneDisplay} ({i18n.language === 'en' ? c.nameEn : c.name})</Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component={'img'} src={LineIcon} width={16} />
                    <Typography variant="body2">Line: {SOCIAL_LINKS.lineId}</Typography>
                  </Box>
                </Grid>

                <Grid size={4}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('footer.amenitiesTitle')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component={'img'} src={PoolIcon} width={16} sx={{ filter: 'brightness(0) invert(1)' }} />
                    <Typography variant="body2">{t('footer.pool')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component={'img'} src={KaraokeIcon} width={16} sx={{ filter: 'brightness(0) invert(1)' }} />
                    <Typography variant="body2">{t('footer.jbl')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component={'img'} src={TreesIcon} width={16} sx={{ filter: 'brightness(0) invert(1)' }} />
                    <Typography variant="body2">{t('footer.rooftop')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component={'img'} src={BilliardIcon} width={16} sx={{ filter: 'brightness(0) invert(1)' }} />
                    <Typography variant="body2">{t('footer.poolTable')}</Typography>
                  </Box>
                </Grid>

              </Grid>

              <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', mt: 3, pt: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {t('footer.allRightsReserved', { name: i18n.language === 'en' ? PROPERTY.nameEn : PROPERTY.nameThFull })}
                </Typography>
                {visitorCount !== null && (
                  <Typography variant="caption" sx={{ opacity: 0.5, mt: 0.5, display: 'block' }}>
                    {t('footer.visitorCount', { count: visitorCount })}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default App