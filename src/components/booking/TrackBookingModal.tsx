import { useState, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close,
  ConfirmationNumberOutlined,
  PhoneOutlined,
  SearchOutlined,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  HighlightOff,
  Hotel,
  MeetingRoom,
  ContentCopy,
  SaveAlt,
  ArrowBack,
} from '@mui/icons-material';
import BookingAPI, { MyBookingData } from '@apis/booking';
import { BookingStatus } from '@constants/booking.enum';
import { FormatDate } from '@utils/date';
import { formatDisplayPhoneNumber } from '@utils/input';
import { CONTACTS } from '@configs/app-settings';
import { useClipboard } from 'use-clipboard-copy';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';

interface TrackBookingModalProps {
  open: boolean;
  onClose: () => void;
}

function TrackBookingModal({ open, onClose }: TrackBookingModalProps) {
  const { t, i18n } = useTranslation();
  const clipboard = useClipboard();

  const [refCode, setRefCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [booking, setBooking] = useState<MyBookingData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!refCode.trim() || !phoneNumber.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await BookingAPI.trackBooking(refCode.trim(), phoneNumber.trim());
      if (res.data && res.data.data) {
        setBooking(res.data.data);
      } else {
        setErrorMsg(t('track.notFound'));
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || t('track.notFound')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBooking(null);
    setErrorMsg('');
  };

  const handleCopyRef = (code: string) => {
    clipboard.copy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveImage = async () => {
    if (!receiptRef.current) return;
    try {
      setIsSaving(true);
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `Aunya-Booking-${booking?.refCode || 'receipt'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error saving receipt image:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return {
          icon: <CheckCircle sx={{ fontSize: 32, color: '#16a34a' }} />,
          title: t('track.statusConfirmed'),
          desc: t('track.statusConfirmedDesc'),
          bgcolor: 'rgba(22, 163, 74, 0.08)',
          color: '#16a34a',
          borderColor: '#bbf7d0',
        };
      case BookingStatus.PENDING:
      case BookingStatus.PAYMENT:
        return {
          icon: <HourglassEmpty sx={{ fontSize: 32, color: '#d97706' }} />,
          title: t('track.statusPending'),
          desc: t('track.statusPendingDesc'),
          bgcolor: '#fffbeb',
          color: '#d97706',
          borderColor: '#fde68a',
        };
      case BookingStatus.CANCELLED:
        return {
          icon: <HighlightOff sx={{ fontSize: 32, color: '#dc2626' }} />,
          title: t('track.statusCancelled'),
          desc: t('track.statusCancelledDesc'),
          bgcolor: '#fef2f2',
          color: '#dc2626',
          borderColor: '#fecaca',
        };
      case 'Rejected':
        return {
          icon: <Cancel sx={{ fontSize: 32, color: '#dc2626' }} />,
          title: t('track.statusRejected'),
          desc: t('track.statusRejectedDesc'),
          bgcolor: '#fef2f2',
          color: '#dc2626',
          borderColor: '#fecaca',
        };
      case BookingStatus.CHECKED_IN:
        return {
          icon: <Hotel sx={{ fontSize: 32, color: '#0284c7' }} />,
          title: t('track.statusCheckedIn'),
          desc: t('track.statusCheckedInDesc'),
          bgcolor: '#f0f9ff',
          color: '#0284c7',
          borderColor: '#bae6fd',
        };
      case BookingStatus.CHECKED_OUT:
        return {
          icon: <MeetingRoom sx={{ fontSize: 32, color: '#64748b' }} />,
          title: t('track.statusCheckedOut'),
          desc: t('track.statusCheckedOutDesc'),
          bgcolor: '#f8fafc',
          color: '#64748b',
          borderColor: '#e2e8f0',
        };
      default:
        return {
          icon: <CheckCircle sx={{ fontSize: 32, color: '#16a34a' }} />,
          title: status,
          desc: '',
          bgcolor: '#f8fafc',
          color: '#1e293b',
          borderColor: '#e2e8f0',
        };
    }
  };

  const calculateNights = (inDate: string, outDate: string) => {
    if (!inDate || !outDate) return 1;
    const cin = new Date(inDate);
    const cout = new Date(outDate);
    return Math.max(1, Math.round((cout.getTime() - cin.getTime()) / (1000 * 60 * 60 * 24)));
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleReset();
        onClose();
      }}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: { xs: 1.5, sm: 2 },
            position: 'relative',
          },
        },
      }}
    >
      <IconButton
        onClick={() => {
          handleReset();
          onClose();
        }}
        size="small"
        sx={{
          position: 'absolute',
          right: 12,
          top: 12,
          color: '#94a3b8',
          bgcolor: '#f1f5f9',
          '&:hover': { bgcolor: '#e2e8f0' },
          zIndex: 2,
        }}
      >
        <Close fontSize="small" />
      </IconButton>

      <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
        {/* VIEW 1: SEARCH FORM */}
        {!booking && (
          <Box component="form" onSubmit={handleSearch} sx={{ py: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  bgcolor: 'rgba(176, 48, 82, 0.1)',
                  color: '#B03052',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1.5,
                }}
              >
                <SearchOutlined sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="#1e293b" sx={{ mb: 0.5 }}>
                {t('track.trackTitle')}
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.85rem' }}>
                {t('track.trackSubtitle')}
              </Typography>
            </Box>

            <Stack spacing={2.2}>
              <TextField
                label={t('track.refCodeLabel')}
                placeholder={t('track.refCodePlaceholder')}
                value={refCode}
                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                fullWidth
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <ConfirmationNumberOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 },
                  },
                }}
              />

              <TextField
                label={t('track.phoneLabel')}
                placeholder={t('track.phonePlaceholder')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 },
                  },
                }}
              />

              {errorMsg && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: '#fef2f2',
                    borderColor: '#fecaca',
                    color: '#b91c1c',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    fontWeight: 500,
                  }}
                >
                  {errorMsg}
                </Paper>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !refCode.trim() || !phoneNumber.trim()}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchOutlined />}
                sx={{
                  borderRadius: 3,
                  py: 1.3,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  bgcolor: '#B03052',
                  boxShadow: '0 4px 14px rgba(176, 48, 82, 0.3)',
                  '&:hover': { bgcolor: '#962341' },
                }}
              >
                {loading ? t('track.searching') : t('track.searchBtn')}
              </Button>
            </Stack>
          </Box>
        )}

        {/* VIEW 2: BOOKING RESULT RECEIPT CARD */}
        {booking && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Top Navigation in Result */}
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
              <Button
                size="small"
                startIcon={<ArrowBack />}
                onClick={handleReset}
                sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'none' }}
              >
                {t('track.searchAnother')}
              </Button>
            </Box>

            {/* Capture Area for Downloading Receipt */}
            <Box
              ref={receiptRef}
              sx={{
                width: '100%',
                bgcolor: '#ffffff',
                p: { xs: 2, sm: 3 },
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                textAlign: 'center',
              }}
            >
              {/* Status Header Badge */}
              {(() => {
                const badge = renderStatusBadge(booking.status);
                return (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: badge.bgcolor,
                      border: `1px solid ${badge.borderColor}`,
                      mb: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ mb: 0.5 }}>{badge.icon}</Box>
                    <Typography variant="h6" fontWeight={800} color={badge.color}>
                      {badge.title}
                    </Typography>
                    {badge.desc && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, fontWeight: 500 }}>
                        {badge.desc}
                      </Typography>
                    )}
                  </Box>
                );
              })()}

              {/* 1-Click Copy Reference Code Card */}
              <Box
                onClick={() => handleCopyRef(booking.refCode)}
                sx={{
                  width: '100%',
                  bgcolor: copied ? '#f0fdf4' : 'rgba(176, 48, 82, 0.04)',
                  py: 1.8,
                  px: 2,
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: copied ? '#16a34a' : '#B03052',
                  mb: 2,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: copied ? '#f0fdf4' : 'rgba(176, 48, 82, 0.08)',
                  },
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.3 }}>
                  {t('success.refCode')}
                </Typography>
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{
                      color: copied ? '#15803d' : '#B03052',
                      letterSpacing: 1.5,
                      fontFamily: 'monospace',
                      fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    }}
                  >
                    {booking.refCode}
                  </Typography>
                  <ContentCopy sx={{ fontSize: 16, color: copied ? '#15803d' : '#B03052', opacity: 0.7 }} />
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.3,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: copied ? '#16a34a' : '#94a3b8',
                  }}
                >
                  {copied ? `✨ ${t('payment.copied', 'คัดลอกแล้ว')}` : `(แตะที่รหัสเพื่อคัดลอก / Click to copy)`}
                </Typography>
              </Box>

              {/* Booking Details Card */}
              <Box sx={{ width: '100%', textAlign: 'left', p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 1.5 }}>
                  {t('success.bookingDetails')}
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">{t('dateSelection.customerName')}</Typography>
                    <Typography variant="body2" fontWeight={600} color="#1e293b">{booking.name}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">{t('dateSelection.phoneNumber')}</Typography>
                    <Typography variant="body2" fontWeight={600} color="#1e293b">{formatDisplayPhoneNumber(booking.phoneNumber)}</Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Check-in</Typography>
                    <Typography variant="body2" fontWeight={600} color="#0b538eff">{FormatDate(new Date(booking.checkinDate), 4)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">Check-out</Typography>
                    <Typography variant="body2" fontWeight={600} color="#0b538eff">{FormatDate(new Date(booking.checkoutDate), 4)}</Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">{t('success.nightsLabel')}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {t('success.nightsCount', { count: calculateNights(booking.checkinDate, booking.checkoutDate) })}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">{t('success.guestLabel')}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {t('success.peopleCount', { count: booking.guestNumber })}
                      {booking.childrenNumber ? ` + ${t('success.childLabel')} ${t('success.peopleCount', { count: booking.childrenNumber })}` : ''}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Cost Summary Card */}
              <Box sx={{ width: '100%', textAlign: 'left', p: 2, bgcolor: '#fff', borderRadius: 3, border: '1px solid #e2e8f0', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 1.5 }}>
                  {t('success.paymentSummary')}
                </Typography>

                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('confirmation.totalAmount')}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {Number(booking.totalPrice).toLocaleString()} {t('success.thb')}
                    </Typography>
                  </Box>

                  {booking.discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600 }}>{t('confirmation.discountLabel')}</Typography>
                      <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 700 }}>
                        -{Number(booking.discount).toLocaleString()} {t('success.thb')}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 0.8 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
                      {booking.isOnlyDeposit ? t('confirmation.depositAmount') : t('confirmation.totalAmount')}
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="#15a13aff" sx={{ fontSize: { xs: '1.2rem', sm: '1.35rem' } }}>
                      {(booking.isOnlyDeposit ? (booking.paidAmount || booking.depositAmount || 0) : Number(booking.totalPrice)).toLocaleString(
                        i18n.language === 'en' ? 'en-US' : 'th-TH',
                        { style: 'currency', currency: 'THB' }
                      )}
                    </Typography>
                  </Box>

                  {booking.isOnlyDeposit && Number(booking.remainingAmount) > 0 && (
                    <Paper
                      variant="outlined"
                      sx={{
                        bgcolor: '#fffbeb',
                        py: 1,
                        px: 1.5,
                        borderRadius: 2.5,
                        borderColor: '#fde68a',
                        mt: 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={600} color="#b45309" sx={{ fontSize: '0.82rem' }}>
                          {t('confirmation.remainingAmount')}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={800} color="#b45309" sx={{ fontSize: '0.95rem' }}>
                          {Number(booking.remainingAmount).toLocaleString('th-TH')} {t('success.thb')}
                        </Typography>
                      </Box>
                    </Paper>
                  )}
                </Stack>
              </Box>

              {/* Contact Reminder */}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6, mt: 1 }}>
                {t('success.keepRefCode')}
                <br />
                {t('success.contactIfDoubt')}{CONTACTS[0].phoneDisplay} ({i18n.language === 'en' ? CONTACTS[0].nameEn : CONTACTS[0].name})
              </Typography>
            </Box>

            {/* Save Image Action Button */}
            <Button
              variant="outlined"
              startIcon={<SaveAlt />}
              onClick={handleSaveImage}
              disabled={isSaving}
              sx={{
                mt: 2,
                borderRadius: 3,
                width: '100%',
                py: 1.2,
                borderColor: '#cbd5e1',
                color: '#334155',
                fontWeight: 600,
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
              }}
            >
              {isSaving ? t('success.saving') : t('success.saveReceipt')}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TrackBookingModal;
