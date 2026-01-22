import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { MyBookingData } from '@apis/booking';
import { BookingStatus } from '@constants/booking.enum';
import { useMemo, useState } from 'react';

interface BookingsTabProps {
  allBookings: MyBookingData[];
  onStatusChange: (booking: MyBookingData, newStatus: BookingStatus) => void;
}

function BookingsTab({ allBookings, onStatusChange }: BookingsTabProps) {
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [selectedSlips, setSelectedSlips] = useState<{ fileUrl: string }[]>([]);

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
        return 'รอการชำระเงิน';
      case 'Cancelled':
        return 'ยกเลิก';
      case 'CheckedIn':
        return 'เข้าพักแล้ว';
      case 'CheckedOut':
        return 'เช็คเอาท์แล้ว';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateFull = (dateString: string) => {
    // Parse date string directly to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Create local date (month is 0-indexed)

    const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return `วัน${thaiDays[date.getDay()]}ที่ ${day} ${thaiMonths[month - 1]} ${year + 543}`;
  };

  // Get today's date key
  const getTodayDateKey = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDateKey = getTodayDateKey();

  // Currently checked-in bookings (show at the very top until checked out)
  const checkedInBookings = useMemo(() => {
    return allBookings?.filter((booking) => booking.status === 'CheckedIn') || [];
  }, [allBookings]);

  // Today's confirmed bookings (check-in today with Confirmed status)
  const todayBookings = useMemo(() => {
    return allBookings?.filter((booking) => {
      const date = new Date(booking.checkinDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      return dateKey === todayDateKey && booking.status === 'Confirmed';
    }) || [];
  }, [allBookings, todayDateKey]);

  // Check if there's already a checked-in guest (disable check-in for others)
  const hasCheckedInGuest = checkedInBookings.length > 0;

  // Group bookings by check-in date, sorted by most recent first
  const groupedBookings = useMemo(() => {
    const groups: { [date: string]: MyBookingData[] } = {};

    allBookings?.forEach((booking) => {
      // Convert to local date to get correct date key (avoid UTC timezone issue)
      const date = new Date(booking.checkinDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(booking);
    });

    const sortedDates = Object.keys(groups).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map((date) => ({
      date,
      bookings: groups[date],
      pendingCount: groups[date].filter(b => b.status === 'Pending' || b.status === 'Payment').length,
    }));
  }, [allBookings]);

  const BookingCard = ({ booking }: { booking: MyBookingData }) => (
    <Card sx={{ borderRadius: 2, mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              รหัสการจอง
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {booking.refCode}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {booking.files?.slips && booking.files.slips.length > 0 && (
              <Chip
                label={"ดูสลิป"}
                color="default"
                size="small"
                clickable
                onClick={() => handleOpenSlipModal(booking.files.slips)}
              />
            )}
            <Chip label={getStatusText(booking.status)} color={getStatusColor(booking.status) as any} size="small" />
          </Box>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              เช็คอิน
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(booking.checkinDate)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              เช็คเอาท์
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(booking.checkoutDate)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              ผู้เข้าพัก
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {booking.guestNumber} คน
              {booking.additionGuestNumber ? ` (+${booking.additionGuestNumber})` : ''}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              ราคารวม
            </Typography>
            <Typography variant="body1" fontWeight={600} color="primary">
              ฿{booking.totalPrice.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          ผู้จอง: {booking.name} - {booking.phoneNumber}
        </Typography>

        {(booking.status === 'Pending' || booking.status === 'Payment') && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              fullWidth
              onClick={() => onStatusChange(booking, BookingStatus.CONFIRMED)}
            >
              ยืนยัน
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              fullWidth
              onClick={() => onStatusChange(booking, BookingStatus.CANCELLED)}
            >
              ยกเลิก
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  // Booking card for checked-in guests (with Check Out button)
  const CheckedInBookingCard = ({ booking }: { booking: MyBookingData }) => (
    <Card sx={{ borderRadius: 2, mb: 2, border: '2px solid', borderColor: 'primary.main' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              รหัสการจอง
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {booking.refCode}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {booking.files?.slips && booking.files.slips.length > 0 && (
              <Chip
                label={"ดูสลิป"}
                color="default"
                size="small"
                clickable
                onClick={() => handleOpenSlipModal(booking.files.slips)}
              />
            )}
            <Chip label={getStatusText(booking.status)} color={getStatusColor(booking.status) as any} size="small" />
          </Box>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              เช็คอิน
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(booking.checkinDate)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              เช็คเอาท์
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(booking.checkoutDate)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              ผู้เข้าพัก
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {booking.guestNumber} คน
              {booking.additionGuestNumber ? ` (+${booking.additionGuestNumber})` : ''}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              ราคารวม
            </Typography>
            <Typography variant="body1" fontWeight={600} color="primary">
              ฿{booking.totalPrice.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          ผู้จอง: {booking.name} - {booking.phoneNumber}
        </Typography>

        <Button
          variant="contained"
          color="error"
          size="small"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => onStatusChange(booking, BookingStatus.CHECKED_OUT)}
        >
          Check Out
        </Button>
      </CardContent>
    </Card>
  );

  // Booking card for today's bookings (with Check In button)
  const TodayBookingCard = ({ booking, disabled }: { booking: MyBookingData; disabled: boolean }) => (
    <Card sx={{ borderRadius: 2, mb: 2, opacity: disabled ? 0.6 : 1 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              รหัสการจอง
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {booking.refCode}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {booking.files?.slips && booking.files.slips.length > 0 && (
              <Chip
                label={"ดูสลิป"}
                color="default"
                size="small"
                clickable
                onClick={() => handleOpenSlipModal(booking.files.slips)}
              />
            )}
            <Chip label={getStatusText(booking.status)} color={getStatusColor(booking.status) as any} size="small" />
          </Box>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              เช็คอิน
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(booking.checkinDate)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              เช็คเอาท์
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(booking.checkoutDate)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              ผู้เข้าพัก
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {booking.guestNumber} คน
              {booking.additionGuestNumber ? ` (+${booking.additionGuestNumber})` : ''}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              ราคารวม
            </Typography>
            <Typography variant="body1" fontWeight={600} color="primary">
              ฿{booking.totalPrice.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          ผู้จอง: {booking.name} - {booking.phoneNumber}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="small"
          fullWidth
          sx={{ mt: 2 }}
          disabled={disabled}
          onClick={() => onStatusChange(booking, BookingStatus.CHECKED_IN)}
        >
          {disabled ? 'กรุณา Check Out ก่อน' : 'Check In'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        การจองทั้งหมด ({allBookings.length})
      </Typography>

      {/* Currently Checked-In Guests (show at top until checked out) */}
      {checkedInBookings.length > 0 && (
        <Card sx={{ borderRadius: 3, mb: 3, bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.main' }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                ผู้เข้าพักปัจจุบัน
              </Typography>
              <Chip
                label={`${checkedInBookings.length} รายการ`}
                size="small"
                color="primary"
              />
            </Stack>
            <Stack spacing={0}>
              {checkedInBookings.map((booking) => (
                <CheckedInBookingCard key={booking.id} booking={booking} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Today's Confirmed Bookings */}
      {todayBookings.length > 0 && (
        <Card sx={{ borderRadius: 3, mb: 3, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} color="success.main">
                การจองวันนี้
              </Typography>
              <Chip
                label={`${todayBookings.length} รายการ`}
                size="small"
                color="success"
              />
            </Stack>
            {hasCheckedInGuest && (
              <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
                * กรุณา Check Out ผู้เข้าพักปัจจุบันก่อนจึงจะ Check In ได้
              </Typography>
            )}
            <Stack spacing={0}>
              {todayBookings.map((booking) => (
                <TodayBookingCard key={booking.id} booking={booking} disabled={hasCheckedInGuest} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {allBookings.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">ยังไม่มีการจอง</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1}>
          {groupedBookings.map(({ date, bookings, pendingCount }) => (
            <Accordion
              key={date}
              sx={{
                borderRadius: '12px !important',
                '&:before': { display: 'none' },
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                '&.Mui-expanded': {
                  margin: '8px 0 !important',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  borderRadius: '12px',
                  '&.Mui-expanded': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                  <Typography fontWeight={600}>
                    {formatDateFull(date)}
                  </Typography>
                  {pendingCount > 0 && (
                    <Chip
                      label={`${pendingCount} รอดำเนินการ`}
                      size="small"
                      color="warning"
                    />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Stack spacing={0}>
                  {bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
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
    </Box>
  );
}

export default BookingsTab;
