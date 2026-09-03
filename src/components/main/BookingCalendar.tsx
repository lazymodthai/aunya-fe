import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  styled,
  useMediaQuery,
  useTheme,
  Drawer,
  Modal,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Stack,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Build as BuildIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Define the type for the booking data
export interface BookingData {
  date: string; // Format: "YYYY-MM-DD"
  price: number;
  status: 'Available' | 'Unavailable' | 'Maintenance';
  isMaintenance: boolean;
}

// Props for the BookingCalendar component
interface BookingCalendarProps {
  bookingData: BookingData[];
  onChangeMonth: (month: number, year?: number) => void;
  /** Initial month to display (0-11), defaults to current month */
  startMonth?: number;
  /** Initial year to display, defaults to current year */
  startYear?: number;
  /** Disable navigation to past months, defaults to true */
  disablePast?: boolean;
  /** Disable navigation to future months, defaults to false */
  disableFuture?: boolean;
  /** Number of months allowed to navigate into the future, defaults to 3 */
  futureMonthRange?: number;
  /** Number of months allowed to navigate into the past, defaults to 0 */
  pastMonthRange?: number;
  /** Hide all prices on the calendar, defaults to false */
  hidePrice?: boolean;
  /** Show the legend below the calendar, defaults to true */
  showLegend?: boolean;
  /** Custom callback when a day is clicked */
  onDayClick?: (dayData: BookingData) => void;
}

// Styled components
const CalendarContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
  padding: theme.spacing(2),
  boxSizing: 'border-box',
}));

const DayCell = styled(Paper, {
  shouldForwardProp: (prop) =>
    prop !== 'isUnavailable' &&
    prop !== 'isToday' &&
    prop !== 'isCurrentMonth' &&
    prop !== 'isMaintenance' &&
    prop !== 'isPast'
})<{
  isUnavailable?: boolean;
  isToday?: boolean;
  isCurrentMonth?: boolean;
  isMaintenance?: boolean;
  isPast?: boolean;
}>(({ theme, isUnavailable, isToday, isCurrentMonth, isMaintenance, isPast }) => ({
  padding: '4px',
  minHeight: '64px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  position: 'relative',
  overflow: 'hidden',
  cursor: (isPast || isUnavailable || isMaintenance) ? 'not-allowed' : 'pointer',
  backgroundColor: isPast
    ? theme.palette.action.disabledBackground
    : isMaintenance
      ? 'rgba(255, 165, 0, 0.1)'
      : isUnavailable
        ? 'rgba(255, 0, 0, 0.08)'
        : isToday
          ? 'rgba(66, 165, 245, 0.1)'
          : theme.palette.background.paper,
  border: isToday
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  borderRadius: '6px',
  opacity: isPast ? 0.5 : isCurrentMonth ? 1 : 0.3,
  pointerEvents: isPast ? 'none' : 'auto',
  '&:hover': {
    backgroundColor: (isPast || isUnavailable || isMaintenance)
      ? undefined
      : 'rgba(0, 0, 0, 0.04)',
  },
}));

const DayNumber = styled(Typography)(() => ({
  fontWeight: 'bold',
  fontSize: '0.8rem',
  lineHeight: 1.2,
}));

const Price = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '0.65rem',
  color: theme.palette.text.secondary,
  width: '100%',
  lineHeight: 1.1,
}));

const StatusIndicator = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isMaintenance'
})<{
  isMaintenance?: boolean;
}>(({ theme, isMaintenance }) => ({
  width: '100%',
  textAlign: 'center',
  fontSize: '0.6rem',
  fontWeight: 'bold',
  lineHeight: 1.1,
  color: isMaintenance ? theme.palette.warning.main : theme.palette.error.main,
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxWidth: '90%',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[24],
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const SWIPE_THRESHOLD = 50; // minimum pixels to trigger swipe

// Main component
const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookingData,
  onChangeMonth,
  startMonth,
  startYear,
  disablePast = true,
  disableFuture = false,
  futureMonthRange = 3,
  pastMonthRange = 0,
  hidePrice = false,
  showLegend = true,
  onDayClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:940px)");
  const navigate = useNavigate()
  const { t, i18n } = useTranslation();

  const today = new Date();

  // Initialize with startMonth/startYear or current date
  const getInitialDate = () => {
    const year = startYear ?? today.getFullYear();
    const month = startMonth ?? today.getMonth();
    return new Date(year, month, 1);
  };

  const [currentDate, setCurrentDate] = useState<Date>(getInitialDate);
  const [currentMonthData, setCurrentMonthData] = useState<(BookingData | null)[]>([]);
  const [selectedDay, setSelectedDay] = useState<BookingData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [showInquiryAlert, setShowInquiryAlert] = useState<boolean>(false);

  // Touch refs for swipe detection
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

  const isTodayCheck = (day: number, month: number, year: number): boolean => {
    return (
      today.getDate() === day &&
      today.getMonth() + 1 === month &&
      today.getFullYear() === year
    );
  };

  const isPastCheck = (day: number, month: number, year: number): boolean => {
    const cellDate = new Date(year, month - 1, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return cellDate < todayStart;
  };

  const canGoToPreviousMonth = () => {
    if (disablePast) {
      const startOfCurrentDisplayMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const startOfThisActualMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return startOfCurrentDisplayMonth > startOfThisActualMonth;
    }
    // Check pastMonthRange limit
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const limitMonth = new Date(today.getFullYear(), today.getMonth() - pastMonthRange, 1);
    return previousMonth >= limitMonth;
  };

  const canGoToNextMonth = () => {
    if (disableFuture) {
      const startOfCurrentDisplayMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const startOfThisActualMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return startOfCurrentDisplayMonth < startOfThisActualMonth;
    }
    // Check futureMonthRange limit
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const limitMonth = new Date(today.getFullYear(), today.getMonth() + futureMonthRange + 1, 1);
    return nextMonth < limitMonth;
  };

  // Handle month navigation
  const handlePreviousMonth = () => {
    if (canGoToPreviousMonth()) {
      const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      setCurrentDate(prevDate);
      onChangeMonth(prevDate.getMonth(), prevDate.getFullYear());
    }
  };

  const handleNextMonth = () => {
    if (canGoToNextMonth()) {
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      setCurrentDate(nextDate);
      onChangeMonth(nextDate.getMonth(), nextDate.getFullYear());
    }
  };

  // Swipe handlers for month navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = Math.abs(touchStartY.current - touchEndY);

    // Only trigger if horizontal swipe is greater than vertical
    if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(diffX) > diffY) {
      if (diffX > 0 && canGoToNextMonth()) {
        // Swipe left → next month
        handleNextMonth();
      } else if (diffX < 0 && canGoToPreviousMonth()) {
        // Swipe right → previous month
        handlePreviousMonth();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }, [currentDate]);

  // Create calendar data
  useEffect(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const calendarData: (BookingData | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarData.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = bookingData.find((item) => item.date === dateString);

      if (dayData) {
        calendarData.push(dayData);
      } else {
        calendarData.push({
          date: dateString,
          price: 0,
          status: 'Available',
          isMaintenance: false
        });
      }
    }

    const totalDaysToShow = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
    for (let i = calendarData.length; i < totalDaysToShow; i++) {
      calendarData.push(null);
    }

    setCurrentMonthData(calendarData);
  }, [currentDate, bookingData, startingDayOfWeek, daysInMonth]);

  const formatPrice = (price: number): string => {
    return price.toLocaleString('th-TH');
  };

  const dayNames = i18n.language === 'en'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const getThaiMonthName = (month: number): string => {
    if (i18n.language === 'en') {
      const englishMonths = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
      ];
      return englishMonths[month];
    }
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return thaiMonths[month];
  };

  const handleDayClick = (dayData: BookingData) => {
    if (dayData.status === 'Available' && !dayData.isMaintenance) {
      if (onDayClick) {
        onDayClick(dayData);
      } else {
        setSelectedDay(dayData);
        setIsDrawerOpen(true);
      }
    }
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    setSelectedDay(null);
  };

  const handleBookingClick = () => {
    if (selectedDay) {
      navigate(`/booking?startDate=${selectedDay.date}`)
    }
    handleClose();
  };

  const getStatusText = (dayData: BookingData): string => {
    if (dayData.isMaintenance) return t('calendar.maintenance');
    if (dayData.status === 'Unavailable') return t('calendar.unavailable');
    return t('calendar.available');
  };

  const getPrice = (dayData: BookingData): number => {
    return dayData.price;
  };

  const getStatusColor = (dayData: BookingData): string => {
    if (dayData.isMaintenance) return theme.palette.warning.main;
    if (dayData.status === 'Unavailable') return theme.palette.error.main;
    return theme.palette.success.main;
  };

  return (
    <CalendarContainer
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <IconButton onClick={handlePreviousMonth} size="small" disabled={!canGoToPreviousMonth()}>
          <ChevronLeftIcon />
        </IconButton>

        <Typography variant="h6" component="h2">
          {getThaiMonthName(currentDate.getMonth())}{" "}
          {i18n.language === 'en' ? currentDate.getFullYear() : currentDate.getFullYear() + 543}
        </Typography>

        <IconButton onClick={handleNextMonth} size="small" disabled={!canGoToNextMonth()}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Day names row — CSS grid for perfect 7-column alignment */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', mb: 0.5 }}>
        {dayNames.map((day, index) => (
          <Typography
            key={index}
            align="center"
            sx={{
              fontWeight: 'bold',
              fontSize: '0.75rem',
              color: index === 0 ? 'error.main' : 'text.secondary',
              py: 0.5,
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {currentMonthData.map((dayData, index) => {
          const day = dayData ? parseInt(dayData.date.split('-')[2]) : 0;
          const month = dayData ? parseInt(dayData.date.split('-')[1]) : 0;
          const year = dayData ? parseInt(dayData.date.split('-')[0]) : 0;

          const past = disablePast && dayData ? isPastCheck(day, month, year) : false;

          return dayData ? (
            <DayCell
              key={index}
              isUnavailable={dayData.status === "Unavailable"}
              isMaintenance={dayData.isMaintenance}
              isToday={isTodayCheck(day, month, year)}
              isCurrentMonth={true}
              isPast={past}
              elevation={0}
              onClick={() => !past && handleDayClick(dayData)}
            >
              <DayNumber>{day}</DayNumber>

              {!past && !hidePrice && !dayData.isMaintenance && dayData.status === 'Available' && (
                <Price sx={{ width: '100%', textAlign: 'center' }}>
                  {dayData.price > 0 ? formatPrice(dayData.price) : t('calendar.inquiry')}
                </Price>
              )}

              {!past && (dayData.status === "Unavailable" || dayData.isMaintenance) && (
                <StatusIndicator isMaintenance={dayData.isMaintenance}>
                  {dayData.isMaintenance ? t('calendar.closed') : t('calendar.unavailable')}
                </StatusIndicator>
              )}
            </DayCell>
          ) : (
            <Box key={index} sx={{ minHeight: '64px', borderRadius: '6px', bgcolor: 'transparent' }} />
          );
        })}
      </Box>

      {showLegend && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mr: 2, mb: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                mr: 1,
                border: "1px solid #ddd",
              }}
            />
            <Typography variant="caption">{t('calendar.unavailable')}</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mr: 2, mb: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: "rgba(255, 165, 0, 0.1)",
                mr: 1,
                border: "1px solid #ddd",
              }}
            />
            <Typography variant="caption">{t('calendar.maintenance')}</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mr: 2, mb: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: "rgba(66, 165, 245, 0.1)",
                mr: 1,
                border: `1px solid ${theme.palette.primary.main}`,
              }}
            />
            <Typography variant="caption">{t('calendar.today')}</Typography>
          </Box>
        </Box>
      )}

      {/* Render Mobile Drawer & Desktop Dialog with Unified Luxury Design */}
      {(() => {
        const renderDetailBody = (day: BookingData) => {
          const isAvailable = day.status === 'Available';
          const isMaintenance = day.isMaintenance || day.status === 'Maintenance';
          const price = getPrice(day);
          const dayNumber = parseInt(day.date.split('-')[2]);
          const monthName = getThaiMonthName(parseInt(day.date.split('-')[1]) - 1);
          const year = i18n.language === 'en' ? parseInt(day.date.split('-')[0]) : parseInt(day.date.split('-')[0]) + 543;

          return (
            <Stack spacing={2} sx={{ width: '100%', mt: 0.5 }}>
              {/* Date & Status Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: isAvailable ? '#f0fdf4' : isMaintenance ? '#fffbeb' : '#fef2f2',
                  borderColor: isAvailable ? '#bbf7d0' : isMaintenance ? '#fde68a' : '#fecaca',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isAvailable ? '#dcfce7' : isMaintenance ? '#fef3c7' : '#fee2e2',
                      color: isAvailable ? '#15803d' : isMaintenance ? '#b45309' : '#b91c1c',
                      flexShrink: 0,
                    }}
                  >
                    <CalendarMonthIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                      {t('calendar.date', 'วันที่')}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1e293b', fontSize: '1.05rem', lineHeight: 1.2 }}>
                      {dayNumber} {monthName} {year}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 0.5, borderTop: '1px solid', borderColor: isAvailable ? '#dcfce7' : isMaintenance ? '#fef3c7' : '#fee2e2' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {t('calendar.status', 'สถานะ')}
                  </Typography>
                  {isAvailable ? (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: '15px !important', color: '#15803d !important' }} />}
                      label="ว่าง (พร้อมให้จอง)"
                      size="small"
                      sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.78rem', height: 26 }}
                    />
                  ) : isMaintenance ? (
                    <Chip
                      icon={<BuildIcon sx={{ fontSize: '15px !important', color: '#b45309 !important' }} />}
                      label={t('calendar.maintenance', 'ปิดปรับปรุง')}
                      size="small"
                      sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: '0.78rem', height: 26 }}
                    />
                  ) : (
                    <Chip
                      icon={<CancelIcon sx={{ fontSize: '15px !important', color: '#b91c1c !important' }} />}
                      label={t('calendar.unavailable', 'ติดจอง / ไม่ว่าง')}
                      size="small"
                      sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontSize: '0.78rem', height: 26 }}
                    />
                  )}
                </Stack>
              </Paper>

              {/* Price Highlight */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  borderColor: '#e2e8f0',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                  {t('calendar.ratePerNight', 'ราคาสำหรับวันนี้')}
                </Typography>
                <Stack direction="row" justifyContent="center" alignItems="baseline" spacing={0.5}>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{ color: isAvailable ? '#b03052' : '#64748b', fontSize: '1.85rem' }}
                  >
                    {price === 0 ? t('calendar.inquiry', 'สอบถามราคา') : `฿${price.toLocaleString()}`}
                  </Typography>
                  {price > 0 && (
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      / คืน
                    </Typography>
                  )}
                </Stack>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.8, fontSize: '0.75rem' }}>
                  ✨ พูลวิลล่าส่วนตัวทั้งหลัง • สระว่ายน้ำ • โต๊ะพูล • คาราโอเกะ
                </Typography>
              </Paper>

              {/* CTA Button */}
              {isAvailable ? (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={price === 0 ? () => setShowInquiryAlert(true) : handleBookingClick}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.2,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    bgcolor: '#b03052',
                    boxShadow: '0 4px 14px rgba(176, 48, 82, 0.28)',
                    '&:hover': { bgcolor: '#8e2340' },
                  }}
                >
                  {price === 0 ? t('calendar.inquiry') : t('calendar.book', 'จองเลย')}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  fullWidth
                  disabled
                  sx={{ py: 1.2, borderRadius: 2.5, fontWeight: 600 }}
                >
                  {isMaintenance ? 'งดให้บริการ (ปิดปรับปรุง)' : 'ขออภัย วันนี้มีผู้จองแล้ว'}
                </Button>
              )}
            </Stack>
          );
        };

        if (isMobile) {
          return (
            <Drawer
              anchor="bottom"
              open={isDrawerOpen && !!selectedDay}
              onClose={handleClose}
              sx={{
                "& .MuiDrawer-paper": {
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  bgcolor: "#fff",
                  p: 2.5,
                  pb: 4,
                  maxWidth: 500,
                  mx: 'auto',
                },
              }}
            >
              <Box sx={{ width: 40, height: 4, bgcolor: '#e2e8f0', borderRadius: 2, mx: 'auto', mb: 1.5 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.15rem', color: '#1e293b' }}>
                  {t('calendar.bookingDetail')}
                </Typography>
                <IconButton onClick={handleClose} size="small" sx={{ color: '#94a3b8' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
              {selectedDay && renderDetailBody(selectedDay)}
            </Drawer>
          );
        }

        return (
          <Dialog
            open={isDrawerOpen && !!selectedDay}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3.5,
                p: 1,
                boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
              },
            }}
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5, pt: 1.5, px: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.15rem', color: '#1e293b' }}>
                {t('calendar.bookingDetail')}
              </Typography>
              <IconButton onClick={handleClose} size="small" sx={{ color: '#94a3b8' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ px: 2, py: 1.5 }}>
              {selectedDay && renderDetailBody(selectedDay)}
            </DialogContent>
          </Dialog>
        );
      })()}
      <Dialog
        open={showInquiryAlert}
        onClose={() => setShowInquiryAlert(false)}
      >
        <DialogTitle>{t('calendar.alertTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('calendar.alertContent')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInquiryAlert(false)} autoFocus>
            {t('calendar.ok')}
          </Button>
        </DialogActions>
      </Dialog>
    </CalendarContainer>
  );
};

export default BookingCalendar;