import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { MyBookingData } from '@apis/booking';
import { BookingStatus } from '@constants/booking.enum';
import { useMemo } from 'react';

interface BookingsTabProps {
  allBookings: MyBookingData[];
  onStatusChange: (booking: MyBookingData, newStatus: BookingStatus) => void;
}

function BookingsTab({ allBookings, onStatusChange }: BookingsTabProps) {
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
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'สำเร็จ';
      case 'Pending':
        return 'รอการยืนยัน';
      case 'Payment':
        return 'รอการชำระเงิน';
      case 'Cancelled':
        return 'ยกเลิก';
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
    const date = new Date(dateString);
    const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return `วัน${thaiDays[date.getDay()]}ที่ ${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
  };

  // Group bookings by check-in date, sorted by most recent first
  const groupedBookings = useMemo(() => {
    const groups: { [date: string]: MyBookingData[] } = {};

    allBookings.forEach((booking) => {
      const dateKey = booking.checkinDate.split('T')[0];
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
          <Chip label={getStatusText(booking.status)} color={getStatusColor(booking.status) as any} size="small" />
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

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        การจองทั้งหมด ({allBookings.length})
      </Typography>

      {allBookings.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">ยังไม่มีการจอง</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1}>
          {groupedBookings.map(({ date, bookings }) => (
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
                  <Chip
                    label={`${bookings.length} รายการ`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
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
    </Box>
  );
}

export default BookingsTab;
