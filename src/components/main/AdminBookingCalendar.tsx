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
  DialogActions,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { MyBookingData } from '@apis/booking';
import BookingAPI from '@apis/booking';
import { BookingStatus } from '@constants/booking.enum';
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
  width: '100%',
  maxWidth: 700,
  margin: '0 auto',
  padding: theme.spacing(1),
  boxSizing: 'border-box',
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
  padding: '4px',
  minHeight: '64px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  position: 'relative',
  cursor: 'pointer',
  overflow: 'hidden',
  backgroundColor: isMaintenance
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
  '&:hover': {
    backgroundColor: isMaintenance
      ? 'rgba(255, 165, 0, 0.2)'
      : isUnavailable
        ? 'rgba(255, 0, 0, 0.16)'
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
  mt: 0.25,
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
  
  const isPastOrToday = useCallback(() => {
    if (!selectedDay) return false;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const checkDate = parseLocalDate(selectedDay.date);
    return checkDate <= todayDate;
  }, [selectedDay]);

  const [selectedSlips, setSelectedSlips] = useState<{ fileUrl: string }[]>([]);
  const [slipModalOpen, setSlipModalOpen] = useState<boolean>(false);

  // Edit/Cancel states
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<MyBookingData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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

  const handleEditClick = (booking: MyBookingData) => {
    setSelectedBooking(booking);
    setEditFormData({ ...booking });
    setIsEditModalOpen(true);
  };

  const handleCancelClick = (booking: MyBookingData) => {
    setSelectedBooking(booking);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setIsSaving(true);
    try {
      await BookingAPI.updateBooking(selectedBooking.id, { status: BookingStatus.CANCELLED as any });
      setShowCancelConfirm(false);
      // Refresh local data
      if (selectedDay) {
        const bookings = await getBookingsByDate!(selectedDay.date);
        setDayBookings(bookings.filter(b => b.status !== 'Cancelled'));
      }
      // Refresh calendar
      onChangeMonth(currentDate.getMonth());
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('เกิดข้อผิดพลาดในการยกเลิกการจอง');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedBooking || !editFormData) return;
    setIsSaving(true);
    try {
      await BookingAPI.updateBooking(selectedBooking.id, {
        guestNumber: Number(editFormData.guestNumber),
        childrenNumber: Number(editFormData.childrenNumber),
        additionGuestNumber: Number(editFormData.additionGuestNumber),
        totalPrice: Number(editFormData.totalPrice),
        discount: Number(editFormData.discount),
        paidAmount: Number(editFormData.paidAmount),
        isOnlyDeposit: editFormData.isOnlyDeposit,
        additionTowel: Number(editFormData.additionTowel),
        remark: editFormData.remark,
        status: editFormData.status
      });
      setIsEditModalOpen(false);
      // Refresh local data
      if (selectedDay) {
        const bookings = await getBookingsByDate!(selectedDay.date);
        setDayBookings(bookings.filter(b => b.status !== 'Cancelled'));
      }
      // Refresh calendar
      onChangeMonth(currentDate.getMonth());
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
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
            {/* <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              รายการจอง ({dayBookings.length})
            </Typography> */}
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
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<EditIcon />}
                        onClick={() => handleEditClick(booking)}
                      >
                        แก้ไข
                      </Button>
                      <Box sx={{ width: '100%' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          fullWidth
                          startIcon={<DeleteIcon />}
                          onClick={() => handleCancelClick(booking)}
                          disabled={isPastOrToday()}
                          sx={{ 
                            opacity: isPastOrToday() ? 0.5 : 1,
                            '&.Mui-disabled': {
                                color: 'error.main',
                                borderColor: 'error.main',
                                opacity: 0.4
                            }
                          }}
                        >
                          ยกเลิกการจอง
                        </Button>
                      </Box>
                    </Stack>
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
  
  const editFormContent = editFormData ? (
    <Box>
      {/* Read Only Section */}
      <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2, mb: 3 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
          ข้อมูลพื้นฐาน (แก้ไขไม่ได้)
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">วันที่เข้าพัก</Typography>
            <Typography variant="body2" fontWeight={500}>{editFormData.checkinDate?.split('T')[0]}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">วันที่ออก</Typography>
            <Typography variant="body2" fontWeight={500}>{editFormData.checkoutDate?.split('T')[0]}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">ชื่อผู้จอง</Typography>
            <Typography variant="body2" fontWeight={500}>{editFormData.name}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">เบอร์โทร</Typography>
            <Typography variant="body2" fontWeight={500}>{editFormData.phoneNumber}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">สถานะปัจจุบัน</Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip 
                label={getStatusText(editFormData.status)} 
                color={getStatusColor(editFormData.status) as any} 
                size="small" 
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Editable Section */}
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, px: 0.5 }}>
        จัดการข้อมูลการเข้าพัก
      </Typography>
      
      <Grid container spacing={2.5} sx={{ px: 0.5 }}>
        <Grid size={{ xs: 4, sm: 4 }}>
          <TextField 
            label="ผู้ใหญ่" 
            type="number" 
            value={editFormData.guestNumber} 
            onChange={(e) => setEditFormData({...editFormData, guestNumber: Number(e.target.value)})}
            fullWidth size="small" 
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 4 }}>
          <TextField 
            label="เด็ก" 
            type="number" 
            value={editFormData.childrenNumber} 
            onChange={(e) => setEditFormData({...editFormData, childrenNumber: Number(e.target.value)})}
            fullWidth size="small" 
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 4 }}>
          <TextField 
            label="เตียงเสริม" 
            type="number" 
            value={editFormData.additionGuestNumber} 
            onChange={(e) => setEditFormData({...editFormData, additionGuestNumber: Number(e.target.value)})}
            fullWidth size="small" 
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 4 }}>
          <TextField 
            label="ราคาสุทธิ" 
            type="number" 
            value={editFormData.totalPrice} 
            onChange={(e) => setEditFormData({...editFormData, totalPrice: Number(e.target.value)})}
            fullWidth size="small" 
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 4 }}>
          <TextField 
            label="ส่วนลด" 
            type="number" 
            value={editFormData.discount} 
            onChange={(e) => setEditFormData({...editFormData, discount: Number(e.target.value)})}
            fullWidth size="small" 
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 4 }}>
          <TextField 
            label="จ่ายแล้ว" 
            type="number" 
            value={editFormData.paidAmount} 
            onChange={(e) => setEditFormData({...editFormData, paidAmount: Number(e.target.value)})}
            fullWidth size="small" 
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6 }}>
          <TextField 
            label="ผ้าเช็ดตัวเพิ่ม" 
            type="number" 
            value={editFormData.additionTowel} 
            onChange={(e) => setEditFormData({...editFormData, additionTowel: Number(e.target.value)})}
            fullWidth size="small" 
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6 }}>
          <FormControlLabel
            control={<Checkbox checked={editFormData.isOnlyDeposit} onChange={(e) => setEditFormData({...editFormData, isOnlyDeposit: e.target.checked})} />}
            label="มัดจำเท่านั้น"
            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
          />
        </Grid>
        <Grid size={12}>
          <TextField 
            label="หมายเหตุ" 
            multiline 
            rows={2} 
            value={editFormData.remark || ''} 
            onChange={(e) => setEditFormData({...editFormData, remark: e.target.value})}
            fullWidth size="small" 
          />
        </Grid>
        <Grid size={12}>
          <Box sx={{ p: 1.5, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>ยอดค้างชำระ:</Typography>
            <Typography variant="h6" fontWeight={700}>
              ฿{(Number(editFormData.totalPrice) - Number(editFormData.paidAmount) - Number(editFormData.discount)).toLocaleString()}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  ) : null;

  const editFormActions = (
    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ width: '100%' }}>
      <Button onClick={() => setIsEditModalOpen(false)} disabled={isSaving} fullWidth={isMobile}>
        ยกเลิก
      </Button>
      <Button 
        onClick={handleSaveEdit} 
        variant="contained" 
        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
        disabled={isSaving}
        fullWidth={isMobile}
      >
        บันทึกการแก้ไข
      </Button>
    </Stack>
  );

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

          return dayData ? (
            <DayCell
              key={index}
              isUnavailable={dayData.status === "Unavailable"}
              isMaintenance={dayData.isMaintenance}
              isToday={isTodayCheck(day, month, year)}
              isCurrentMonth={true}
              elevation={0}
              onClick={() => handleDayClick(dayData)}
            >
              <DayNumber>{day}</DayNumber>

              {!dayData.isMaintenance && dayData.price > 0 && (
                <Price sx={{ fontSize: '0.6rem', color: 'text.secondary', width: '100%', textAlign: 'center' }}>
                  {formatPrice(dayData.price)}
                </Price>
              )}

              {(dayData.status === "Unavailable" || dayData.isMaintenance) && (
                <StatusIndicator isMaintenance={dayData.isMaintenance}>
                  {dayData.isMaintenance ? "ปิด" : "ไม่ว่าง"}
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
      {/* Edit Booking UI */}
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={isEditModalOpen}
          onClose={() => !isSaving && setIsEditModalOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '90vh',
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Sticky Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  แก้ไขข้อมูลการจอง ({selectedBooking?.refCode})
                </Typography>
                <IconButton onClick={() => setIsEditModalOpen(false)} size="small" disabled={isSaving}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
              {editFormContent}
            </Box>

            {/* Sticky Footer */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              {editFormActions}
            </Box>
          </Box>
        </Drawer>
      ) : (
        <Dialog 
          open={isEditModalOpen} 
          onClose={() => !isSaving && setIsEditModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#2D336B', color: '#fff' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                แก้ไขข้อมูลการจอง ({selectedBooking?.refCode})
              </Typography>
              <IconButton onClick={() => setIsEditModalOpen(false)} size="small" sx={{ color: '#fff' }} disabled={isSaving}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }} dividers>
            {editFormContent}
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            {editFormActions}
          </DialogActions>
        </Dialog>
      )}

      {/* Cancel Confirmation UI */}
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={showCancelConfirm}
          onClose={() => !isSaving && setShowCancelConfirm(false)}
          sx={{
            "& .MuiDrawer-paper": {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              ยืนยันการยกเลิกการจอง
            </Typography>
            <Typography sx={{ mb: 3 }}>
              คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองหมายเลข {selectedBooking?.refCode}? 
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </Typography>
            <Stack spacing={1.5}>
              <Button onClick={handleConfirmCancel} color="error" variant="contained" disabled={isSaving} fullWidth>
                {isSaving ? <CircularProgress size={20} color="inherit" /> : 'ยืนยันการยกเลิกการจอง'}
              </Button>
              <Button onClick={() => setShowCancelConfirm(false)} disabled={isSaving} fullWidth>
                ไม่ยกเลิก
              </Button>
            </Stack>
          </Box>
        </Drawer>
      ) : (
        <Dialog open={showCancelConfirm} onClose={() => !isSaving && setShowCancelConfirm(false)}>
          <DialogTitle>ยืนยันการยกเลิกการจอง</DialogTitle>
          <DialogContent>
            <Typography>
              คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองหมายเลข {selectedBooking?.refCode}? 
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCancelConfirm(false)} disabled={isSaving}>ไม่ยกเลิก</Button>
            <Button onClick={handleConfirmCancel} color="error" variant="contained" disabled={isSaving}>
              {isSaving ? <CircularProgress size={20} color="inherit" /> : 'ยืนยันการยกเลิก'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </CalendarContainer>
  );
};

export default AdminBookingCalendar;
