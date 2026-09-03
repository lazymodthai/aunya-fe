import { Box, Button, Divider, Grid, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { FormatDate } from '@utils/date';
import { CONTACTS, PROPERTY } from '@configs/app-settings';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';

interface SuccessStepProps {
  refCode: string;
  name: string;
  phoneNumber: string;
  checkinDate: Date;
  checkoutDate: Date;
  totalDate: number;
  guestNumber: number;
  childrenNumber: number | null;
  additionGuestNumber: number | null;
  additionTowel: number | null;
  totalRoomPrice: number;
  additionGuestNumberPrice: number;
  additionTowelPrice: number;
  depositPrice: number;
  totalPrice: number;
  discountAmount: number;
  isOnlyDeposit: boolean;
  paidAmount: number;
  remainingAmount: number;
}

function SuccessStep({
  refCode,
  name,
  phoneNumber,
  checkinDate,
  checkoutDate,
  totalDate,
  guestNumber,
  childrenNumber,
  additionGuestNumber,
  additionTowel,
  totalRoomPrice,
  additionGuestNumberPrice,
  additionTowelPrice,
  depositPrice,
  totalPrice,
  discountAmount,
  isOnlyDeposit,
  paidAmount,
  remainingAmount,
}: SuccessStepProps) {
  const { t, i18n } = useTranslation();
  const captureRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveImage = async () => {
    if (!captureRef.current) return;

    setIsSaving(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `booking-${refCode}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Capture Area */}
      <Box
        ref={captureRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          bgcolor: '#ffffff',
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          width: '100%',
        }}
      >
        {/* Success Icon */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(22, 163, 74, 0.1)',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 36 }} />
        </Box>

        <Typography variant="h5" fontWeight={700} color="#16a34a" sx={{ mb: 0.5 }}>
          {t('success.bookingSuccess')}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mb: 2.5 }}>
          {t('success.thankYou')}
        </Typography>

        {/* Reference Code Card */}
        <Box
          sx={{
            width: '100%',
            bgcolor: 'rgba(176, 48, 82, 0.04)',
            p: 2,
            borderRadius: 3,
            border: '2px dashed #B03052',
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('success.refCode')}
            </Typography>
            <Typography variant="h6" fontWeight={800} color="#B03052" letterSpacing={1.5}>
              {refCode}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={handleCopyRef}
            startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
            sx={{
              borderRadius: 2,
              borderColor: '#B03052',
              color: '#B03052',
              fontSize: '0.75rem',
              fontWeight: 600,
              py: 0.5,
              px: 1.5,
            }}
          >
            {copied ? t('payment.copied', 'คัดลอกแล้ว') : t('payment.copy', 'คัดลอก')}
          </Button>
        </Box>

        {/* Booking Details Card */}
        <Box sx={{ width: '100%', textAlign: 'left', p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 1.5 }}>
            {t('success.bookingDetails')}
          </Typography>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">{t('dateSelection.customerName')}</Typography>
              <Typography variant="body2" fontWeight={600} color="#1e293b">{name}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">{t('dateSelection.phoneNumber')}</Typography>
              <Typography variant="body2" fontWeight={600} color="#1e293b">{phoneNumber}</Typography>
            </Grid>

            <Grid size={{ xs: 6, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Check-in</Typography>
              <Typography variant="body2" fontWeight={600} color="#0b538eff">{FormatDate(checkinDate, 4)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">Check-out</Typography>
              <Typography variant="body2" fontWeight={600} color="#0b538eff">{FormatDate(checkoutDate, 4)}</Typography>
            </Grid>

            <Grid size={{ xs: 6, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">{t('success.nightsLabel')}</Typography>
              <Typography variant="body2" fontWeight={600}>{t('success.nightsCount', { count: totalDate })}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">{t('success.guestLabel')}</Typography>
              <Typography variant="body2" fontWeight={600}>
                {guestNumber} {t('success.peopleCount', { count: guestNumber })}
                {childrenNumber ? ` + ${t('success.childLabel')} ${childrenNumber}` : ''}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Payment Summary */}
        <Box sx={{ width: '100%', textAlign: 'left', p: 2, bgcolor: '#fff', borderRadius: 3, border: '1px solid #e2e8f0', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 1.5 }}>
            {t('success.paymentSummary')}
          </Typography>

          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">{t('success.roomChargeLabel')}</Typography>
              <Typography variant="body2" fontWeight={600}>{totalRoomPrice.toLocaleString()} {t('success.thb')}</Typography>
            </Box>

            {!!additionGuestNumber && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">{t('confirmation.extraBedCharge', { count: additionGuestNumber })}</Typography>
                <Typography variant="body2" fontWeight={600}>{((additionGuestNumber || 0) * additionGuestNumberPrice).toLocaleString()} {t('success.thb')}</Typography>
              </Box>
            )}

            {!!additionTowel && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">{t('confirmation.extraTowelCharge', { count: additionTowel })}</Typography>
                <Typography variant="body2" fontWeight={600}>{((additionTowel || 0) * additionTowelPrice).toLocaleString()} {t('success.thb')}</Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {t('success.depositLabel')} <span style={{ fontSize: 11, color: '#94a3b8' }}>{t('success.depositRefundInfo')}</span>
              </Typography>
              <Typography variant="body2" fontWeight={600}>{depositPrice.toLocaleString()} {t('success.thb')}</Typography>
            </Box>

            {discountAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600 }}>{t('confirmation.discountLabel')}</Typography>
                <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 700 }}>
                  -{discountAmount.toLocaleString()} {t('success.thb')}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
                {isOnlyDeposit ? t('confirmation.depositAmount') : t('confirmation.totalAmount')}
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#15a13aff">
                {paidAmount.toLocaleString(i18n.language === 'en' ? 'en-US' : 'th-TH', {
                  style: 'currency',
                  currency: 'THB',
                })}
              </Typography>
            </Box>

            {isOnlyDeposit && remainingAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fffbeb', p: 1.2, borderRadius: 2, border: '1px solid #fef3c7' }}>
                <Typography variant="caption" fontWeight={600} color="#b45309">{t('confirmation.remainingAmount')}</Typography>
                <Typography variant="body2" fontWeight={700} color="#b45309">
                  {remainingAmount.toLocaleString(i18n.language === 'en' ? 'en-US' : 'th-TH', {
                    style: 'currency',
                    currency: 'THB',
                  })}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Contact info reminder */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
          📌 {t('success.keepRefCode')}
          <br />
          📞 {t('success.contactIfDoubt')}{CONTACTS[0].phoneDisplay} ({i18n.language === 'en' ? CONTACTS[0].nameEn : CONTACTS[0].name})
        </Typography>
      </Box>

      {/* Save Image Button */}
      <Button
        variant="outlined"
        startIcon={<SaveAltIcon />}
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
  );
}

export default SuccessStep;
