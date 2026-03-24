import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { MyBookingData } from '@apis/booking';
import PriceField from '@components/common/PriceField';
import { parseLocalDate } from '@utils/date';

// Define the type for the booking data
export interface BookingData {
  id?: string; // Price record ID for API updates
  date: string; // Format: "YYYY-MM-DD"
  price: number;
  status: 'Available' | 'Unavailable' | 'Maintenance';
  isMaintenance: boolean;
}

// Props for the AdminBookingCalendar component
interface AdminBookingCalendarProps {
  bookingData: BookingData[];
  onChangeMonth: (val: number) => void;
  startMonth?: number;
  startYear?: number;
  disablePast?: boolean;
  disableFuture?: boolean;
  futureMonthRange?: number;
  pastMonthRange?: number;
  showLegend?: boolean;
  onDayClick?: (dayData: BookingData) => void;
  onUpdatePrice?: (id: string, price: number) => Promise<void>;
  onUpdateMaintenance?: (id: string, isMaintenance: boolean) => Promise<void>;
  onAddBooking?: (date: string) => void;
  getBookingsByDate?: (date: string) => Promise<MyBookingData[]>;
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
}>(({ theme, isUnavailable, isToday, isMaintenance }) => ({
  padding: theme.spacing(1),
  height: useMediaQuery("(max-width:480px)") ? '60px' : '80px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  cursor: 'pointer',
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
  '&:hover': {
    backgroundColor: isMaintenance
      ? 'rgba(255, 165, 0, 0.2)'
      : isUnavailable
        ? 'rgba(255, 0, 0, 0.2)'
        : 'rgba(0, 0, 0, 0.04)',
  },
}));

const DayNumber = styled(Typography)(() => ({
  fontWeight: 'bold',
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

const DrawerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const SWIPE_THRESHOLD = 50; // minimum pixels to trigger swipe

// Main component
const AdminBookingCalendar: React.FC<AdminBookingCalendarProps> = ({
  bookingData,
  onChangeMonth,
  startMonth,
  startYear,
  disablePast = false,
  disableFuture = false,
  futureMonthRange = 12,
  pastMonthRange = 12,
  showLegend = true,
  onDayClick,
  onUpdatePrice,
  onUpdateMaintenance,
  onAddBooking,
  getBookingsByDate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:940px)");

  const today = new Date();

  const getInitialDate = () => {
    const year = startYear ?? today.getFullYear();
    const month = startMonth ?? today.getMonth();
    return new Date(year, month, 1);
  };

  const [currentDate, setCurrentDate] = useState<Date>(getInitialDate);
  const [currentMonthData, setCurrentMonthData] = useState<(BookingData | null)[]>([]);
  const [selectedDay, setSelectedDay] = useState<BookingData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [dayBookings, setDayBookings] = useState<MyBookingData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Edit states
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editMaintenance, setEditMaintenance] = useState<boolean>(false);

  // Slip modal state
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [selectedSlips, setSelectedSlips] = useState<{ fileUrl: string }[]>([]);

  // Touch refs for swipe detection
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

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
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const limitMonth = new Date(today.getFullYear(), today.getMonth() + futureMonthRange + 1, 1);
    return nextMonth < limitMonth;
  };

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

  const formatSelectedDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return `${day} ${getThaiMonthName(month - 1)} ${year + 543}`;
  };

  const handleDayClick = async (dayData: BookingData) => {
    setSelectedDay(dayData);
    setEditPrice(dayData.price);
    setEditMaintenance(dayData.isMaintenance);
    setIsEditingPrice(false);
    setDayBookings([]);

    if (onDayClick) {
      onDayClick(dayData);
    }

    // Fetch bookings for this date if Unavailable
    if (getBookingsByDate && dayData.status === 'Unavailable') {
      setIsLoading(true);
      try {
        const bookings = await getBookingsByDate(dayData.date);
        // Filter out cancelled bookings
        setDayBookings(bookings.filter(b => b.status !== 'Cancelled'));
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
    setDayBookings([]);
    setIsEditingPrice(false);
  };

  const handleSavePrice = async () => {
    if (selectedDay && selectedDay.id && onUpdatePrice) {
      await onUpdatePrice(selectedDay.id, editPrice);
      // Update selectedDay with new price so the displayed value updates
      setSelectedDay({ ...selectedDay, price: editPrice });
      setIsEditingPrice(false);
    }
  };

  const handleToggleMaintenance = async () => {
    if (selectedDay && selectedDay.id && onUpdateMaintenance) {
      const newValue = !editMaintenance;
      setEditMaintenance(newValue);
      await onUpdateMaintenance(selectedDay.id, newValue);
    }
  };

  const handleAddBooking = () => {
    if (selectedDay && onAddBooking) {
      onAddBooking(selectedDay.date);
      handleClose();
    }
  };

  const handleOpenSlipModal = (slips: { fileUrl: string }[]) => {
    setSelectedSlips(slips);
    setSlipModalOpen(true);
  };

  const handleCloseSlipModal = () => {
    setSlipModalOpen(false);
    setSelectedSlips([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Payment': return 'info';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'สำเร็จ';
      case 'Pending': return 'รอการยืนยัน';
      case 'Payment': return 'รอการชำระเงิน';
      case 'Cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return parseLocalDate(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Content for modal/drawer
  const hasBookings = dayBookings.length > 0;
  const isAvailable = selectedDay ? selectedDay.status === 'Available' && !selectedDay.isMaintenance : false;

  const modalContent = selectedDay ? (
      <Box>
        {/* Status Badge */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={
              selectedDay.isMaintenance
                ? 'ปิดปรับปรุง'
                : selectedDay.status === 'Unavailable'
                  ? 'มีผู้จอง'
                  : 'ว่าง'
            }
            color={
              selectedDay.isMaintenance
                ? 'warning'
                : selectedDay.status === 'Unavailable'
                  ? 'error'
                  : 'success'
            }
            size="small"
          />
        </Box>

        {/* Loading */}
        {isLoading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">กำลังโหลด...</Typography>
          </Box>
        )}

        {/* If has bookings - show booking list */}
        {!isLoading && hasBookings && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              รายการจอง ({dayBookings.length})
            </Typography>
            <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {dayBookings.map((booking) => (
                <Card key={booking.id} sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {booking.refCode}
                      </Typography>
                      <Chip
                        label={getStatusText(booking.status)}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {booking.name} - {booking.phoneNumber}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(booking.checkinDate)} - {formatDate(booking.checkoutDate)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      ผู้ใหญ่: {booking.guestNumber} คน{booking.childrenNumber ? ` + เด็ก ${booking.childrenNumber} คน` : ''}
                    </Typography>

                    {(!!booking.additionGuestNumber || !!booking.additionTowel) && (
                      <Box sx={{ mt: 0.5, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        {!!booking.additionGuestNumber && (
                          <Typography variant="body2" color="primary.main" fontWeight={600}>
                            • ที่นอนเสริม: {booking.additionGuestNumber} ชุด
                          </Typography>
                        )}
                        {!!booking.additionTowel && (
                          <Typography variant="body2" color="primary.main" fontWeight={600}>
                            • ผ้าเช็ดตัวเพิ่ม: {booking.additionTowel} ชุด
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                      {booking.isOnlyDeposit && booking.remainingAmount > 0 ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            ชำระแล้ว (มัดจำ)
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            ฿{booking.paidAmount?.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" fontWeight={600} sx={{ color: '#ed6c02' }}>
                            ค้างชำระ: ฿{booking.remainingAmount?.toLocaleString()}
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            ราคารวม
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            ฿{booking.totalPrice.toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                      
                      {booking.files?.slips && booking.files.slips.length > 0 && (
                        <Chip
                          label={"ดูสลิป"}
                          color="default"
                          size="small"
                          clickable
                          onClick={() => handleOpenSlipModal(booking.files.slips)}
                        />
                      )}
                    </Stack>
                    {booking.remark && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(211, 47, 47, 0.05)', borderRadius: 1, border: '1px solid rgba(211, 47, 47, 0.1)' }}>
                        <Typography variant="caption" fontWeight={600} color="error.main" display="block">
                          หมายเหตุ:
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          {booking.remark}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* If available or no bookings - show edit options */}
        {!isLoading && (isAvailable || selectedDay.isMaintenance || !hasBookings) && (
          <Box>
            <Divider sx={{ my: 2 }} />

            {/* Price Edit */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  ราคา
                </Typography>
                {!isEditingPrice && onUpdatePrice && selectedDay.id && (
                  <IconButton size="small" onClick={() => setIsEditingPrice(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
              {isEditingPrice ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <PriceField
                    value={editPrice}
                    onChange={(val) => setEditPrice(val)}
                    size="small"
                    fullWidth
                  />
                  <Button variant="contained" size="small" onClick={handleSavePrice}>
                    บันทึก
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => setIsEditingPrice(false)}>
                    ยกเลิก
                  </Button>
                </Stack>
              ) : (
                <Typography variant="h6" fontWeight={600}>
                  ฿{formatPrice(selectedDay.price)}
                </Typography>
              )}
            </Box>

            {/* Maintenance Toggle */}
            {onUpdateMaintenance && selectedDay.id && (
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editMaintenance}
                      onChange={handleToggleMaintenance}
                      color="warning"
                    />
                  }
                  label="ปิดปรับปรุง"
                />
              </Box>
            )}

            {/* Add Booking Button */}
            {isAvailable && onAddBooking && (
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={handleAddBooking}
                sx={{ mt: 2 }}
              >
                เพิ่มการจองใหม่
              </Button>
            )}
          </Box>
        )}
      </Box>
    ) : null;

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
          {currentDate.getFullYear() + 543}
        </Typography>

        <IconButton onClick={handleNextMonth} size="small" disabled={!canGoToNextMonth()}>
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

                  {!dayData.isMaintenance && (
                    <Price>{dayData.price > 0 ? formatPrice(dayData.price) : 'สอบถาม'}</Price>
                  )}

                  {(dayData.status === "Unavailable" || dayData.isMaintenance) && (
                    <StatusIndicator isMaintenance={dayData.isMaintenance}>
                      {dayData.isMaintenance ? "ปิดปรับปรุง" : "ไม่ว่าง"}
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

      {/* Modal/Drawer */}
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={isModalOpen}
          onClose={handleClose}
          sx={{
            "& .MuiDrawer-paper": {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '80vh',
            },
          }}
        >
          <DrawerContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {selectedDay && formatSelectedDate(selectedDay.date)}
              </Typography>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
            {modalContent}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                {selectedDay && formatSelectedDate(selectedDay.date)}
              </Typography>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            {modalContent}
          </DialogContent>
        </Dialog>
      )}

      {/* Slip Viewer Modal */}
      <Dialog
        open={slipModalOpen}
        onClose={handleCloseSlipModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>สลีปการชำระเงิน</Typography>
          <IconButton onClick={handleCloseSlipModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ py: 1 }}>
            {selectedSlips.map((slip, index) => (
              <Box key={index} sx={{ textAlign: 'center' }}>
                <img
                  src={slip.fileUrl}
                  alt={`สลิป ${index + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
              </Box>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </CalendarContainer>
  );
};

export default AdminBookingCalendar;
