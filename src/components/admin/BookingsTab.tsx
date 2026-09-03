import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  ReceiptLong as ReceiptIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Hotel as HotelIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { MyBookingData } from '@apis/booking';
import { BookingStatus } from '@constants/booking.enum';
import { useMemo, useState } from 'react';
import { parseLocalDate } from '@utils/date';

interface BookingsTabProps {
  allBookings: MyBookingData[];
  onStatusChange: (booking: MyBookingData, newStatus: BookingStatus, additionalPayment?: number) => void;
}

function BookingsTab({ allBookings, onStatusChange }: BookingsTabProps) {
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [selectedSlips, setSelectedSlips] = useState<{ fileUrl: string }[]>([]);

  // Filter & Search states
  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState<number | 'all'>(currentDate.getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(currentDate.getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Thai month names
  const thaiMonths = [
    { value: 1, label: 'ม.ค. (มกราคม)' },
    { value: 2, label: 'ก.พ. (กุมภาพันธ์)' },
    { value: 3, label: 'มี.ค. (มีนาคม)' },
    { value: 4, label: 'เม.ย. (เมษายน)' },
    { value: 5, label: 'พ.ค. (พฤษภาคม)' },
    { value: 6, label: 'มิ.ย. (มิถุนายน)' },
    { value: 7, label: 'ก.ค. (กรกฎาคม)' },
    { value: 8, label: 'ส.ค. (สิงหาคม)' },
    { value: 9, label: 'ก.ย. (กันยายน)' },
    { value: 10, label: 'ต.ค. (ตุลาคม)' },
    { value: 11, label: 'พ.ย. (พฤศจิกายน)' },
    { value: 12, label: 'ธ.ค. (ธันวาคม)' },
  ];

  // Year options (current year ± 3 years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 1 + i);

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
      case 'Confirmed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Payment':
        return 'info';
      case 'Cancelled':
        return 'error';
      case 'CheckedIn':
        return 'primary';
      case 'CheckedOut':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'ยืนยันแล้ว';
      case 'Pending':
        return 'รอการยืนยัน';
      case 'Payment':
        return 'รอชำระเงิน';
      case 'Cancelled':
        return 'ยกเลิกแล้ว';
      case 'CheckedIn':
        return 'เข้าพักอยู่';
      case 'CheckedOut':
        return 'เช็คเอาท์แล้ว';
      default:
        return status;
    }
  };

  const formatDateShort = (dateString: string) => {
    return parseLocalDate(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

  const formatDateFull = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return `วัน${thaiDays[date.getDay()]}ที่ ${day} ${thaiMonths[month - 1]} ${year + 543}`;
  };

  const getNightCount = (checkin: string, checkout: string) => {
    const d1 = parseLocalDate(checkin);
    const d2 = parseLocalDate(checkout);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Today key
  const today = new Date();
  const todayDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Currently Checked-In Bookings
  const checkedInBookings = useMemo(() => {
    return allBookings?.filter((b) => b.status === 'CheckedIn') || [];
  }, [allBookings]);

  // Today's Confirmed Bookings (due for check-in today)
  const todayBookings = useMemo(() => {
    return allBookings?.filter((b) => {
      const date = parseLocalDate(b.checkinDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      return dateKey === todayDateKey && b.status === 'Confirmed';
    }) || [];
  }, [allBookings, todayDateKey]);

  const hasCheckedInGuest = checkedInBookings.length > 0;

  // Status counts for filter tabs
  const statusCounts = useMemo(() => {
    const counts = {
      all: 0,
      pending: 0,
      checkedIn: 0,
      confirmed: 0,
      checkedOut: 0,
      cancelled: 0,
    };
    allBookings?.forEach((b) => {
      counts.all++;
      if (b.status === 'Pending' || b.status === 'Payment') counts.pending++;
      else if (b.status === 'CheckedIn') counts.checkedIn++;
      else if (b.status === 'Confirmed') counts.confirmed++;
      else if (b.status === 'CheckedOut') counts.checkedOut++;
      else if (b.status === 'Cancelled') counts.cancelled++;
    });
    return counts;
  }, [allBookings]);

  // Filtered and Grouped Bookings
  const groupedBookings = useMemo(() => {
    const groups: { [date: string]: MyBookingData[] } = {};

    allBookings?.forEach((booking) => {
      const date = parseLocalDate(booking.checkinDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${day}`;

      // Filter by Year
      if (filterYear !== year) return;

      // Filter by Month
      if (filterMonth !== 'all' && filterMonth !== month) return;

      // Filter by Status Tab
      if (statusFilter === 'pending' && !(booking.status === 'Pending' || booking.status === 'Payment')) return;
      if (statusFilter === 'checkedIn' && booking.status !== 'CheckedIn') return;
      if (statusFilter === 'confirmed' && booking.status !== 'Confirmed') return;
      if (statusFilter === 'checkedOut' && booking.status !== 'CheckedOut') return;
      if (statusFilter === 'cancelled' && booking.status !== 'Cancelled') return;

      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = booking.name?.toLowerCase().includes(q);
        const matchPhone = booking.phoneNumber?.includes(q);
        const matchRef = booking.refCode?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchRef) return;
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(booking);
    });

    const sortedDates = Object.keys(groups).sort((a, b) =>
      parseLocalDate(b).getTime() - parseLocalDate(a).getTime()
    );

    return sortedDates.map((date) => ({
      date,
      bookings: groups[date],
    }));
  }, [allBookings, filterMonth, filterYear, statusFilter, searchQuery]);

  const totalFilteredCount = useMemo(() => {
    return groupedBookings.reduce((acc, g) => acc + g.bookings.length, 0);
  }, [groupedBookings]);

  // Main Compact Booking Card Component
  const MobileBookingCard = ({ booking }: { booking: MyBookingData }) => {
    const [additionalPayment, setAdditionalPayment] = useState<number>(booking.remainingAmount || 0);
    const hasRemaining = booking.isOnlyDeposit && booking.remainingAmount > 0;
    const isTodayArrival = todayDateKey === booking.checkinDate?.split('T')[0] && booking.status === 'Confirmed';
    const isCheckedIn = booking.status === 'CheckedIn';
    const isPending = booking.status === 'Pending' || booking.status === 'Payment';
    const nights = getNightCount(booking.checkinDate, booking.checkoutDate);

    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: isCheckedIn ? 'primary.main' : isTodayArrival ? 'success.main' : '#e0e0e0',
          bgcolor: isCheckedIn ? '#f0f7ff' : isTodayArrival ? '#f4faf6' : '#ffffff',
          mb: 1.5,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Top Bar: Ref Code & Status & Slip */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#333', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
              #{booking.refCode}
            </Typography>
            <Chip
              label={getStatusText(booking.status)}
              color={getStatusColor(booking.status) as any}
              size="small"
              sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
            />
          </Stack>

          {booking.files?.slips && booking.files.slips.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ReceiptIcon sx={{ fontSize: 16 }} />}
              onClick={() => handleOpenSlipModal(booking.files.slips)}
              sx={{
                height: 26,
                fontSize: '0.75rem',
                py: 0,
                px: 1,
                textTransform: 'none',
                borderRadius: 1.5,
              }}
            >
              สลิป ({booking.files.slips.length})
            </Button>
          )}
        </Stack>

        {/* Date Row: Visual Stay Dates */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: isCheckedIn ? '#e1effe' : isTodayArrival ? '#e8f5e9' : '#f8f9fa',
            p: 1,
            borderRadius: 2,
            mb: 1.2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <CalendarIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight={700} sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              {formatDateShort(booking.checkinDate)} <span style={{ color: '#888', fontWeight: 400 }}>➔</span> {formatDateShort(booking.checkoutDate)}
            </Typography>
          </Box>
          <Chip
            label={`${nights} คืน`}
            size="small"
            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#ffffff', border: '1px solid #ddd' }}
          />
        </Box>

        {/* Guest & Contact Info */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#222', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> {booking.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3, ml: 2.5 }}>
              <PhoneIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <a
                href={`tel:${booking.phoneNumber}`}
                style={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                }}
              >
                {booking.phoneNumber}
              </a>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              👥 ผู้เข้าพัก: <strong>{booking.guestNumber} ท่าน</strong> {booking.childrenNumber ? `(เด็ก ${booking.childrenNumber})` : ''}
            </Typography>
            {/* Addons */}
            {(!!booking.additionGuestNumber || !!booking.additionTowel) && (
              <Typography variant="caption" sx={{ color: '#555', display: 'block', mt: 0.2 }}>
                ✨ {booking.additionGuestNumber ? `ที่นอนเสริม ${booking.additionGuestNumber} ชุด ` : ''}
                {booking.additionTowel ? `ผ้าเช็ดตัว ${booking.additionTowel} ผืน` : ''}
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Price & Deposit Summary */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            bgcolor: '#fafafa',
            borderRadius: 1.5,
            border: '1px dashed #e0e0e0',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            ยอดชำระ:
          </Typography>
          {hasRemaining ? (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main', display: 'inline', mr: 1 }}>
                มัดจำ ฿{booking.paidAmount?.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#ed6c02', display: 'inline' }}>
                (ค้าง ฿{booking.remainingAmount?.toLocaleString()})
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" fontWeight={700} color="primary.main">
              ฿{booking.totalPrice?.toLocaleString()} {booking.isOnlyDeposit ? '(มัดจำเต็ม)' : '(จ่ายเต็ม)'}
            </Typography>
          )}
        </Box>

        {/* Remarks (if any) */}
        {booking.remark && (
          <Box sx={{ mt: 1, p: 0.8, bgcolor: '#fff8e1', borderRadius: 1.5, border: '1px solid #ffe082' }}>
            <Typography variant="caption" sx={{ color: '#b78103', fontWeight: 600 }}>
              📝 หมายเหตุ: {booking.remark}
            </Typography>
          </Box>
        )}

        {/* Action Buttons for Pending / Payment */}
        {isPending && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckIcon />}
              fullWidth
              onClick={() => onStatusChange(booking, BookingStatus.CONFIRMED)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              ยืนยันการจอง
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CloseIcon />}
              fullWidth
              onClick={() => onStatusChange(booking, BookingStatus.CANCELLED)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              ยกเลิก
            </Button>
          </Stack>
        )}

        {/* Action for Check-In today */}
        {isTodayArrival && (
          <Box sx={{ mt: 1.5 }}>
            {hasRemaining && (
              <Box sx={{ mb: 1, p: 1, bgcolor: '#fff3e0', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#ed6c02', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  เก็บเงินส่วนที่เหลือ: ฿{booking.remainingAmount?.toLocaleString()} บาท
                </Typography>
                <TextField
                  label="ยอดที่เก็บจริง (บาท)"
                  type="number"
                  size="small"
                  fullWidth
                  value={additionalPayment}
                  onChange={(e) => setAdditionalPayment(Number(e.target.value))}
                  slotProps={{ input: { inputProps: { min: 0 } } }}
                />
              </Box>
            )}
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<LoginIcon />}
              fullWidth
              disabled={hasCheckedInGuest && !isCheckedIn}
              onClick={() => onStatusChange(booking, BookingStatus.CHECKED_IN, hasRemaining ? additionalPayment : undefined)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {hasCheckedInGuest && !isCheckedIn ? 'กรุณา Check Out ผู้เข้าพักปัจจุบันก่อน' : 'Check In ผู้เข้าพัก'}
            </Button>
          </Box>
        )}

        {/* Action for Check-Out */}
        {isCheckedIn && (
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<LogoutIcon />}
            fullWidth
            sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600 }}
            onClick={() => onStatusChange(booking, BookingStatus.CHECKED_OUT)}
          >
            Check Out ผู้เข้าพัก
          </Button>
        )}
      </Paper>
    );
  };

  return (
    <Box>
      {/* Title & Quick Stats */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          การจองทั้งหมด
        </Typography>
        <Chip
          label={`${allBookings.length} รายการ`}
          color="primary"
          size="small"
          sx={{ fontWeight: 700 }}
        />
      </Stack>

      {/* 1. Status Filter Pills (Horizontal Scrollable) */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.8,
          overflowX: 'auto',
          pb: 1,
          mb: 1.5,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Chip
          label={`ทั้งหมด (${statusCounts.all})`}
          clickable
          color={statusFilter === 'all' ? 'primary' : 'default'}
          variant={statusFilter === 'all' ? 'filled' : 'outlined'}
          onClick={() => setStatusFilter('all')}
          size="small"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label={`⏳ รอยืนยัน (${statusCounts.pending})`}
          clickable
          color={statusCounts.pending > 0 ? (statusFilter === 'pending' ? 'warning' : 'warning') : 'default'}
          variant={statusFilter === 'pending' ? 'filled' : 'outlined'}
          onClick={() => setStatusFilter('pending')}
          size="small"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label={`🏨 เข้าพักอยู่ (${statusCounts.checkedIn})`}
          clickable
          color={statusCounts.checkedIn > 0 ? (statusFilter === 'checkedIn' ? 'primary' : 'primary') : 'default'}
          variant={statusFilter === 'checkedIn' ? 'filled' : 'outlined'}
          onClick={() => setStatusFilter('checkedIn')}
          size="small"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label={`✅ ยืนยันแล้ว (${statusCounts.confirmed})`}
          clickable
          color={statusFilter === 'confirmed' ? 'success' : 'default'}
          variant={statusFilter === 'confirmed' ? 'filled' : 'outlined'}
          onClick={() => setStatusFilter('confirmed')}
          size="small"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label={`🚪 เช็คเอาท์ (${statusCounts.checkedOut})`}
          clickable
          color={statusFilter === 'checkedOut' ? 'default' : 'default'}
          variant={statusFilter === 'checkedOut' ? 'filled' : 'outlined'}
          onClick={() => setStatusFilter('checkedOut')}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* 2. Compact Search & Date Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 2.5,
          border: '1px solid #e0e0e0',
          mb: 2,
          bgcolor: '#fafafa',
        }}
      >
        <Stack spacing={1.2}>
          {/* Search Input */}
          <TextField
            placeholder="ค้นหาชื่อผู้จอง, รหัส, เบอร์โทร..."
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{ bgcolor: '#fff', borderRadius: 2 }}
          />

          {/* Month & Year Selectors */}
          <Stack direction="row" spacing={1}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel id="booking-month-filter-label">เดือน</InputLabel>
              <Select
                labelId="booking-month-filter-label"
                value={filterMonth}
                label="เดือน"
                onChange={(e) => setFilterMonth(e.target.value as number | 'all')}
                sx={{ bgcolor: '#fff' }}
              >
                <MenuItem value="all">ทุกเดือน</MenuItem>
                {thaiMonths.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ width: 110 }}>
              <InputLabel id="booking-year-filter-label">ปี</InputLabel>
              <Select
                labelId="booking-year-filter-label"
                value={filterYear}
                label="ปี"
                onChange={(e) => setFilterYear(Number(e.target.value))}
                sx={{ bgcolor: '#fff' }}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y + 543}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      {/* 3. Highlight: Currently Checked-In Guest */}
      {checkedInBookings.length > 0 && statusFilter === 'all' && !searchQuery && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HotelIcon fontSize="small" /> ผู้เข้าพักปัจจุบัน ({checkedInBookings.length})
          </Typography>
          {checkedInBookings.map((b) => (
            <MobileBookingCard key={`checkedin-${b.id}`} booking={b} />
          ))}
        </Box>
      )}

      {/* 4. Highlight: Today's Confirmed Arrivals */}
      {todayBookings.length > 0 && statusFilter === 'all' && !searchQuery && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} color="success.main" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LoginIcon fontSize="small" /> เช็คอินวันนี้ ({todayBookings.length})
          </Typography>
          {todayBookings.map((b) => (
            <MobileBookingCard key={`today-${b.id}`} booking={b} />
          ))}
        </Box>
      )}

      {/* 5. Main Booking Feed List */}
      {totalFilteredCount === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px dashed #ccc',
            bgcolor: '#fafafa',
          }}
        >
          <Typography variant="body1" fontWeight={600} color="text.secondary" gutterBottom>
            ไม่พบรายการจองตามเงื่อนไขที่เลือก
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            ลองปรับเปลี่ยนเดือน, ปี หรือคำค้นหา
          </Typography>
        </Paper>
      ) : (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
            แสดงผล {totalFilteredCount} รายการ:
          </Typography>
          {groupedBookings.map(({ date, bookings }) => (
            <Box key={date} sx={{ mb: 2 }}>
              {/* Sticky / Clean Date Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#f5f5f5',
                  py: 0.8,
                  px: 1.5,
                  borderRadius: 2,
                  mb: 1,
                  borderLeft: '4px solid #1976d2',
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#222', fontSize: '0.85rem' }}>
                  {formatDateFull(date)}
                </Typography>
                <Chip
                  label={`${bookings.length} รายการ`}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                />
              </Box>

              {/* Booking Cards for this Date */}
              <Stack spacing={0}>
                {bookings.map((booking) => (
                  <MobileBookingCard key={booking.id} booking={booking} />
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      )}

      {/* Slip Lightbox Dialog */}
      <Dialog
        open={slipModalOpen}
        onClose={handleCloseSlipModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>สลิปการชำระเงิน</Typography>
          <IconButton onClick={handleCloseSlipModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Stack spacing={2}>
            {selectedSlips.map((slip, index) => (
              <Box key={index} sx={{ textAlign: 'center' }}>
                <img
                  src={slip.fileUrl}
                  alt={`สลิป ${index + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '450px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                />
              </Box>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default BookingsTab;
