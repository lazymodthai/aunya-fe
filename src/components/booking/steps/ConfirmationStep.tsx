import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormatDate } from '@utils/date';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import PricesAPI, { DiscountCode, PriceDetail } from '@apis/prices';

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
    nights: number
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
  const totalPrice = Math.max(0, subtotal - discountAmount + depositPrice);

  // Notify parent of calculated price whenever it changes
  useEffect(() => {
    if (!isLoadingPrice) {
      onPriceCalculated(totalPrice, roomPrices, discountAmount, discountData, nights);
    }
  }, [totalRoomPrice, discountData, isLoadingPrice, additionGuestNumber, additionTowel, nights]);

  // Validate discount code
  const handleValidateDiscount = async () => {
    if (!discountCode) return;

    setIsValidatingDiscount(true);
    setDiscountError(null);
    try {
      const { data } = await PricesAPI.getDiscountDataByCode(discountCode);
      if (data.count <= 0) {
        setDiscountError('โค้ดนี้ถูกใช้หมดแล้ว');
        setDiscountData(null);
      } else {
        setDiscountData(data);
        setDiscountValidated(true);
      }
    } catch (error: any) {
      setDiscountError('ไม่พบโค้ดส่วนลดนี้');
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
        <Typography sx={{ ml: 2 }}>กำลังคำนวณราคา...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography sx={{ display: 'flex', gap: 1 }}>
        {`Check-in: `}
        <span style={{ color: '#0b538eff' }}>วันที่ {FormatDate(checkinDate, 4)}</span>
      </Typography>
      <Typography sx={{ display: 'flex', gap: 1 }}>
        {`Check-out: `}
        <span style={{ color: '#0b538eff' }}>วันที่ {FormatDate(checkoutDate, 4)}</span>
      </Typography>
      <Typography sx={{ display: 'flex', gap: 1 }}>
        รวมเข้าพัก:
        <span style={{ color: '#0b538eff' }}>{`${nights} `} คืน</span>
      </Typography>
      <Typography sx={{ display: 'flex', gap: 1 }}>
        จำนวนผู้ใหญ่: <span style={{ color: '#0b538eff' }}>{guestNumber} คน</span>
      </Typography>
      {!!childrenNumber && (
        <Typography sx={{ display: 'flex', gap: 1 }}>
          จำนวนเด็ก: <span style={{ color: '#0b538eff' }}>{childrenNumber} คน</span>
        </Typography>
      )}
      {!!additionGuestNumber && (
        <Typography sx={{ display: 'flex', gap: 1 }}>
          ที่นอนเสริม: <span style={{ color: '#57768fff' }}>{additionGuestNumber} ชุด</span>
        </Typography>
      )}
      {!!additionTowel && (
        <Typography sx={{ display: 'flex', gap: 1 }}>
          ชุดผ้าขนหนู+ผ้าเช็ดผม(เพิ่มเติม):{' '}
          <span style={{ color: '#0b538eff' }}>{additionTowel} ชุด</span>
        </Typography>
      )}
      <Typography sx={{ display: 'flex', gap: 1 }}>
        ชื่อผู้จอง: <span style={{ color: '#0b538eff' }}>{name}</span>
      </Typography>
      <Typography sx={{ display: 'flex', gap: 1 }}>
        เบอร์โทรศัพท์มือถือ: <span style={{ color: '#0b538eff' }}>{phoneNumber}</span>
      </Typography>

      <Divider />

      {/* Price Summary */}
      <Typography sx={{ fontSize: 16, fontWeight: 600 }}>สรุปราคา</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography>ค่าห้องพัก ({nights} คืน)</Typography>
        <Typography fontWeight={500}>{totalRoomPrice.toLocaleString('th-TH')} บาท</Typography>
      </Box>
      {!!additionGuestNumber && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>ที่นอนเสริม ({additionGuestNumber} ชุด)</Typography>
          <Typography fontWeight={500}>
            {((additionGuestNumber || 0) * additionGuestNumberPrice).toLocaleString('th-TH')} บาท
          </Typography>
        </Box>
      )}
      {!!additionTowel && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>ผ้าขนหนู+ผ้าเช็ดผม ({additionTowel} ชุด)</Typography>
          <Typography fontWeight={500}>
            {((additionTowel || 0) * additionTowelPrice).toLocaleString('th-TH')} บาท
          </Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography>ค่ามัดจำ <span style={{ fontSize: 12, color: '#7d7d7dff' }}>(คืนหลัง Check-out)</span></Typography>
        <Typography fontWeight={500}>{depositPrice.toLocaleString('th-TH')} บาท</Typography>
      </Box>

      {/* Discount Code Input */}
      <Divider />
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <TextField
          label="รหัสส่วนลด (ถ้ามี)"
          variant="outlined"
          onChange={(e) => handleDiscountCodeChange(e.target.value.toUpperCase())}
          value={discountCode}
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              inputProps: {
                maxLength: 20,
                style: { textTransform: 'uppercase' },
              },
            },
          }}
          placeholder="เช่น SAVE100"
          disabled={discountValidated}
        />
        <Button
          variant="outlined"
          onClick={handleValidateDiscount}
          disabled={!discountCode || isValidatingDiscount || discountValidated}
          sx={{ height: 56 }}
        >
          {isValidatingDiscount ? <CircularProgress size={20} /> : discountValidated ? 'ใช้แล้ว' : 'ใช้โค้ด'}
        </Button>
      </Stack>

      {/* Discount Result */}
      {discountError && (
        <Chip label={discountError} color="error" size="small" />
      )}
      {discountData && (
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#e8f5e9' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ fontWeight: 500 }}>โค้ด: {discountCode}</Typography>
            <Chip label="ใช้ได้" color="success" size="small" />
          </Stack>
          <Typography sx={{ color: '#15a13aff', fontWeight: 600, mt: 0.5 }}>
            ส่วนลด: -{discountAmount.toLocaleString('th-TH')} บาท
            {Number(discountData.discountPercentage) > 0 && ` (${discountData.discountPercentage}%)`}
          </Typography>
        </Box>
      )}

      {/* Total */}
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>ยอดรวมทั้งสิ้น</Typography>
        <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#15a13aff' }}>
          {totalPrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
        </Typography>
      </Box>

      {/* Deposit Only Option */}
      <FormControlLabel
        control={
          <Checkbox
            checked={isOnlyDeposit}
            onChange={(e) => onIsOnlyDepositChange(e.target.checked)}
          />
        }
        label="จ่ายเฉพาะค่ามัดจำก่อน (จ่ายส่วนที่เหลือตอน Check-in)"
      />
      {isOnlyDeposit && (
        <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontWeight: 500 }}>ยอดชำระตอนนี้ (มัดจำ)</Typography>
            <Typography sx={{ fontWeight: 600, color: '#15a13aff' }}>
              {depositPrice.toLocaleString('th-TH')} บาท
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 500 }}>ยอดค้างชำระ (จ่ายตอน Check-in)</Typography>
            <Typography sx={{ fontWeight: 600, color: '#ed6c02' }}>
              {(totalPrice - depositPrice).toLocaleString('th-TH')} บาท
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}

export default ConfirmationStep;
