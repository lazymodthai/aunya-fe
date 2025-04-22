import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Grid, 
  Paper, 
  styled, 
  Chip,
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

// Define the type for the booking data
interface BookingData {
  m: number;  // month
  d: number;  // day
  price: number;
  promotion: 'yes' | 'no' | string;
  reserved: 'yes' | 'no' | string;
  maintenance: 'yes' | 'no' | string; // Added maintenance status
}

// Props for the BookingCalendar component
interface BookingCalendarProps {
  bookingData: BookingData[];
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
    prop !== 'isReserved' && 
    prop !== 'isToday' && 
    prop !== 'isCurrentMonth' && 
    prop !== 'isMaintenance'
})<{
  isReserved?: boolean;
  isToday?: boolean;
  isCurrentMonth?: boolean;
  isMaintenance?: boolean;
}>(({ theme, isReserved, isToday, isCurrentMonth, isMaintenance }) => ({
  padding: theme.spacing(1),
  height: useMediaQuery("(max-width:480px)") ? '60px' : '80px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  cursor: (isReserved || isMaintenance) ? 'not-allowed' : 'pointer',
  backgroundColor: isMaintenance
    ? 'rgba(255, 165, 0, 0.1)'
    : isReserved 
      ? 'rgba(255, 0, 0, 0.1)' 
      : isToday 
        ? 'rgba(66, 165, 245, 0.1)' 
        : theme.palette.background.paper,
  border: isToday 
    ? `1px solid ${theme.palette.primary.main}` 
    : `1px solid ${theme.palette.divider}`,
  opacity: isCurrentMonth ? 1 : 0.5,
  '&:hover': {
    backgroundColor: (isReserved || isMaintenance)
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

const PromotionChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 4,
  right: 4,
  height: 20,
  fontSize: '0.6rem',
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
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
const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookingData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:940px)");
  
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentMonthData, setCurrentMonthData] = useState<(BookingData | null)[]>([]);
  const [selectedDay, setSelectedDay] = useState<BookingData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  
  // Calculate the first day of the month and the number of days
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const today = new Date();
  const isToday = (day: number): boolean => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };
  
  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  // Create calendar data
  useEffect(() => {
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Prepare the calendar grid including previous and next month days
    const calendarData: (BookingData | null)[] = [];
    
    // Add empty slots for days from the previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarData.push(null);
    }
    
    // Add current month days with booking data
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = bookingData.find(
        (item) => item.m === currentMonth && item.d === day
      );
      
      if (dayData) {
        calendarData.push(dayData);
      } else {
        // If no data found for this day, create a placeholder
        calendarData.push({
          m: currentMonth,
          d: day,
          price: 0,
          promotion: 'no',
          reserved: 'no',
          maintenance: 'no' // Default maintenance status
        });
      }
    }
    
    // Fill the remaining slots with null for the next month
    const totalDaysToShow = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
    for (let i = calendarData.length; i < totalDaysToShow; i++) {
      calendarData.push(null);
    }
    
    setCurrentMonthData(calendarData);
  }, [currentDate, bookingData, startingDayOfWeek, daysInMonth]);
  
  // Format price for display
  const formatPrice = (price: number): string => {
    return price.toLocaleString('th-TH');
  };
  
  // Day names
  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  
  // Format month name in Thai
  const getThaiMonthName = (month: number): string => {
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return thaiMonths[month];
  };

  // Handle day click
  const handleDayClick = (dayData: BookingData) => {
    // Only show details for days that aren't reserved or under maintenance
    if (dayData.reserved !== 'yes' && dayData.maintenance !== 'yes') {
      setSelectedDay(dayData);
      setIsDrawerOpen(true);
    }
  };

  // Handle close drawer/modal
  const handleClose = () => {
    setIsDrawerOpen(false);
    setSelectedDay(null);
  };

  // Handle booking button click
  const handleBookingClick = () => {
    if (selectedDay) {
      const year = currentDate.getFullYear();
      const month = selectedDay.m;
      const day = selectedDay.d;
      console.log(`Booking for: ${day}/${month}/${year}`);
    }
    handleClose();
  };

  // Get status text based on day data
  const getStatusText = (dayData: BookingData): string => {
    if (dayData.maintenance === 'yes') return 'ปิดปรับปรุง';
    if (dayData.reserved === 'yes') return 'ติดจอง';
    return 'ว่าง';
  };

  const getPrice = (dayData: BookingData): number => {
    console.log(dayData)
    return dayData.price;
  };

  // Get status color based on day data
  const getStatusColor = (dayData: BookingData): string => {
    if (dayData.maintenance === 'yes') return theme.palette.warning.main;
    if (dayData.reserved === 'yes') return theme.palette.error.main;
    return theme.palette.success.main;
  };

  return (
    <CalendarContainer>
      {/* Calendar header with navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <IconButton onClick={handlePreviousMonth} size="small">
          <ChevronLeftIcon />
        </IconButton>

        <Typography variant="h6" component="h2">
          {getThaiMonthName(currentDate.getMonth())}{" "}
          {currentDate.getFullYear() + 543}
        </Typography>

        <IconButton onClick={handleNextMonth} size="small">
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Day names row */}
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

      {/* Calendar grid */}
      <Grid container spacing={1}>
        {currentMonthData.map((dayData, index) => (
          <Grid size={12 / 7} key={index}>
            {dayData ? (
              <DayCell
                isReserved={dayData.reserved === "yes"}
                isMaintenance={dayData.maintenance === "yes"}
                isToday={isToday(dayData.d)}
                isCurrentMonth={true}
                elevation={0}
                onClick={() => handleDayClick(dayData)}
              >
                <DayNumber>{dayData.d}</DayNumber>

                {!isMobile && dayData.price > 0 && (
                  <Price>฿{formatPrice(dayData.price)}</Price>
                )}

                {dayData.promotion === "yes" && (
                  <PromotionChip label="PRO" size="small" />
                )}

                {(dayData.reserved === "yes" ||
                  dayData.maintenance === "yes") && (
                  <StatusIndicator
                    isMaintenance={dayData.maintenance === "yes"}
                  >
                    {dayData.maintenance === "yes"
                      ? "ปิดปรับปรุง"
                      : isMobile
                      ? "จอง"
                      : "ติดจอง"}
                  </StatusIndicator>
                )}
              </DayCell>
            ) : (
              <DayCell isCurrentMonth={false} elevation={0} />
            )}
          </Grid>
        ))}
      </Grid>

      {/* Legend */}
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
          <Typography variant="caption">ติดจอง</Typography>
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

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Chip
            label="PRO"
            size="small"
            sx={{
              height: 20,
              fontSize: "0.6rem",
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
              mr: 1,
            }}
          />
          <Typography variant="caption">โปรโมชั่น</Typography>
        </Box>
      </Box>

      {/* Mobile Drawer */}
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
                  {selectedDay.d} {getThaiMonthName(selectedDay.m - 1)}{" "}
                  {currentDate.getFullYear() + 543}
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
                    {getPrice(selectedDay).toLocaleString("en-US")}
                  </Typography>
                </Box>

                {selectedDay.reserved !== "yes" &&
                  selectedDay.maintenance !== "yes" && (
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

      {/* Desktop Modal */}
      {!isMobile && (
        <Modal open={isDrawerOpen && !!selectedDay} onClose={handleClose}>
          <ModalContent sx={{bgcolor: '#fff', borderRadius: '12px'}}>
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
                  {selectedDay.d} {getThaiMonthName(selectedDay.m - 1)}{" "}
                  {currentDate.getFullYear() + 543}
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
                    {getPrice(selectedDay).toLocaleString("en-US")}
                  </Typography>
                </Box>

                {selectedDay.reserved !== "yes" &&
                  selectedDay.maintenance !== "yes" && (
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