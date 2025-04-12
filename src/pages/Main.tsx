import { Grid, Typography } from "@mui/material"
import SwiperPreview from "../components/main/SwiperPreview"
import KingBedIcon from '@mui/icons-material/KingBed';
import BathtubIcon from '@mui/icons-material/Bathtub';

const info = [
  { key: 'room', text: "3 ห้องนอน", icon: <KingBedIcon />},
  { key: 'bath', text: "3 ห้องน้ำ", icon: <BathtubIcon />},
]
const facilities = [
  { key: 'room', text: "3 ห้องนอน", icon: <KingBedIcon />},
  { key: 'bath', text: "3 ห้องน้ำ", icon: <BathtubIcon />},
]

function Main() {
  return (
    <>
      <Grid
        size={12}
        container
        direction={"column"}
        gap={2}
        sx={{
          minHeight: 280,
          width: 1366,
        }}
      >
        <Grid size={12}>
          <SwiperPreview />
        </Grid>

        <Grid
          size={6}
          border={`1px solid #A9B5DF`}
          borderRadius={2}
          padding={2}
        >
          <Grid size={12} mb={2}>
            <Typography variant="h5">ข้อมูลทั่วไป</Typography>
          </Grid>
          <Grid container gap={2} pl={2}>
            {info.map((i) => (
              <Grid key={i.key} size={12} container gap={2} color={"#2D336B"}>
                {i.icon}
                <Typography variant="body1">{i.text}</Typography>
              </Grid>
            ))}
          </Grid>

          <Grid size={12} mb={2} mt={2}>
            <Typography variant="h5">สิ่งอำนวยความสะดวก</Typography>
          </Grid>
          <Grid container gap={2} pl={2}>
            {facilities.map((i) => (
              <Grid key={i.key} size={12} container gap={2} color={"#2D336B"}>
                {i.icon}
                <Typography variant="body1">{i.text}</Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default Main