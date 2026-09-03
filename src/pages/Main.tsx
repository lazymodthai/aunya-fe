import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  Phone as PhoneMuiIcon,
  Pool as PoolIcon,
  Mic as KaraokeIcon,
  OutdoorGrill as GrillIcon,
  Landscape as MountainIcon,
  ArrowForward as ArrowForwardIcon,
  InfoOutlined as InfoIcon,
  CheckCircleOutline as FacilitiesIcon,
  Gavel as PolicyIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import SwiperPreview from "@components/main/SwiperPreview";
import EditablePropertySection from "@components/main/EditablePropertySection";

import PhoneIcon from "@assets/icons/phone.svg";
import FacebookIcon from "@assets/icons/facebook.svg";
import LineIcon from "@assets/icons/line.svg";
import BilliardIcon from "@assets/icons/billiard.svg";

import BookingCalendar from "@components/main/BookingCalendar";
import PricesAPI from "@apis/prices";
import PropertyInfoAPI from "@apis/property-info";
import type { PropertyInfoItem } from "@apis/property-info";
import { cacheGet, cacheSet } from "@utils/cache";
import { useEffect, useState } from "react";
import {
  fetchAppSettings,
  CONTACTS,
  SOCIAL_LINKS,
  ROOM_ID,
  PROPERTY,
} from "@configs/app-settings";
import { useSelector } from "react-redux";
import { userSelector } from "@store/slices/userSlice";
import { useTranslation } from "react-i18next";

interface BookingData {
  date: string;
  price: number;
  status: 'Available' | 'Unavailable' | 'Maintenance';
  isMaintenance: boolean;
  [key: string]: any;
}

function Main() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:800px)");
  const { userData } = useSelector(userSelector);
  const isAdmin = userData?.isAdmin ?? false;

  const [bookingData, setBookingData] = useState<BookingData[]>([]);
  const [generalItems, setGeneralItems] = useState<PropertyInfoItem[]>([]);
  const [facilityItems, setFacilityItems] = useState<PropertyInfoItem[]>([]);
  const [policyItems, setPolicyItems] = useState<PropertyInfoItem[]>([]);
  const [advanceBookingMonths, setAdvanceBookingMonths] = useState(6);

  const getPriceByMonth = async (month: number, year: number = new Date().getFullYear()) => {
    try {
      const { data } = await PricesAPI.getPrices({
        month: month + 1,
        year: year,
        roomId: ROOM_ID
      });
      setBookingData(data.prices);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPriceByMonth(new Date().getMonth(), new Date().getFullYear());
    fetchAppSettings().then((s) => {
      setAdvanceBookingMonths(s.advanceBookingMonths);
    });
    loadPropertyInfo();
  }, []);

  const CACHE_KEY = 'property-info-all';

  const loadPropertyInfo = async () => {
    const cached = cacheGet<PropertyInfoItem[]>(CACHE_KEY);
    if (cached) {
      setGeneralItems(cached.filter((i: PropertyInfoItem) => i.category === 'general'));
      setFacilityItems(cached.filter((i: PropertyInfoItem) => i.category === 'facilities'));
      setPolicyItems(cached.filter((i: PropertyInfoItem) => i.category === 'policies'));
      return;
    }
    try {
      const { data } = await PropertyInfoAPI.getAll();
      cacheSet(CACHE_KEY, data);
      setGeneralItems(data.filter((i: PropertyInfoItem) => i.category === 'general'));
      setFacilityItems(data.filter((i: PropertyInfoItem) => i.category === 'facilities'));
      setPolicyItems(data.filter((i: PropertyInfoItem) => i.category === 'policies'));
    } catch (error) {
      console.error(error);
    }
  };

  const featureHighlights = [
    {
      icon: <PoolIcon sx={{ color: '#0284c7', fontSize: { xs: 22, sm: 26 } }} />,
      title: t("main.featurePool", "สระว่ายน้ำระบบเกลือ"),
      desc: t("main.featurePoolDesc", "ลึก 1.2 ม. พร้อมห่วงยางเด็ก"),
      bg: '#f0f9ff',
    },
    {
      icon: <Box component="img" src={BilliardIcon} sx={{ width: { xs: 20, sm: 24 }, height: { xs: 20, sm: 24 } }} />,
      title: t("main.featureBilliard", "โต๊ะพูล 7 ฟุต & ดาดฟ้า 360°"),
      desc: t("main.featureBilliardDesc", "โต๊ะพูลขนาด 7 ฟุต และดาดฟ้าชมวิว"),
      bg: '#f5f3ff',
    },
    {
      icon: <KaraokeIcon sx={{ color: '#16a34a', fontSize: { xs: 22, sm: 26 } }} />,
      title: t("main.featureKaraoke", "ลำโพง JBL & Smart TV"),
      desc: t("main.featureKaraokeDesc", "ไมโครโฟน, Free Netflix & YouTube"),
      bg: '#f0fdf4',
    },
    {
      icon: <GrillIcon sx={{ color: '#ea580c', fontSize: { xs: 22, sm: 26 } }} />,
      title: t("main.featureBbq", "เตาปิ้งย่าง BBQ & ครัวครบ"),
      desc: t("main.featureBbqDesc", "ฟรีถ่าน 1 ชุด น้ำดื่ม 1 โหล น้ำแข็ง 1 ถัง"),
      bg: '#fff7ed',
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 1366, mx: 'auto', pb: 4 }}>
      {/* 1. Hero Image Slider */}
      <Box sx={{ mb: 2 }}>
        <SwiperPreview />
      </Box>

      {/* 2. Villa Title & Quick CTA / Contact Bar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.8, sm: 2.5 },
          borderRadius: { xs: 3, sm: 3.5 },
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          mb: 2,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={1.5}
        >
          {/* Villa Title & Slogan */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip
                label={t("main.privateVillaBadge", "⭐ พูลวิลล่าส่วนตัว")}
                size="small"
                sx={{ bgcolor: '#fff1f2', color: '#be123c', fontWeight: 700, fontSize: '0.75rem' }}
              />
              <Chip
                label={t("main.locationBadge", "📍 นครศรีธรรมราช")}
                size="small"
                sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}
              />
            </Stack>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#1e293b', letterSpacing: -0.5, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              {i18n.language === 'en' ? PROPERTY.nameEn : PROPERTY.nameThFull}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              {t("main.subtitle", "พูลวิลล่าส่วนตัวท่ามกลางธรรมชาติ สระว่ายน้ำระบบเกลือ โต๊ะพูล คาราโอเกะ และปิ้งย่างครบครัน")}
            </Typography>
          </Box>

          {/* Contact & Social Links + Full-width Book Now on Mobile */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ width: { xs: '100%', md: 'auto' }, gap: 1 }}
          >
            {/* Contact Pills */}
            <Stack direction="row" spacing={0.8} flexWrap="wrap" alignItems="center">
              {CONTACTS.map((c) => (
                <Button
                  key={c.phone}
                  variant="outlined"
                  size="small"
                  onClick={() => (window.location.href = `tel:${c.phone}`)}
                  sx={{
                    borderRadius: 6,
                    borderColor: '#94a3b8',
                    color: '#334155',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.2,
                    '&:hover': { borderColor: '#1976d2', bgcolor: '#f0f7ff' },
                  }}
                >
                  <Box component="img" src={PhoneIcon} width={14} sx={{ mr: 0.6 }} />
                  {!isMobile ? c.phoneDisplay : (i18n.language === 'en' ? c.nameEn : c.name)}
                </Button>
              ))}
              <IconButton
                size="small"
                onClick={() => (window.location.href = SOCIAL_LINKS.facebook)}
                sx={{
                  border: '1px solid #3b5998',
                  bgcolor: '#ffffff',
                  p: 0.6,
                  '&:hover': { bgcolor: '#f0f4ff' },
                }}
              >
                <Box component="img" src={FacebookIcon} width={16} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => (window.location.href = SOCIAL_LINKS.line)}
                sx={{
                  border: '1px solid #2CCF54',
                  bgcolor: '#ffffff',
                  p: 0.6,
                  '&:hover': { bgcolor: '#f0fdf4' },
                }}
              >
                <Box component="img" src={LineIcon} width={16} />
              </IconButton>
            </Stack>

            {/* Book Now Button (Full width on mobile) */}
            <Button
              variant="contained"
              color="primary"
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate('/booking')}
              sx={{
                width: { xs: '100%', md: 'auto' },
                borderRadius: 6,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: { xs: '0.9rem', md: '0.8rem' },
                py: { xs: 0.9, md: 0.6 },
                px: 2.2,
                boxShadow: '0 4px 14px rgba(176, 48, 82, 0.3)',
              }}
            >
              {t("main.bookNow", "จองเลย")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 3. Feature Highlights Strip (4 Compact Cards) */}
      <Grid container spacing={1.2} sx={{ mb: 2.5 }}>
        {featureHighlights.map((feat, idx) => (
          <Grid key={idx} size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.2, sm: 1.8 },
                borderRadius: 2.5,
                bgcolor: feat.bg,
                border: '1px solid rgba(0,0,0,0.04)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)' },
              }}
            >
              <Box sx={{ mb: 0.5 }}>{feat.icon}</Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1e293b', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                {feat.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2, lineHeight: 1.25, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {feat.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 4. Main 2-Column Content Grid */}
      <Grid container spacing={2.5}>
        {/* Left Column: ข้อมูลทั่วไป + ปฏิทินวันว่าง */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2.5}>
            {/* ข้อมูลทั่วไป */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <EditablePropertySection
                title={t("main.generalInfo", "ข้อมูลทั่วไป")}
                category="general"
                items={generalItems}
                isAdmin={isAdmin}
                onItemsChange={setGeneralItems}
              />
            </Paper>

            {/* ปฏิทินวันว่าง */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="primary" />
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                    {t("main.availabilityCalendar", "ปฏิทินวันว่าง")}
                  </Typography>
                </Box>
                <Chip
                  label="แตะวันที่เพื่อจอง"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                />
              </Stack>

              <BookingCalendar
                bookingData={bookingData}
                onChangeMonth={(month, year) => getPriceByMonth(month, year)}
                futureMonthRange={advanceBookingMonths}
                disablePast
              />
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column: สิ่งอำนวยความสะดวก + ข้อกำหนด */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2.5}>
            {/* สิ่งอำนวยความสะดวก */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <EditablePropertySection
                title={t("main.facilities", "สิ่งอำนวยความสะดวก")}
                category="facilities"
                items={facilityItems}
                isAdmin={isAdmin}
                onItemsChange={setFacilityItems}
              />
            </Paper>

            {/* ข้อกำหนดการเข้าพัก */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <EditablePropertySection
                title={t("main.policies", "ข้อกำหนดการเข้าพัก")}
                category="policies"
                items={policyItems}
                isAdmin={isAdmin}
                onItemsChange={setPolicyItems}
              />
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Main;
