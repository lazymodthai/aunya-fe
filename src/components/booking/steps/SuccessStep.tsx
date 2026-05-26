import { Box, Button, Divider, Grid, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { FormatDate } from '@utils/date';
import { CONTACTS } from '@configs/app-settings';
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Capture Area */}
      <Box
        ref={captureRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          textAlign: 'center',
          bgcolor: '#ffffff',
          p: 2,
          width: '100%',
        }}
      >
        {/* Success Icon */}
        <CheckCircleIcon sx={{ fontSize: 80, color: '#15a13aff' }} />

      <Typography sx={{ fontSize: 24, fontWeight: 600, color: '#15a13aff' }}>
        {t('success.bookingSuccess')}
      </Typography>

      <Typography sx={{ fontSize: 14, color: '#7d7d7dff' }}>
        {t('success.thankYou')}
      </Typography>

      {/* Divider */}
      <Divider sx={{ width: '100%', my: 1 }} />

      {/* Reference Code */}
      <Box
        sx={{
          width: '100%',
          bgcolor: '#f5f5f5',
          p: 2,
          borderRadius: 2,
          border: '2px dashed #0b538eff',
        }}
      >
        <Typography sx={{ fontSize: 12, color: '#7d7d7dff', mb: 0.5 }}>{t('success.refCode')}</Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#0b538eff', letterSpacing: 2 }}>
          {refCode}
        </Typography>
      </Box>

      {/* Booking Details */}
      <Box sx={{ width: '100%', textAlign: 'left', mt: 1 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1.5 }}>{t('success.bookingDetails')}</Typography>

        <Grid container spacing={1}>
          <Grid size={6}>
            <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>{t('dateSelection.customerName')}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{name}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>{t('dateSelection.phoneNumber')}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{phoneNumber}</Typography>
          </Grid>
          <Grid size={6} sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>Check-in</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#0b538eff' }}>
              {FormatDate(checkinDate, 4)}
            </Typography>
          </Grid>
          <Grid size={6} sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>Check-out</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#0b538eff' }}>
              {FormatDate(checkoutDate, 4)}
            </Typography>
          </Grid>
          <Grid size={6} sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>{t('success.nightsLabel')}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{t('success.nightsCount', { count: totalDate })}</Typography>
          </Grid>
          <Grid size={6} sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>{t('success.guestLabel')}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{t('success.peopleCount', { count: guestNumber })}</Typography>
          </Grid>
          {!!childrenNumber && (
            <Grid size={6} sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>{t('success.childLabel')}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{t('success.peopleCount', { count: childrenNumber })}</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      <Divider sx={{ width: '100%', my: 1 }} />

      {/* Payment Summary */}
      <Box sx={{ width: '100%', textAlign: 'left' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1.5 }}>{t('success.paymentSummary')}</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: 14 }}>{t('success.roomChargeLabel')}</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
            {totalRoomPrice.toLocaleString()} {t('success.thb')}
          </Typography>
        </Box>

        {!!additionGuestNumber && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: 14 }}>{t('confirmation.extraBedCharge', { count: additionGuestNumber })}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
              {((additionGuestNumber || 0) * additionGuestNumberPrice).toLocaleString()} {t('success.thb')}
            </Typography>
          </Box>
        )}

        {!!additionTowel && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: 14 }}>{t('confirmation.extraTowelCharge', { count: additionTowel })}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
              {((additionTowel || 0) * additionTowelPrice).toLocaleString()} {t('success.thb')}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: 14 }}>
            {t('success.depositLabel')} <span style={{ fontSize: 12, color: '#7d7d7dff' }}>{t('success.depositRefundInfo')}</span>
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
            {depositPrice.toLocaleString()} {t('success.thb')}
          </Typography>
        </Box>

        {discountAmount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: 14, color: '#15a13aff' }}>{t('confirmation.discountLabel')}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#15a13aff' }}>
              -{discountAmount.toLocaleString()} {t('success.thb')}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            {isOnlyDeposit ? t('confirmation.depositAmount') : t('confirmation.totalAmount')}
          </Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#15a13aff' }}>
            {paidAmount.toLocaleString(i18n.language === 'en' ? 'en-US' : 'th-TH', {
              style: 'currency',
              currency: 'THB',
            })}
          </Typography>
        </Box>
        {isOnlyDeposit && remainingAmount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('confirmation.remainingAmount')}</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#ed6c02' }}>
              {remainingAmount.toLocaleString(i18n.language === 'en' ? 'en-US' : 'th-TH', {
                style: 'currency',
                currency: 'THB',
              })}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ width: '100%', my: 1 }} />

      {/* Remaining Payment Info */}
      {isOnlyDeposit && remainingAmount > 0 && (
        <Box
          sx={{
            width: '100%',
            bgcolor: '#fff3e0',
            p: 2,
            borderRadius: 2,
            textAlign: 'left',
            border: '1px solid #ed6c02',
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#ed6c02', mb: 0.5 }}>
            {t('success.remainingInstructions')}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>
            {t('success.remainingText', { price: remainingAmount.toLocaleString() })}
          </Typography>
        </Box>
      )}

      {/* Additional Info */}
      <Box
        sx={{
          width: '100%',
          bgcolor: '#f9f9f9',
          p: 2,
          borderRadius: 2,
          textAlign: 'left',
        }}
      >
        <Typography sx={{ fontSize: 13, color: '#7d7d7dff', lineHeight: 1.6 }}>
          {t('success.keepRefCode')}
          <br />
          {t('success.contactIfDoubt')}{`${CONTACTS[0].phoneDisplay} ${i18n.language === 'en' ? CONTACTS[0].nameEn : CONTACTS[0].name}`}
        </Typography>
      </Box>
      </Box>
      {/* End Capture Area */}

      {/* Save Image Button */}
      <Button
        variant="outlined"
        startIcon={<SaveAltIcon />}
        onClick={handleSaveImage}
        disabled={isSaving}
        sx={{
          mt: 1,
          borderRadius: 2,
          width: '100%',
        }}
      >
        {isSaving ? t('success.saving') : t('success.saveReceipt')}
      </Button>
    </Box>
  );
}

export default SuccessStep;
