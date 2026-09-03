import { Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import AuthAPI from '@apis/auth';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, setUser, userSelector } from '@store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BookingAPI, { MyBookingData } from '@apis/booking';
import { parseLocalDate } from '@utils/date';
import { useTranslation } from 'react-i18next';

function UserPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector(userSelector);
  const [myBooking, setMyBooking] = useState<MyBookingData[]>([])
  const { t, i18n } = useTranslation();

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
      case 'Confirmed': return t('booking.status.confirmed');
      case 'Pending': return t('booking.status.pending');
      case 'Payment': return t('booking.status.payment');
      case 'Cancelled': return t('booking.status.cancelled');
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return parseLocalDate(dateString).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 760, mx: 'auto', px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={700} color="#1e293b">
              {t('member.welcome', { name: userData?.firstName || 'User' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('member.myBookingsCount', { count: myBooking.length })}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleLogout}
            sx={{ borderRadius: 2.5, px: 2 }}
          >
            {t('member.logout')}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ width: '100%' }}>
        {myBooking.length === 0 ? (
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('member.noBookingsYet')}</Typography>
          </Card>
        ) : (
          <Stack spacing={2.5}>
            {myBooking.map((booking) => (
              <Card
                key={booking.id}
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                   <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('member.bookingCode')}
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
                          {t('member.checkin')}
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(booking.checkinDate)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('member.checkout')}
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(booking.checkoutDate)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('member.guestsTitle')}
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {booking.guestNumber} {t('success.peopleCount', { count: booking.guestNumber })}
                          {booking.childrenNumber ? ` + ${t('success.childLabel')} ${booking.childrenNumber} ${t('success.peopleCount', { count: booking.childrenNumber })}` : ''}
                          {booking.additionGuestNumber ? ` (+${booking.additionGuestNumber})` : ''}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('card.totalPrice')}
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="primary">
                          {Number(booking.totalPrice).toLocaleString()} {t('success.thb')}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1.5 }} />

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('member.guestNameLabel')}: {booking.name} • {booking.phoneNumber}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
  );
}

export default UserPage;