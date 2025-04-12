import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'

import Navbar from './components/main/Navbar'
import Main from './pages/Main'
import About from './pages/About'
import Contact from './pages/Contact'

// สร้าง theme สำหรับ MUI
const theme = createTheme({
  palette: {
    primary: {
      main: '#3EC6E0',
    },
    secondary: {
      main: '#E8A87C',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F6E7D3',
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
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'rgba(255, 255, 255, 0.87)' }}>
          <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100 }}>
            <Navbar />
          </Box>
          <Box sx={{ padding: '48px', display: 'flex', justifyContent: 'center', pt: 12 }}>
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
    </ThemeProvider>
  )
}

export default App