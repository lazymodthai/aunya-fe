import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  styled,
  useMediaQuery,
  useTheme,
  Drawer,
  Modal,
  Button
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
  onChangeMonth: (val: number) => void;
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
  minWidth: 350,
  maxWidth: 600,
  margin: '0 auto',
  padding: theme.spacing(2),
}));

const DayCell = styled(Paper, {
  shouldForwardProp: (prop) =>
    prop !== 'isUnavailable' &&
    prop !== 'isToday' &&
    prop !== 'isCurrentMonth' &&
    prop !== 'isMaintenance'
})<{
  isUnavailable?: boolean;
  isToday?: boolean;
  isCurrentMonth?: boolean;
  isMaintenance?: boolean;
}>(({ theme, isUnavailable, isToday, isCurrentMonth, isMaintenance }) => ({
  padding: theme.spacing(1),
  height: useMediaQuery("(max-width:480px)") ? '60px' : '80px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  cursor: (isUnavailable || isMaintenance) ? 'not-allowed' : 'pointer',
  backgroundColor: isMaintenance
    ? 'rgba(255, 165, 0, 0.1)'
    : isUnavailable
      ? 'rgba(255, 0, 0, 0.1)'
      : isToday
        ? 'rgba(66, 165, 245, 0.1)'
        : theme.palette.background.paper,
  border: isToday
    ? `1px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  opacity: isCurrentMonth ? 1 : 0.5,
  '&:hover': {
    backgroundColor: (isUnavailable || isMaintenance)
      ? (isMaintenance ? 'rgba(255, 165, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)')
      : 'rgba(0, 0, 0, 0.04)',
  },
}));

const DayNumber = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const Price = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '0.85rem',
  color: theme.palette.text.secondary,
}));

const StatusIndicator = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isMaintenance'
})<{
  isMaintenance?: boolean;
}>(({ theme, isMaintenance }) => ({
  position: 'absolute',
  bottom: 4,
  width: useMediaQuery("(max-width:800px)") ? '70%' : '75%',
  textAlign: 'center',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  color: isMaintenance ? theme.palette.warning.main : theme.palette.error.main
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
    onChangeMonth(currentDate.getMonth() - 1);
    if (canGoToPreviousMonth()) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNextMonth = () => {
    onChangeMonth(currentDate.getMonth() + 1);
    if (canGoToNextMonth()) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

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

  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const getThaiMonthName = (month: number): string => {
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
    if (dayData.isMaintenance) return 'ปิดปรับปรุง';
    if (dayData.status === 'Unavailable') return 'ไม่ว่าง';
    return 'ว่าง';
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
    <CalendarContainer>
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
          {currentDate.getFullYear() + 543}
        </Typography>

        <IconButton onClick={handleNextMonth} size="small" disabled={!canGoToNextMonth()}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Day names row - CORRECTED GRID */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {dayNames.map((day, index) => (
          <Grid size={12 / 7} key={index}>
            <Typography
              align="center"
              sx={{
                fontWeight: "bold",
                color: index === 0 ? "error.main" : "text.primary",
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar grid - CORRECTED GRID */}
      <Grid container spacing={1}>
        {currentMonthData.map((dayData, index) => {
          const day = dayData ? parseInt(dayData.date.split('-')[2]) : 0;
          const month = dayData ? parseInt(dayData.date.split('-')[1]) : 0;
          const year = dayData ? parseInt(dayData.date.split('-')[0]) : 0;

          return (
            <Grid size={12 / 7} key={index}>
              {dayData ? (
                <DayCell
                  isUnavailable={dayData.status === "Unavailable"}
                  isMaintenance={dayData.isMaintenance}
                  isToday={isTodayCheck(day, month, year)}
                  isCurrentMonth={true}
                  elevation={0}
                  onClick={() => handleDayClick(dayData)}
                >
                  <DayNumber>{day}</DayNumber>

                  {!hidePrice && !dayData.isMaintenance && dayData.status === 'Available' && (
                    <Price>{dayData.price > 0 ? formatPrice(dayData.price) : 'สอบถาม'}</Price>
                  )}

                  {(dayData.status === "Unavailable" ||
                    dayData.isMaintenance) && (
                      <StatusIndicator
                        isMaintenance={dayData.isMaintenance}
                      >
                        {dayData.isMaintenance
                          ? "ปิดปรับปรุง"
                          : "ไม่ว่าง"}
                      </StatusIndicator>
                    )}
                </DayCell>
              ) : (
                <DayCell isCurrentMonth={false} elevation={0} />
              )}
            </Grid>
          )
        })}
      </Grid>

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
            <Typography variant="caption">ไม่ว่าง</Typography>
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
            <Typography variant="caption">ปิดปรับปรุง</Typography>
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
            <Typography variant="caption">วันนี้</Typography>
          </Box>
        </Box>
      )}

      {isMobile && (
        <Drawer
          anchor="bottom"
          open={isDrawerOpen && !!selectedDay}
          onClose={handleClose}
          sx={{
            "& .MuiDrawer-paper": {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              bgcolor: "#fff",
            },
          }}
        >
          <DrawerContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">รายละเอียดการจอง</Typography>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {selectedDay && (
              <>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {parseInt(selectedDay.date.split('-')[2])} {getThaiMonthName(parseInt(selectedDay.date.split('-')[1]) - 1)}{" "}
                  {parseInt(selectedDay.date.split('-')[0]) + 543}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1">สถานะ:</Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: getStatusColor(selectedDay),
                    }}
                  >
                    {getStatusText(selectedDay)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1">ราคา:</Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    {getPrice(selectedDay) === 0 ? 'สอบถาม' : getPrice(selectedDay).toLocaleString("th-TH")}
                  </Typography>
                </Box>

                {selectedDay.status === "Available" && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleBookingClick}
                    sx={{
                      fontSize: "24px",
                      mt: 1,
                      bgcolor: "#FFF2F2",
                      color: "#B03052",
                      border: `1px solid #B03052`,
                      borderRadius: "12px",
                      height: '3rem'
                    }}
                  >
                    จอง
                  </Button>
                )}
              </>
            )}
          </DrawerContent>
        </Drawer>
      )}

      {!isMobile && (
        <Modal open={isDrawerOpen && !!selectedDay} onClose={handleClose}>
          <ModalContent sx={{ bgcolor: '#fff', borderRadius: '12px' }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">รายละเอียดการจอง</Typography>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {selectedDay && (
              <>
                <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
                  {parseInt(selectedDay.date.split('-')[2])} {getThaiMonthName(parseInt(selectedDay.date.split('-')[1]) - 1)}{" "}
                  {parseInt(selectedDay.date.split('-')[0]) + 543}
                </Typography>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
                >
                  <Typography variant="body1">สถานะ:</Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: getStatusColor(selectedDay),
                    }}
                  >
                    {getStatusText(selectedDay)}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <Typography variant="body1">ราคา:</Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: '#000',
                    }}
                  >
                    {getPrice(selectedDay).toLocaleString("th-TH")}
                  </Typography>
                </Box>

                {selectedDay.status === "Available" && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleBookingClick}
                    sx={{
                      fontSize: "24px",
                      mt: 1,
                      bgcolor: "#FFF2F2",
                      color: "#B03052",
                      border: `1px solid #B03052`,
                      borderRadius: "12px",
                      height: '3rem'
                    }}
                  >
                    จอง
                  </Button>
                )}
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </CalendarContainer>
  );
};

export default BookingCalendar;