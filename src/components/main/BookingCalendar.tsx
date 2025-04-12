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
  useTheme
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon 
} from '@mui/icons-material';

// Define the type for the booking data
interface BookingData {
  m: number;  // month
  d: number;  // day
  price: number;
  promotion: 'yes' | 'no';
  reserved: 'yes' | 'no';
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
  shouldForwardProp: (prop) => prop !== 'isReserved' && prop !== 'isToday' && prop !== 'isCurrentMonth'
})<{
  isReserved?: boolean;
  isToday?: boolean;
  isCurrentMonth?: boolean;
}>(({ theme, isReserved, isToday, isCurrentMonth }) => ({
  padding: theme.spacing(1),
  height: '80px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  cursor: isReserved ? 'not-allowed' : 'pointer',
  backgroundColor: isReserved 
    ? 'rgba(255, 0, 0, 0.1)' 
    : isToday 
      ? 'rgba(66, 165, 245, 0.1)' 
      : theme.palette.background.paper,
  border: isToday 
    ? `1px solid ${theme.palette.primary.main}` 
    : `1px solid ${theme.palette.divider}`,
  opacity: isCurrentMonth ? 1 : 0.5,
  '&:hover': {
    backgroundColor: isReserved 
      ? 'rgba(255, 0, 0, 0.1)' 
      : 'rgba(0, 0, 0, 0.04)',
  },
}));

const DayNumber = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const Price = styled(Typography)(({ theme }) => ({
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

const ReservedIndicator = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: 4,
  right: 8,
  fontSize: '0.7rem',
  fontWeight: 'bold',
  color: theme.palette.error.main,
}));

// Main component
const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookingData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentMonthData, setCurrentMonthData] = useState<(BookingData | null)[]>([]);
  
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
          reserved: 'no'
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

  return (
    <CalendarContainer>
      {/* Calendar header with navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handlePreviousMonth} size="small">
          <ChevronLeftIcon />
        </IconButton>
        
        <Typography variant="h6" component="h2">
          {getThaiMonthName(currentDate.getMonth())} {currentDate.getFullYear() + 543}
        </Typography>
        
        <IconButton onClick={handleNextMonth} size="small">
          <ChevronRightIcon />
        </IconButton>
      </Box>
      
      {/* Day names row */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {dayNames.map((day, index) => (
          <Grid key={index} size={12/7}>
            <Typography 
              align="center" 
              sx={{ 
                fontWeight: 'bold',
                color: index === 0 ? 'error.main' : 'text.primary'
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
          <Grid size={12/7} key={index}>
            {dayData ? (
              <DayCell 
                isReserved={dayData.reserved === 'yes'} 
                isToday={isToday(dayData.d)}
                isCurrentMonth={true}
                elevation={0}
              >
                <DayNumber>{dayData.d}</DayNumber>
                
                {dayData.price > 0 && (
                  <Price>฿{formatPrice(dayData.price)}</Price>
                )}
                
                {dayData.promotion === 'yes' && (
                  <PromotionChip label="PRO" size="small" />
                )}
                
                {dayData.reserved === 'yes' && (
                  <ReservedIndicator>จองแล้ว</ReservedIndicator>
                )}
              </DayCell>
            ) : (
              <DayCell isCurrentMonth={false} elevation={0} />
            )}
          </Grid>
        ))}
      </Grid>
      
      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: 'rgba(255, 0, 0, 0.1)', mr: 1, border: '1px solid #ddd' }} />
          <Typography variant="caption">จองแล้ว</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: 'rgba(66, 165, 245, 0.1)', mr: 1, border: `1px solid ${theme.palette.primary.main}` }} />
          <Typography variant="caption">วันนี้</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip 
            label="PRO" 
            size="small" 
            sx={{ 
              height: 20, 
              fontSize: '0.6rem',
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
              mr: 1
            }} 
          />
          <Typography variant="caption">โปรโมชั่น</Typography>
        </Box>
      </Box>
    </CalendarContainer>
  );
};

export default BookingCalendar;