import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BedroomParentIcon from '@mui/icons-material/BedroomParent';
import MapIcon from '@mui/icons-material/Map';

const menuItems = [
  { label: "หน้าหลัก", icon: <HomeIcon />, path: "/" },
  { label: "ห้อง", icon: <BedroomParentIcon />, path: "/about" },
  { label: "แผนที่", icon: <MapIcon />, path: "/contact" },
];

const Navbar = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // กำหนดค่า tab ที่เลือกตาม path
  const getTabValue = () => {
    const path = location.pathname;
    if (path === "/") return 0;
    if (path === "/about") return 1;
    if (path === "/contact") return 2;
    return 0;
  };

  const [value, setValue] = useState(getTabValue());

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <AppBar
      position="static"
      sx={{ bgcolor: "#2D336B", color: "black", boxShadow: 1 }}
    >
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            color: "#fff",
            marginRight: "20px",
            fontWeight: "bold",
            width: isMobile ? "100%" : "200px",
          }}
        >
          Aunya Pool Villa
        </Typography>

        {/* Navigation Tabs */}
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
            {menuItems.map((i) => (
              <Tab
                key={i.label}
                icon={i.icon}
                iconPosition="start"
                label={i.label}
                component={Link}
                to={i.path}
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
            borderRadius: 3
          }}
        >
          จองเลย!
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
