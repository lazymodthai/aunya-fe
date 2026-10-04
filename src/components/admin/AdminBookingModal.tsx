import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Payments as PaymentsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { addDays, format, differenceInCalendarDays } from 'date-fns';
import BookingAPI, { BookingPayload } from '@apis/booking';
import PricesAPI from '@apis/prices';
import { BookingStatus } from '@constants/booking.enum';
import CustomDatePicker from '@components/booking/CustomDatePicker';
import { parseLocalDate } from '@utils/date';
import {
  DEFAULT_EXTRA_BED_PRICE,
  DEFAULT_TOWEL_PRICE,
  DEFAULT_MAX_GUESTS,
  DEFAULT_MAX_CHILDREN,
  DEFAULT_EXTRA_BED_COUNT,
  DEFAULT_TOWEL_COUNT,
  ROOM_ID,
} from '@configs/app-settings';

interface AdminBookingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string | null;
  showNoti: (type: 'success' | 'error', message: string) => void;
}

export const AdminBookingModal: React.FC<AdminBookingModalProps> = ({
  open,
  onClose,
  onSuccess,
  initialDate,
  showNoti,
}) => {
  const [checkinDate, setCheckinDate] = useState<Date | null>(null);
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(null);
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [guestNumber, setGuestNumber] = useState<number>(2);
  const [childrenNumber, setChildrenNumber] = useState<number>(0);
  const [additionGuestNumber, setAdditionGuestNumber] = useState<number>(0);
  const [additionTowel, setAdditionTowel] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [status, setStatus] = useState<BookingStatus>(BookingStatus.CONFIRMED);
  const [isOnlyDeposit, setIsOnlyDeposit] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(2000);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [remark, setRemark] = useState<string>('บันทึกการจองนอกระบบ / ย้อนหลัง');

  const [isCustomPrice, setIsCustomPrice] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Initialize form state when opened
  useEffect(() => {
    if (open) {
      const today = new Date();
      let start: Date;
      if (initialDate) {
        start = parseLocalDate(initialDate);
      } else {
        start = today;
      }
      const end = addDays(start, 1);

      setCheckinDate(start);
      setCheckoutDate(end);
      setName('');
      setPhoneNumber('');
      setGuestNumber(2);
      setChildrenNumber(0);
      setAdditionGuestNumber(0);
      setAdditionTowel(0);
      setDiscount(0);
      setIsOnlyDeposit(false);
      setDepositAmount(2000);
      setIsCustomPrice(false);

      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      if (end < todayMidnight) {
        setStatus(BookingStatus.CHECKED_OUT);
        setRemark('บันทึกการจองย้อนหลัง (เข้าพักแล้ว)');
      } else {
        setStatus(BookingStatus.CONFIRMED);
        setRemark('บันทึกการจองนอกระบบ');
      }
    }
  }, [open, initialDate]);

  // Calculate nights
  const nights = useMemo(() => {
    if (checkinDate && checkoutDate && checkoutDate > checkinDate) {
      return differenceInCalendarDays(checkoutDate, checkinDate);
    }
    return 0;
  }, [checkinDate, checkoutDate]);

  // Check if booking is in the past
  const isPastBooking = useMemo(() => {
    if (!checkoutDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkoutDate < today;
  }, [checkoutDate]);

  // Auto calculate price from backend when dates, beds, towels or discount change
  useEffect(() => {
    if (!open || !checkinDate || !checkoutDate || checkoutDate <= checkinDate) return;

    let isMounted = true;
    const calculatePrice = async () => {
      setIsCalculating(true);
      try {
        const { data } = await PricesAPI.priceCalculate({
          roomId: ROOM_ID,
          checkinDate: format(checkinDate, 'yyyy-MM-dd'),
          checkoutDate: format(checkoutDate, 'yyyy-MM-dd'),
        });

        if (isMounted) {
          const roomPrice = Number(data.totalPrice) || (nights * 2000);
          const addBedPrice = (additionGuestNumber || 0) * DEFAULT_EXTRA_BED_PRICE;
          const addTowelPrice = (additionTowel || 0) * DEFAULT_TOWEL_PRICE;
          const calculatedTotal = Math.max(0, roomPrice + addBedPrice + addTowelPrice - (discount || 0));

          if (!isCustomPrice) {
            setTotalPrice(calculatedTotal);
            if (!isOnlyDeposit) {
              setPaidAmount(calculatedTotal);
              setRemainingAmount(0);
            } else {
              setPaidAmount(depositAmount);
              setRemainingAmount(Math.max(0, calculatedTotal - depositAmount));
            }
          }
        }
      } catch (err) {
        console.error('Error calculating price:', err);
        if (isMounted && !isCustomPrice) {
          const fallback = nights * 2000 + (additionGuestNumber || 0) * DEFAULT_EXTRA_BED_PRICE + (additionTowel || 0) * DEFAULT_TOWEL_PRICE - (discount || 0);
          setTotalPrice(Math.max(0, fallback));
          if (!isOnlyDeposit) {
            setPaidAmount(Math.max(0, fallback));
            setRemainingAmount(0);
          }
        }
      } finally {
        if (isMounted) {
          setIsCalculating(false);
        }
      }
    };

    calculatePrice();

    return () => {
      isMounted = false;
    };
  }, [checkinDate, checkoutDate, additionGuestNumber, additionTowel, discount, isCustomPrice, isOnlyDeposit, depositAmount, open, nights]);

  // Keep paid & remaining amount in sync when totalPrice or isOnlyDeposit changes
  const handleTotalPriceChange = (newTotal: number) => {
    setIsCustomPrice(true);
    setTotalPrice(newTotal);
    if (!isOnlyDeposit) {
      setPaidAmount(newTotal);
      setRemainingAmount(0);
    } else {
      setRemainingAmount(Math.max(0, newTotal - paidAmount));
    }
  };

  const handlePaidAmountChange = (newPaid: number) => {
    setPaidAmount(newPaid);
    setRemainingAmount(Math.max(0, totalPrice - newPaid));
  };

  const handleIsOnlyDepositChange = (checked: boolean) => {
    setIsOnlyDeposit(checked);
    if (checked) {
      setPaidAmount(depositAmount);
      setRemainingAmount(Math.max(0, totalPrice - depositAmount));
    } else {
      setPaidAmount(totalPrice);
      setRemainingAmount(0);
    }
  };

  const handleSubmit = async () => {
    if (!checkinDate || !checkoutDate || checkoutDate <= checkinDate) {
      showNoti('error', 'กรุณาระบุวัน Check-in และ Check-out ให้ถูกต้อง');
      return;
    }
    if (!name.trim()) {
      showNoti('error', 'กรุณาระบุชื่อผู้จอง');
      return;
    }
    if (!phoneNumber.trim()) {
      showNoti('error', 'กรุณาระบุเบอร์โทรศัพท์');
      return;
    }

    const payload: BookingPayload = {
      checkinDate: format(checkinDate, 'yyyy-MM-dd'),
      checkoutDate: format(checkoutDate, 'yyyy-MM-dd'),
      guestNumber: guestNumber || 1,
      childrenNumber: childrenNumber || 0,
      additionGuestNumber: additionGuestNumber || 0,
      additionTowel: additionTowel || 0,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      totalPrice: Number(totalPrice),
      roomId: ROOM_ID,
      discount: Number(discount) || 0,
      isOnlyDeposit: isOnlyDeposit,
      depositAmount: Number(depositAmount) || 0,
      paidAmount: Number(paidAmount),
      remainingAmount: Number(remainingAmount),
      remark: remark.trim() || undefined,
      status: status,
    };

    setIsSubmitting(true);
    try {
      await BookingAPI.adminBook(payload);
      showNoti('success', 'บันทึกการจองสำเร็จ');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving booking:', error);
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        'เกิดข้อผิดพลาดในการบันทึกการจอง';
      showNoti('error', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, color: '#1e293b' }}>
              บันทึกการจอง (รวมจองย้อนหลัง)
            </Typography>
            {isPastBooking && (
              <Chip
                icon={<HistoryIcon sx={{ fontSize: 16 }} />}
                label="ย้อนหลัง"
                size="small"
                color="secondary"
                sx={{ fontWeight: 600, height: 24 }}
              />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            สำหรับบันทึกการจองที่ผ่านมาแล้ว หรือการจองที่ติดต่อเข้ามานอกระบบ
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
        <Stack spacing={2.5}>
          {/* Section 1: Dates Selection */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8fafc', borderColor: '#e2e8f0' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <EventNoteIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
                วันที่เข้าพัก
              </Typography>
              {nights > 0 && (
                <Chip
                  label={`${nights} คืน`}
                  size="small"
                  color="primary"
                  sx={{ height: 22, fontSize: '0.75rem', fontWeight: 700, ml: 'auto' }}
                />
              )}
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomDatePicker
                  label="วัน Check-in"
                  value={checkinDate}
                  onChange={(date: Date | null) => {
                    setCheckinDate(date);
                    if (date && (!checkoutDate || checkoutDate <= date)) {
                      setCheckoutDate(addDays(date, 1));
                    }
                  }}
                  disablePast={false}
                  size="small"
                  sx={{ width: '100%', bgcolor: '#ffffff', borderRadius: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomDatePicker
                  label="วัน Check-out"
                  value={checkoutDate}
                  onChange={(date: Date | null) => setCheckoutDate(date)}
                  minDate={checkinDate ? addDays(checkinDate, 1) : null}
                  checkInDate={checkinDate}
                  disablePast={false}
                  size="small"
                  sx={{ width: '100%', bgcolor: '#ffffff', borderRadius: 2 }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 2: Customer Details */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <PersonIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
                ข้อมูลผู้จอง
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="ชื่อ-นามสกุล ผู้จอง"
                  fullWidth
                  size="small"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="เบอร์โทรศัพท์"
                  fullWidth
                  size="small"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="เช่น 0812345678"
                />
              </Grid>
            </Grid>

            {/* Guest Counts */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="ผู้ใหญ่ (คน)"
                  type="number"
                  fullWidth
                  size="small"
                  value={guestNumber || ''}
                  onChange={(e) => setGuestNumber(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, max: DEFAULT_MAX_GUESTS }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="เด็ก (คน)"
                  type="number"
                  fullWidth
                  size="small"
                  value={childrenNumber || ''}
                  onChange={(e) => setChildrenNumber(Math.max(0, parseInt(e.target.value) || 0))}
                  inputProps={{ min: 0, max: DEFAULT_MAX_CHILDREN }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="เตียงเสริม (ชุด)"
                  type="number"
                  fullWidth
                  size="small"
                  value={additionGuestNumber || ''}
                  onChange={(e) => setAdditionGuestNumber(Math.max(0, parseInt(e.target.value) || 0))}
                  inputProps={{ min: 0, max: DEFAULT_EXTRA_BED_COUNT }}
                  helperText={`+฿${DEFAULT_EXTRA_BED_PRICE}/ชุด`}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="ผ้าเช็ดตัวเพิ่ม (ผืน)"
                  type="number"
                  fullWidth
                  size="small"
                  value={additionTowel || ''}
                  onChange={(e) => setAdditionTowel(Math.max(0, parseInt(e.target.value) || 0))}
                  inputProps={{ min: 0, max: DEFAULT_TOWEL_COUNT }}
                  helperText={`+฿${DEFAULT_TOWEL_PRICE}/ผืน`}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 3: Status & Pricing */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <PaymentsIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
                สถานะและการชำระเงิน
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="admin-booking-status-label">สถานะการจอง</InputLabel>
                  <Select
                    labelId="admin-booking-status-label"
                    value={status}
                    label="สถานะการจอง"
                    onChange={(e) => setStatus(e.target.value as BookingStatus)}
                  >
                    <MenuItem value={BookingStatus.CONFIRMED}>✅ ยืนยันแล้ว (Confirmed)</MenuItem>
                    <MenuItem value={BookingStatus.CHECKED_OUT}>🚪 เช็คเอาท์แล้ว (CheckedOut)</MenuItem>
                    <MenuItem value={BookingStatus.CHECKED_IN}>🏨 เข้าพักอยู่ (CheckedIn)</MenuItem>
                    <MenuItem value={BookingStatus.PENDING}>⏳ รอยืนยัน (Pending)</MenuItem>
                    <MenuItem value={BookingStatus.PAYMENT}>💳 รอชำระเงิน (Payment)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="ราคารวมทั้งสิ้น (บาท)"
                  type="number"
                  fullWidth
                  size="small"
                  value={totalPrice}
                  onChange={(e) => handleTotalPriceChange(Math.max(0, Number(e.target.value) || 0))}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">฿</InputAdornment>,
                      endAdornment: isCalculating ? (
                        <InputAdornment position="end">
                          <CircularProgress size={16} />
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                  helperText={isCustomPrice ? 'กำหนดราคาเอง (Manual Price)' : 'คำนวณราคาอัตโนมัติตามปฏิทิน'}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="ส่วนลด (บาท)"
                  type="number"
                  fullWidth
                  size="small"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">฿</InputAdornment>,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isOnlyDeposit}
                      onChange={(e) => handleIsOnlyDepositChange(e.target.checked)}
                      color="warning"
                    />
                  }
                  label="จ่ายเฉพาะมัดจำ"
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="จำนวนเงินที่ชำระแล้ว (บาท)"
                  type="number"
                  fullWidth
                  size="small"
                  value={paidAmount}
                  onChange={(e) => handlePaidAmountChange(Math.max(0, Number(e.target.value) || 0))}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">฿</InputAdornment>,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="ยอดค้างชำระ (บาท)"
                  type="number"
                  fullWidth
                  size="small"
                  disabled
                  value={remainingAmount}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">฿</InputAdornment>,
                    },
                  }}
                  sx={{ bgcolor: '#f8fafc' }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="หมายเหตุ"
                  fullWidth
                  size="small"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="เช่น จองผ่าน Facebook ย้อนหลัง หรือข้อมูลการโอน"
                />
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ pt: 1.5, pb: 2, px: { xs: 2, sm: 3 } }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting || !name.trim() || !phoneNumber.trim()}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการจอง'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
