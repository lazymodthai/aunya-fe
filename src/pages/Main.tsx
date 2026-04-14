import { Box, Grid, Typography, useMediaQuery } from "@mui/material"
import SwiperPreview from "@components/main/SwiperPreview"

import BedIcon from '@assets/icons/bed.svg'
import ShowerIcon from '@assets/icons/shower.svg'
import PeopleIcon from '@assets/icons/people.svg'
import AddUserIcon from '@assets/icons/add-user.svg'
import CarIcon from '@assets/icons/car.svg'

import PoolIcon from '@assets/icons/pool.svg'
import BathtubIcon from '@assets/icons/bathtub.svg'
import SofaIcon from '@assets/icons/sofa.svg'
import KaraokeIcon from '@assets/icons/karaoke.svg'
import TvIcon from '@assets/icons/tv.svg'
import WifiIcon from '@assets/icons/wifi.svg'
import BunkBedIcon from '@assets/icons/bunk-bed.svg'
import RubberDuckIcon from '@assets/icons/rubber-duck.svg'
import TreesIcon from '@assets/icons/trees.svg'
import BilliardIcon from '@assets/icons/billiard.svg'
import BbqIcon from '@assets/icons/bbq.svg'
import MicrowaveIcon from '@assets/icons/microwave.svg'
import WaterIcon from '@assets/icons/water.png'
import BookingCalendar from "@components/main/BookingCalendar"

import PhoneIcon from "@assets/icons/phone.svg"
import FacebookIcon from "@assets/icons/facebook.svg"
import LineIcon from "@assets/icons/line.svg"

import SpeakerIcon from "@assets/icons/speaker.svg"
import NopetIcon from "@assets/icons/nopet.png"
import PricesAPI from "@apis/prices"
import { useEffect, useState } from "react"
import {
  fetchAppSettings,
  CONTACTS,
  SOCIAL_LINKS,
  PROPERTY,
  ROOM_ID,
} from "@configs/app-settings"

const facilities = [
  { key: 'pool', text: "สระว่ายน้ำระบบเกลือ ลึก 1.2 เมตร", icon: <Box component={'img'} src={PoolIcon} width={24} /> },
  { key: 'bathtub', text: "อ่างอาบน้ำ เครื่องทำน้ำอุ่น", icon: <Box component={'img'} src={BathtubIcon} width={24} /> },
  { key: 'hall', text: "ห้องโถงกว้าง สูงโปร่งสบาย", icon: <Box component={'img'} src={SofaIcon} width={24} /> },
  { key: 'karaoke', text: "ลำโพง JBL Partybox พร้อมไมค์", icon: <Box component={'img'} src={KaraokeIcon} width={24} /> },
  { key: 'tv', text: "Smart TV", icon: <Box component={'img'} src={TvIcon} width={24} /> },
  { key: 'wifi', text: "Free Wifi", icon: <Box component={'img'} src={WifiIcon} width={24} /> },
  { key: 'bunkbed', text: "เตียง 2 ชั้นพร้อมสไลด์เดอร์", icon: <Box component={'img'} src={BunkBedIcon} width={24} /> },
  { key: 'rubber-duck', text: "ห่วงยางสำหรับเด็ก", icon: <Box component={'img'} src={RubberDuckIcon} width={24} /> },
  { key: 'rooftop', text: "ชั้นดาดฟ้ารับลมชมวิว 360 องศา", icon: <Box component={'img'} src={TreesIcon} width={24} /> },
  { key: 'pool-table', text: "โต๊ะพูลขนาด 7 ฟุต", icon: <Box component={'img'} src={BilliardIcon} width={24} /> },
  { key: 'grill', text: "เตาปิ้งย่าง", icon: <Box component={'img'} src={BbqIcon} width={24} /> },
  { key: 'kitchen', text: "เครื่องใช้ไฟฟ้าในครัว", icon: <Box component={'img'} src={MicrowaveIcon} width={24} /> },
  { key: 'water', text: "ฟรีน้ำดื่ม 1 แพ็ค", icon: <Box component={'img'} src={WaterIcon} width={24} /> },
]

const policy = [
  { key: 'lound', text: "ใช้เสียงดังได้ถึงเที่ยงคืน", icon: <Box component={'img'} src={SpeakerIcon} width={24} /> },
  { key: 'pet', text: "ห้ามนำสัตว์เลี้ยงเข้าพัก", icon: <Box component={'img'} src={NopetIcon} width={24} /> },
]

interface BookingData {
  date: string;
  price: number;
  status: 'Available' | 'Unavailable' | 'Maintenance';
  isMaintenance: boolean;
  [key: string]: any;
}

function Main() {
  const isMobile = useMediaQuery("(max-width:800px)")
  const [bookingData, setBookingData] = useState<BookingData[]>([])
  const [maxGuests, setMaxGuests] = useState(10)
  const [extraBedCount, setExtraBedCount] = useState(2)

  const info = [
    { key: 'room', text: `${PROPERTY.bedrooms} ห้องนอน`, icon: <Box component={'img'} src={BedIcon} width={24} /> },
    { key: 'bath', text: `${PROPERTY.bathrooms} ห้องน้ำ`, icon: <Box component={'img'} src={ShowerIcon} width={24} /> },
    { key: 'people', text: `รองรับ 8 - ${maxGuests} คน`, icon: <Box component={'img'} src={PeopleIcon} width={24} /> },
    { key: 'plus', text: `ที่นอนเสริม ${extraBedCount} ชุด`, icon: <Box component={'img'} src={AddUserIcon} width={24} /> },
    { key: 'car', text: `ที่จอดรถมากกว่า ${PROPERTY.parkingSlots} คัน`, icon: <Box component={'img'} src={CarIcon} width={24} /> },
  ]

  const getPriceByMonth = async (month: number) => {
    if (month < 0 || month > 11) return;
    try {
      const { data } = await PricesAPI.getPrices({
        month: month + 1,
        year: new Date().getFullYear(),
        roomId: ROOM_ID
      });
      setBookingData(data.prices);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPriceByMonth(new Date().getMonth())
    fetchAppSettings().then((s) => {
      setMaxGuests(s.maxGuests);
      setExtraBedCount(s.extraBedCount);
    });
  }, [])

  return (
    <>
      <Grid
        size={12}
        container
        spacing={2}
        sx={{
          minHeight: 280,
          width: '100%',
          maxWidth: isMobile ? '100%' : 1366,
        }}
      >
        <Grid size={12}>
          <SwiperPreview />
        </Grid>

        <Grid size={12} borderRadius={2} padding={2} my={isMobile ? -2 : 0}>
          <Grid container gap={1} justifyContent={"end"}>
            {CONTACTS.map((c) => (
              <Box
                key={c.phone}
                onClick={() => (window.location.href = `tel:${c.phone}`)}
                sx={{
                  bgcolor: "#fff",
                  pl: 1,
                  pr: 2,
                  py: 1,
                  borderRadius: 6,
                  display: "flex",
                  gap: 1,
                  border: "1px solid #77B3D4",
                  cursor: "pointer",
                }}
              >
                <Box component={"img"} src={PhoneIcon} width={20} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "#77B3D4" }}
                >
                  {!isMobile ? c.phoneDisplay : c.name}
                </Typography>
              </Box>
            ))}
            <Box
              onClick={() =>
                (window.location.href = SOCIAL_LINKS.facebook)
              }
              sx={{
                bgcolor: "#fff",
                pl: 1,
                pr: isMobile ? 1 : 2,
                py: 1,
                borderRadius: 6,
                display: "flex",
                gap: 1,
                border: "1px solid #3b5998",
                cursor: "pointer",
              }}
            >
              <Box component={"img"} src={FacebookIcon} width={20} />
              {!isMobile && (
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "#3b5998" }}
                >
                  {PROPERTY.nameThFull} Aunya Pool Villa
                </Typography>
              )}
            </Box>
            <Box
              onClick={() =>
                (window.location.href = SOCIAL_LINKS.line)
              }
              sx={{
                bgcolor: "#fff",
                pl: 1,
                pr: isMobile ? 1 : 2,
                py: 1,
                borderRadius: 6,
                display: "flex",
                gap: 1,
                border: "1px solid #2CCF54",
                cursor: "pointer",
              }}
            >
              <Box component={"img"} src={LineIcon} width={20} />
              {!isMobile && (
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "#2CCF54" }}
                >
                  {SOCIAL_LINKS.lineId}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Grid container size={isMobile ? 12 : 6}>
          <Grid
            size={12}
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
                  <Typography variant="body1" fontSize={14}>
                    {i.text}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid
            size={12}
            border={`1px solid #A9B5DF`}
            borderRadius={2}
            padding={2}
          >
            <Grid size={12} mb={2}>
              <Typography variant="h5">ปฏิทินวันว่าง</Typography>
            </Grid>
            <BookingCalendar
              bookingData={bookingData}
              onChangeMonth={(val) => getPriceByMonth(val)}
              disablePast
            />
          </Grid>
        </Grid>

        <Grid container size={isMobile ? 12 : 6}>
          <Grid
            size={12}
            border={`1px solid #A9B5DF`}
            borderRadius={2}
            padding={2}
          >
            <Grid size={12} mb={2}>
              <Typography variant="h5">สิ่งอำนวยความสะดวก</Typography>
            </Grid>
            <Grid container gap={2} pl={2}>
              {facilities.map((i) => (
                <Grid key={i.key} size={12} container gap={2} color={"#2D336B"}>
                  {i.icon}
                  <Typography variant="body1" fontSize={14}>
                    {i.text}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Grid size={12} mb={2} mt={4}>
              <Typography variant="h5">ข้อกำหนดการเข้าพัก</Typography>
            </Grid>
            <Grid container gap={2} pl={2}>
              {policy.map((i) => (
                <Grid key={i.key} size={12} container gap={2} color={"#2D336B"}>
                  {i.icon}
                  <Typography variant="body1" fontSize={14}>
                    {i.text}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default Main