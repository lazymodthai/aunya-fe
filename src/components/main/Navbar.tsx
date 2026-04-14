import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  useMediaQuery,
  Button,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BedroomParentIcon from '@mui/icons-material/BedroomParent';
import MapIcon from '@mui/icons-material/Map';
import BookOnlineIcon from '../../assets/icons/booking.png';
import PersonIcon from '@mui/icons-material/Person';
import { routes } from '../../configs/route-config';

const menuItems = [
  { label: "หน้าหลัก", icon: <HomeIcon />, path: routes.main },
  { label: "ห้อง", icon: <BedroomParentIcon />, path: routes.room },
  { label: "แผนที่", icon: <MapIcon />, path: "/map" },
  { label: "สมาชิก", icon: <PersonIcon />, path: "/member/login" },
  // { label: "จัดการ", icon: <PersonIcon />, path: routes.manage},
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:800px)");

  const getTabValue = () => {
    const path = location.pathname;
    if (path === routes.main) return 0;
    if (path === routes.room) return 1;
    if (path === routes.map) return 2;
    if (path.startsWith("/member")) return 3;
    if (path.startsWith("/manage")) return 4;
    return 0;
  };

  const [value, setValue] = useState(getTabValue());

  useEffect(() => {
    setValue(getTabValue());
  }, [location]);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const handleBottomNavChange = (event: any, newValue: any) => {
    // If the booking button is clicked (index 3)
    if (newValue === 3) {
      // Handle booking action here
      console.log("Booking button clicked");
      return;
    }
    setValue(newValue);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{ bgcolor: "#2D336B", color: "black", boxShadow: 1 }}
      >
        <Toolbar>
          {/* Logo - always visible */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: "#fff",
              marginRight: "20px",
              fontWeight: "bold",
              width: isMobile ? "100%" : "200px",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            Aunya Pool Villa
          </Typography>

          {/* Navigation Tabs - only on desktop */}
          {!isMobile && (
            <>
              <Box sx={{ flexGrow: 1 }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="inherit"
                  indicatorColor="secondary"
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontSize: "1rem",
                      color: "#fff",
                      minWidth: "auto",
                      padding: "12px 16px",
                    },
                  }}
                >
                  {menuItems.map((item) => (
                    <Tab
                      key={item.label}
                      icon={item.icon}
                      iconPosition="start"
                      label={item.label}
                      component={Link}
                      to={item.path}
                    />
                  ))}
                </Tabs>
              </Box>
              <Button
                sx={{
                  bgcolor: "#FFF2F2",
                  color: "#B03052",
                  height: "100%",
                  width: 200,
                  fontSize: "1.8rem",
                  padding: "0 24px",
                  borderRadius: 3,
                }}
                onClick={() => navigate('/booking')}
              >
                จองเลย!
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
          }}
          elevation={3}
        >
          <BottomNavigation
            value={value}
            onChange={handleBottomNavChange}
            showLabels
            sx={{ bgcolor: "#2D336B", height: "70px", pb: "10px" }}
          >
            {menuItems.map((item, index) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={item.icon}
                component={Link}
                to={item.path}
                sx={{
                  color: value === index ? "#fff" : "rgba(255, 255, 255, 0.7)",
                  "&.Mui-selected": {
                    color: "#fff",
                  },
                }}
              />
            ))}
            <BottomNavigationAction
              label="จองเลย!"
              onClick={() => navigate('/booking')}
              icon={<Box component={'img'} src={BookOnlineIcon} width={24} />}
              sx={{
                bgcolor: "#FFF2F2",
                color: "#B03052",
                "&.Mui-selected": {
                  color: "#B03052",
                  bgcolor: "#FFF2F2",
                },
              }}
            />
          </BottomNavigation>
        </Paper>
      )}

    </>
  );
};

export default Navbar;