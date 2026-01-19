import { Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import AuthAPI from '@apis/auth';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, setUser, userSelector } from '@store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BookingAPI, { MyBookingData } from '@apis/booking';

function UserPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector(userSelector);
  const [myBooking, setMyBooking] = useState<MyBookingData[]>([])

  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(clearUser());
      navigate('/member/login');
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await AuthAPI.getProfile()
      if (data.user.isAdmin) {
        navigate('/member/admin')
      } else if (!data.user.isActive) {
        dispatch(clearUser());
        navigate('/member/login');
      } else {
        dispatch(setUser(data.user));
        getMyBookings()
      }
    } catch (error) {
      dispatch(clearUser());
      navigate('/member/login');
    }
  }

  const getMyBookings = async () => {
    try {
      const { data } = await BookingAPI.getMyBookings()
      setMyBooking(data.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Payment': return 'warning';
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
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Grid container direction="column" alignItems="center" sx={{ px: 2, width: '98vw' }}>
        <Box sx={{ width: '100%', maxWidth: 600, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight={600}>
              สวัสดี, {userData?.firstName || 'User'}
            </Typography>
            <Button variant="outlined" color="error" size="small" onClick={handleLogout}>
              ออกจากระบบ
            </Button>
          </Stack>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            การจองของฉัน ({myBooking.length})
          </Typography>

          {myBooking.length === 0 ? (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">ยังไม่มีการจอง</Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {myBooking.map((booking) => (
                <Card key={booking.id} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          รหัสการจอง
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {booking.refCode}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusText(booking.status)}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
                          จำนวนผู้เข้าพัก
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

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ผู้จอง: {booking.name} • {booking.phoneNumber}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Grid>
    </Box>
  );
}

export default UserPage;