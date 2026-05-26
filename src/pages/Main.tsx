import { Box, Grid, Typography, useMediaQuery } from "@mui/material"
import SwiperPreview from "@components/main/SwiperPreview"
import EditablePropertySection from "@components/main/EditablePropertySection"

import PhoneIcon from "@assets/icons/phone.svg"
import FacebookIcon from "@assets/icons/facebook.svg"
import LineIcon from "@assets/icons/line.svg"

import BookingCalendar from "@components/main/BookingCalendar"
import PricesAPI from "@apis/prices"
import PropertyInfoAPI from "@apis/property-info"
import type { PropertyInfoItem } from "@apis/property-info"
import { cacheGet, cacheSet, cacheDelete } from "@utils/cache"
import { useEffect, useState } from "react"
import {
  fetchAppSettings,
  CONTACTS,
  SOCIAL_LINKS,
  ROOM_ID,
} from "@configs/app-settings"
import { useSelector } from "react-redux"
import { userSelector } from "@store/slices/userSlice"
import { useTranslation } from "react-i18next"

interface BookingData {
  date: string;
  price: number;
  status: 'Available' | 'Unavailable' | 'Maintenance';
  isMaintenance: boolean;
  [key: string]: any;
}

function Main() {
  const { t, i18n } = useTranslation()
  const isMobile = useMediaQuery("(max-width:800px)")
  const { userData } = useSelector(userSelector)
  const isAdmin = userData?.isAdmin ?? false

  const [bookingData, setBookingData] = useState<BookingData[]>([])
  const [generalItems, setGeneralItems] = useState<PropertyInfoItem[]>([])
  const [facilityItems, setFacilityItems] = useState<PropertyInfoItem[]>([])
  const [policyItems, setPolicyItems] = useState<PropertyInfoItem[]>([])

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
    fetchAppSettings()
    loadPropertyInfo()
  }, [])

  const CACHE_KEY = 'property-info-all';

  const loadPropertyInfo = async () => {
    // Try cache first
    const cached = cacheGet<PropertyInfoItem[]>(CACHE_KEY);
    if (cached) {
      setGeneralItems(cached.filter((i: PropertyInfoItem) => i.category === 'general'))
      setFacilityItems(cached.filter((i: PropertyInfoItem) => i.category === 'facilities'))
      setPolicyItems(cached.filter((i: PropertyInfoItem) => i.category === 'policies'))
      return;
    }
    try {
      const { data } = await PropertyInfoAPI.getAll()
      cacheSet(CACHE_KEY, data); // 5 min TTL
      setGeneralItems(data.filter((i: PropertyInfoItem) => i.category === 'general'))
      setFacilityItems(data.filter((i: PropertyInfoItem) => i.category === 'facilities'))
      setPolicyItems(data.filter((i: PropertyInfoItem) => i.category === 'policies'))
    } catch (error) {
      console.error(error)
    }
  }

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
                  {!isMobile ? c.phoneDisplay : (i18n.language === 'en' ? c.nameEn : c.name)}
                </Typography>
              </Box>
            ))}
            <Box
              onClick={() => (window.location.href = SOCIAL_LINKS.facebook)}
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
                <Typography variant="body2" sx={{ fontWeight: 500, color: "#3b5998" }}>
                  Aunya Pool Villa
                </Typography>
              )}
            </Box>
            <Box
              onClick={() => (window.location.href = SOCIAL_LINKS.line)}
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
                <Typography variant="body2" sx={{ fontWeight: 500, color: "#2CCF54" }}>
                  {SOCIAL_LINKS.lineId}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Left column: ข้อมูลทั่วไป + ปฏิทิน */}
        <Grid container size={isMobile ? 12 : 6}>
          <Grid
            size={12}
            border={`1px solid #A9B5DF`}
            borderRadius={2}
            padding={2}
          >
            <EditablePropertySection
              title={t("main.generalInfo", "ข้อมูลทั่วไป")}
              category="general"
              items={generalItems}
              isAdmin={isAdmin}
              onItemsChange={setGeneralItems}
            />
          </Grid>

          <Grid
            size={12}
            border={`1px solid #A9B5DF`}
            borderRadius={2}
            padding={2}
          >
            <Grid size={12} mb={2}>
              <Typography variant="h5">{t("main.availabilityCalendar", "ปฏิทินวันว่าง")}</Typography>
            </Grid>
            <BookingCalendar
              bookingData={bookingData}
              onChangeMonth={(val) => getPriceByMonth(val)}
              disablePast
            />
          </Grid>
        </Grid>

        {/* Right column: สิ่งอำนวยความสะดวก + ข้อกำหนด */}
        <Grid container size={isMobile ? 12 : 6}>
          <Grid
            size={12}
            border={`1px solid #A9B5DF`}
            borderRadius={2}
            padding={2}
          >
            <EditablePropertySection
              title={t("main.facilities", "สิ่งอำนวยความสะดวก")}
              category="facilities"
              items={facilityItems}
              isAdmin={isAdmin}
              onItemsChange={setFacilityItems}
            />

            <Box mt={4}>
              <EditablePropertySection
                title={t("main.policies", "ข้อกำหนดการเข้าพัก")}
                category="policies"
                items={policyItems}
                isAdmin={isAdmin}
                onItemsChange={setPolicyItems}
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default Main
