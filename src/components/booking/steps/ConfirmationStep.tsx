import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormatDate } from '@utils/date';
import { formatDisplayPhoneNumber } from '@utils/input';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import PricesAPI, { DiscountCode, PriceDetail } from '@apis/prices';
import { HIGH_PRICE_THRESHOLD, HIGH_PRICE_DEPOSIT } from '@configs/app-settings';
import { useTranslation } from 'react-i18next';

interface ConfirmationStepProps {
  checkinDate: Date;
  checkoutDate: Date;
  guestNumber: number;
  childrenNumber: number | null;
  additionGuestNumber: number | null;
  additionTowel: number | null;
  name: string;
  phoneNumber: string;
  discountCode: string;
  roomId: string;
  additionGuestNumberPrice: number;
  additionTowelPrice: number;
  depositPrice: number;
  isOnlyDeposit: boolean;
  onIsOnlyDepositChange: (value: boolean) => void;
  onDiscountCodeChange: (value: string) => void;
  onPriceCalculated: (
    totalPrice: number,
    roomPrices: PriceDetail[],
    discountAmount: number,
    discountData: DiscountCode | null,
    nights: number,
    actualDeposit: number
  ) => void;
}

function ConfirmationStep({
  checkinDate,
  checkoutDate,
  guestNumber,
  childrenNumber,
  additionGuestNumber,
  additionTowel,
  name,
  phoneNumber,
  discountCode,
  roomId,
  additionGuestNumberPrice,
  additionTowelPrice,
  depositPrice,
  isOnlyDeposit,
  onIsOnlyDepositChange,
  onDiscountCodeChange,
  onPriceCalculated,
}: ConfirmationStepProps) {
  const { t, i18n } = useTranslation();
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [roomPrices, setRoomPrices] = useState<PriceDetail[]>([]);
  const [totalRoomPrice, setTotalRoomPrice] = useState(0);
  const [nights, setNights] = useState(0);
  const [discountData, setDiscountData] = useState<DiscountCode | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountValidated, setDiscountValidated] = useState(false);

  // Calculate room price from API on mount
  useEffect(() => {
    const calculatePrice = async () => {
      setIsLoadingPrice(true);
      try {
        const { data } = await PricesAPI.priceCalculate({
          roomId,
          checkinDate: format(checkinDate, 'yyyy-MM-dd'),
          checkoutDate: format(checkoutDate, 'yyyy-MM-dd'),
        });
        setRoomPrices(data.priceDetails);
        setTotalRoomPrice(data.totalPrice);
        setNights(data.nights);
      } catch (error) {
        console.error('Error calculating price:', error);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    calculatePrice();
  }, [checkinDate, checkoutDate, roomId]);

  // Calculate discount amount
  const getDiscountAmount = () => {
    if (!discountData) return 0;

    const discountValue = Number(discountData.discount) || 0;
    const discountPercentage = Number(discountData.discountPercentage) || 0;

    if (discountValue > 0) {
      return discountValue;
    }

    if (discountPercentage > 0) {
      const subtotal =
        totalRoomPrice +
        (additionGuestNumber || 0) * additionGuestNumberPrice +
        (additionTowel || 0) * additionTowelPrice;
      return Math.floor((subtotal * discountPercentage) / 100);
    }

    return 0;
  };

  const discountAmount = getDiscountAmount();
  const subtotal =
    totalRoomPrice +
    (additionGuestNumber || 0) * additionGuestNumberPrice +
    (additionTowel || 0) * additionTowelPrice;

  // Calculate deposit per day: high price days = HIGH_PRICE_DEPOSIT, others = depositPrice
  const actualDeposit = roomPrices.reduce((total, p) => {
    return total + (p.price >= HIGH_PRICE_THRESHOLD ? HIGH_PRICE_DEPOSIT : depositPrice);
  }, 0);

  const totalPrice = Math.max(0, subtotal - discountAmount + actualDeposit);

  // Notify parent of calculated price whenever it changes
  useEffect(() => {
    if (!isLoadingPrice) {
      onPriceCalculated(totalPrice, roomPrices, discountAmount, discountData, nights, actualDeposit);
    }
  }, [totalRoomPrice, discountData, isLoadingPrice, additionGuestNumber, additionTowel, nights, actualDeposit]);

  // Validate discount code
  const handleValidateDiscount = async () => {
    if (!discountCode) return;

    setIsValidatingDiscount(true);
    setDiscountError(null);
    try {
      const { data } = await PricesAPI.getDiscountDataByCode(discountCode);
      if (data.expiresAt && new Date() > new Date(data.expiresAt)) {
        setDiscountError(t('confirmation.codeExpired', 'โค้ดส่วนลดนี้หมดอายุแล้ว'));
        setDiscountData(null);
      } else if (data.count <= 0) {
        setDiscountError(t('confirmation.codeDepleted', 'โค้ดนี้ถูกใช้หมดแล้ว'));
        setDiscountData(null);
      } else {
        setDiscountData(data);
        setDiscountValidated(true);
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message;
      if (errMsg && (errMsg.includes('หมดอายุ') || errMsg.includes('expired'))) {
        setDiscountError(t('confirmation.codeExpired', 'โค้ดส่วนลดนี้หมดอายุแล้ว'));
      } else if (errMsg && (errMsg.includes('หมดแล้ว') || errMsg.includes('depleted'))) {
        setDiscountError(t('confirmation.codeDepleted', 'โค้ดนี้ถูกใช้หมดแล้ว'));
      } else {
        setDiscountError(t('confirmation.codeInvalid', 'ไม่พบโค้ดส่วนลดนี้'));
      }
      setDiscountData(null);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  // Reset discount when code changes
  const handleDiscountCodeChange = (value: string) => {
    onDiscountCodeChange(value);
    if (discountValidated) {
      setDiscountValidated(false);
      setDiscountData(null);
      setDiscountError(null);
    }
  };

  if (isLoadingPrice) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t("confirmation.calculating", "กำลังคำนวณราคา...")}</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      {/* 1. Reservation Overview Card */}
      <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>📋</span> {t("success.bookingDetails", "รายละเอียดการจอง")}
        </Typography>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">Check-in</Typography>
            <Typography variant="body2" fontWeight={600} color="#0b538eff">
              {FormatDate(checkinDate, 4)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">Check-out</Typography>
            <Typography variant="body2" fontWeight={600} color="#0b538eff">
              {FormatDate(checkoutDate, 4)}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">{t("success.nightsLabel", "ระยะเวลา")}</Typography>
            <Typography variant="body2" fontWeight={600} color="#1e293b">
              {t("confirmation.totalNights", { nights })}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">{t("member.guestsTitle", "ผู้เข้าพัก")}</Typography>
            <Typography variant="body2" fontWeight={600} color="#1e293b">
              {t("success.peopleCount", { count: guestNumber })}
              {childrenNumber ? ` + ${t("success.childLabel")} ${t("success.peopleCount", { count: childrenNumber })}` : ''}
            </Typography>
          </Grid>

          <Grid size={12}>
            <Divider sx={{ my: 0.8, borderColor: '#e2e8f0' }} />
            <Stack spacing={0.8} sx={{ mt: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">{t("dateSelection.customerName")}</Typography>
                <Typography variant="body2" fontWeight={700} color="#1e293b">{name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">{t("dateSelection.phoneNumber")}</Typography>
                <Typography variant="body2" fontWeight={700} color="#1e293b">{formatDisplayPhoneNumber(phoneNumber)}</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* 2. Payment Options Selection (Pay Full vs Pay Deposit) */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 1.5 }}>
          {t("payment.paymentChannel", "เลือกรูปแบบการชำระเงิน")}
        </Typography>

        <Grid container spacing={1.5}>
          {/* Option A: Pay Full */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              onClick={() => onIsOnlyDepositChange(false)}
              sx={{
                p: 2,
                borderRadius: 3,
                cursor: 'pointer',
                border: `2px solid ${!isOnlyDeposit ? '#B03052' : '#e2e8f0'}`,
                bgcolor: !isOnlyDeposit ? 'rgba(176, 48, 82, 0.04)' : '#fff',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#B03052' },
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color={!isOnlyDeposit ? '#B03052' : '#334155'}>
                💎 {i18n.language === 'en' ? 'Pay in Full' : 'จ่ายเต็มจำนวน'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {i18n.language === 'en' ? 'Room total + security deposit' : 'ชำระค่าห้องพักและมัดจำครบถ้วน'}
              </Typography>
            </Box>
          </Grid>

          {/* Option B: Pay Deposit Only */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              onClick={() => onIsOnlyDepositChange(true)}
              sx={{
                p: 2,
                borderRadius: 3,
                cursor: 'pointer',
                border: `2px solid ${isOnlyDeposit ? '#B03052' : '#e2e8f0'}`,
                bgcolor: isOnlyDeposit ? 'rgba(176, 48, 82, 0.04)' : '#fff',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#B03052' },
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color={isOnlyDeposit ? '#B03052' : '#334155'}>
                🏷️ {i18n.language === 'en' ? 'Deposit Only' : 'จ่ายเฉพาะมัดจำ'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {i18n.language === 'en' ? 'Pay deposit now, rest on Check-in' : 'ล็อควันด้วยมัดจำ จ่ายส่วนเหลือวันเข้าพัก'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 3. Discount Code Input */}
      <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {t("confirmation.discountCodeLabel", "รหัสส่วนลด (ถ้ามี)")}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            variant="outlined"
            onChange={(e) => handleDiscountCodeChange(e.target.value.toUpperCase())}
            value={discountCode}
            sx={{ flex: 1 }}
            slotProps={{
              input: {
                sx: { borderRadius: 2.5 },
                inputProps: {
                  maxLength: 20,
                  style: { textTransform: 'uppercase' },
                },
              },
            }}
            placeholder={t("confirmation.discountPlaceholder", "เช่น SAVE100")}
            disabled={discountValidated}
          />
          <Button
            variant="contained"
            size="medium"
            onClick={handleValidateDiscount}
            disabled={!discountCode || isValidatingDiscount || discountValidated}
            sx={{
              borderRadius: 2.5,
              height: 40,
              bgcolor: discountValidated ? '#16a34a' : '#2D336B',
              boxShadow: 'none',
              fontWeight: 600,
            }}
          >
            {isValidatingDiscount ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : discountValidated ? t("confirmation.codeApplied", "ใช้แล้ว") : t("confirmation.applyCode", "ใช้โค้ด")}
          </Button>
        </Stack>

        {discountError && (
          <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block', fontWeight: 500 }}>
            {discountError}
          </Typography>
        )}
        {discountData && (
          <Box sx={{ mt: 1.5, p: 1.2, borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600, display: 'block' }}>
              ✓ {t("confirmation.discountLabel", "ส่วนลด")}: -{discountAmount.toLocaleString('th-TH')} {t("success.thb")}
              {Number(discountData.discountPercentage) > 0 && ` (${discountData.discountPercentage}%)`}
            </Typography>
          </Box>
        )}
      </Box>

      {/* 4. Price Breakdown Summary */}
      <Box sx={{ p: 2.5, bgcolor: '#fff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 2 }}>
          {t("confirmation.summary", "สรุปราคา")}
        </Typography>

        <Stack spacing={1.2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">{t("confirmation.roomCharge", { nights })}</Typography>
            <Typography variant="body2" fontWeight={600}>{totalRoomPrice.toLocaleString()} {t("success.thb")}</Typography>
          </Box>

          {!!additionGuestNumber && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">{t("confirmation.extraBedCharge", { count: additionGuestNumber })}</Typography>
              <Typography variant="body2" fontWeight={600}>
                {((additionGuestNumber || 0) * additionGuestNumberPrice).toLocaleString()} {t("success.thb")}
              </Typography>
            </Box>
          )}

          {!!additionTowel && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">{t("confirmation.extraTowelCharge", { count: additionTowel })}</Typography>
              <Typography variant="body2" fontWeight={600}>
                {((additionTowel || 0) * additionTowelPrice).toLocaleString()} {t("success.thb")}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {t("confirmation.depositCharge", { nights })}
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{t("confirmation.depositRefundable", " (คืนหลัง Check-out)")}</span>
            </Typography>
            <Typography variant="body2" fontWeight={600}>{actualDeposit.toLocaleString()} {t("success.thb")}</Typography>
          </Box>

          {discountAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600 }}>{t("confirmation.discountLabel", "ส่วนลด")}</Typography>
              <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 700 }}>
                -{discountAmount.toLocaleString()} {t("success.thb")}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          {/* Amount Due Calculation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
              {isOnlyDeposit ? t("confirmation.depositAmount", "ยอดชำระตอนนี้ (มัดจำ)") : t("confirmation.totalAmount", "ยอดรวมทั้งสิ้น")}
            </Typography>
            <Typography variant="h6" fontWeight={800} color="#15a13aff" sx={{ fontSize: { xs: '1.25rem', sm: '1.35rem' } }}>
              {(isOnlyDeposit ? actualDeposit : totalPrice).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
            </Typography>
          </Box>

          {isOnlyDeposit && (
            <Paper
              variant="outlined"
              sx={{
                bgcolor: '#fffbeb',
                py: 1.2,
                px: { xs: 1.5, sm: 2 },
                borderRadius: 2.5,
                borderColor: '#fde68a',
                mt: 0.5,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="#b45309"
                  sx={{ fontSize: { xs: '0.82rem', sm: '0.88rem' }, pr: 1 }}
                >
                  {t("confirmation.remainingAmount", "ยอดค้างชำระ (จ่ายตอน Check-in)")}
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="#b45309"
                  sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' }, whiteSpace: 'nowrap' }}
                >
                  {(totalPrice - actualDeposit).toLocaleString('th-TH')} {t("success.thb")}
                </Typography>
              </Box>
            </Paper>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

export default ConfirmationStep;
