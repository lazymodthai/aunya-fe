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
import { useTranslation } from "react-i18next";

const menuItems = [
  { key: "home", defaultLabel: "หน้าหลัก", icon: <HomeIcon />, path: routes.main },
  { key: "room", defaultLabel: "ห้อง", icon: <BedroomParentIcon />, path: routes.room },
  { key: "map", defaultLabel: "แผนที่", icon: <MapIcon />, path: "/map" },
  { key: "member", defaultLabel: "สมาชิก", icon: <PersonIcon />, path: "/member/login" },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
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
    if (newValue === 3) {
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
        <Toolbar sx={{ position: "relative" }}>
          {/* Logo - always visible */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: "#fff",
              fontWeight: "bold",
              flexGrow: isMobile ? 1 : 0,
              width: isMobile ? "auto" : "200px",
              textAlign: isMobile ? "center" : "left",
              mr: isMobile ? "70px" : "20px",
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
                      key={item.key}
                      icon={item.icon}
                      iconPosition="start"
                      label={t(`nav.${item.key}`, item.defaultLabel)}
                      component={Link}
                      to={item.path}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* Language Selector Desktop */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "20px",
                  padding: "2px",
                  marginRight: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Button
                  size="small"
                  onClick={() => i18n.changeLanguage("th")}
                  sx={{
                    borderRadius: "18px",
                    bgcolor: i18n.language === "th" ? "#fff" : "transparent",
                    color: i18n.language === "th" ? "#2D336B" : "#fff",
                    fontWeight: "bold",
                    minWidth: "45px",
                    height: "28px",
                    fontSize: "0.85rem",
                    padding: "0 8px",
                    minHeight: 0,
                    lineHeight: 1,
                    "&:hover": {
                      bgcolor: i18n.language === "th" ? "#fff" : "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  TH
                </Button>
                <Button
                  size="small"
                  onClick={() => i18n.changeLanguage("en")}
                  sx={{
                    borderRadius: "18px",
                    bgcolor: i18n.language === "en" ? "#fff" : "transparent",
                    color: i18n.language === "en" ? "#2D336B" : "#fff",
                    fontWeight: "bold",
                    minWidth: "45px",
                    height: "28px",
                    fontSize: "0.85rem",
                    padding: "0 8px",
                    minHeight: 0,
                    lineHeight: 1,
                    "&:hover": {
                      bgcolor: i18n.language === "en" ? "#fff" : "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  EN
                </Button>
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
                {t("nav.bookNow", "จองเลย!")}
              </Button>
            </>
          )}

          {/* Language Selector Mobile */}
          {isMobile && (
            <Box
              sx={{
                position: "absolute",
                right: "16px",
                display: "flex",
                alignItems: "center",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                borderRadius: "16px",
                padding: "1px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <Button
                size="small"
                onClick={() => i18n.changeLanguage("th")}
                sx={{
                  borderRadius: "15px",
                  bgcolor: i18n.language === "th" ? "#fff" : "transparent",
                  color: i18n.language === "th" ? "#2D336B" : "#fff",
                  fontWeight: "bold",
                  minWidth: "32px",
                  height: "22px",
                  fontSize: "0.7rem",
                  padding: 0,
                  minHeight: 0,
                  lineHeight: 1,
                  "&:hover": {
                    bgcolor: i18n.language === "th" ? "#fff" : "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                TH
              </Button>
              <Button
                size="small"
                onClick={() => i18n.changeLanguage("en")}
                sx={{
                  borderRadius: "15px",
                  bgcolor: i18n.language === "en" ? "#fff" : "transparent",
                  color: i18n.language === "en" ? "#2D336B" : "#fff",
                  fontWeight: "bold",
                  minWidth: "32px",
                  height: "22px",
                  fontSize: "0.7rem",
                  padding: 0,
                  minHeight: 0,
                  lineHeight: 1,
                  "&:hover": {
                    bgcolor: i18n.language === "en" ? "#fff" : "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                EN
              </Button>
            </Box>
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
                key={item.key}
                label={t(`nav.${item.key}`, item.defaultLabel)}
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
              label={t("nav.bookNow", "จองเลย!")}
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