import { Box, Grid, Typography } from "@mui/material"
import SwiperPreview from "../components/main/SwiperPreview"

import BedIcon from '../assets/icons/bed.svg'
import ShowerIcon from '../assets/icons/shower.svg'
import PeopleIcon from '../assets/icons/people.svg'
import AddUserIcon from '../assets/icons/add-user.svg'
import CarIcon from '../assets/icons/car.svg'

import BathtubIcon from '../assets/icons/bathtub.svg'
import SofaIcon from '../assets/icons/sofa.svg'
import KaraokeIcon from '../assets/icons/karaoke.svg'
import TvIcon from '../assets/icons/tv.svg'
import WifiIcon from '../assets/icons/wifi.svg'
import BunkBedIcon from '../assets/icons/bunk-bed.svg'
import RubberDuckIcon from '../assets/icons/rubber-duck.svg'
import TreesIcon from '../assets/icons/trees.svg'
import BilliardIcon from '../assets/icons/billiard.svg'
import BbqIcon from '../assets/icons/bbq.svg'
import MicrowaveIcon from '../assets/icons/microwave.svg'
import WaterIcon from '../assets/icons/water.png'





const info = [
  { key: 'room', text: "3 ห้องนอน", icon: <Box component={'img'} src={BedIcon} width={24} />},
  { key: 'bath', text: "3 ห้องน้ำ", icon: <Box component={'img'} src={ShowerIcon} width={24} />},
  { key: 'people', text: "รองรับ 8 - 10 คน", icon: <Box component={'img'} src={PeopleIcon} width={24} />},
  { key: 'plus', text: "ที่นอนเสริม 2 ชุด", icon: <Box component={'img'} src={AddUserIcon} width={24} />},
  { key: 'car', text: "ที่จอดรถมากกว่า 4 คัน", icon: <Box component={'img'} src={CarIcon} width={24} />},
]

const facilities = [
  { key: 'bathtub', text: "อ่างอาบน้ำ เครื่องทำน้ำอุ่น", icon: <Box component={'img'} src={BathtubIcon} width={24} />},
  { key: 'hall', text: "ห้องโถงกว้าง สูงโปร่งสบาย", icon: <Box component={'img'} src={SofaIcon} width={24} />},
  { key: 'karaoke', text: "ลำโพง JBL Partybox พร้อมไมค์ร้องเพลง (YouTube)", icon: <Box component={'img'} src={KaraokeIcon} width={24} />},
  { key: 'tv', text: "Smart TV", icon: <Box component={'img'} src={TvIcon} width={24} />},
  { key: 'wifi', text: "Free Wifi", icon: <Box component={'img'} src={WifiIcon} width={24} />},
  { key: 'bunkbed', text: "เตียง 2 ชั้นพร้อมสไลด์เดอร์", icon: <Box component={'img'} src={BunkBedIcon} width={24} />},
  { key: 'rubber-duck', text: "ห่วงยางสำหรับเด็ก", icon: <Box component={'img'} src={RubberDuckIcon} width={24} />},
  { key: 'rooftop', text: "ชั้นดาดฟ้ารับลมชมวิว 360องศา", icon: <Box component={'img'} src={TreesIcon} width={24} />},
  { key: 'pool', text: "โต๊ะพูลขนาด7 ฟุต", icon: <Box component={'img'} src={BilliardIcon} width={24} />},
  { key: 'grill', text: "เตาปิ้งย่าง", icon: <Box component={'img'} src={BbqIcon} width={24} />},
  { key: 'kitchen', text: "เครื่องใช้ไฟฟ้าในครัว", icon: <Box component={'img'} src={MicrowaveIcon} width={24} />},
  { key: 'water', text: "ฟรีน้ำดื่ม 1 แพ็ค", icon: <Box component={'img'} src={WaterIcon} width={24} />},
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

          <Grid size={12} mb={2} mt={4}>
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