import { Box, Grid } from "@mui/material"
import SideMenu, { MenuConfig } from "./SideMenu"

const menuConfig: MenuConfig = {
  title: "เมนู",
  items: [
    {
      id: "dashboard",
      text: "Dashboard",
      icon: "Dashboard",
      action: "navigate",
      path: "/dashboard"
    },
    {
      id: "management",
      text: "จัดการ",
      icon: "Settings",
      action: "expand",
      expandable: true,
      defaultOpen: false,
      subItems: [
        {
          id: "users",
          text: "จัดการผู้ใช้",
          icon: "Person",
          action: "navigate",
          path: "/management/users"
        },
        {
          id: "roles",
          text: "จัดการสิทธิ์",
          icon: "Security",
          action: "navigate",
          path: "/management/roles"
        }
      ]
    }
  ]
};

function Dashboard() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container >
        <Grid size={4} sx={{bgcolor: '#f0f0f0'}}>
          <SideMenu config={menuConfig} onNavigate={(path: string) => console.log(path)}  />
        </Grid>
        <Grid size={8} sx={{bgcolor: '#f0f0f0'}}>
          2
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard