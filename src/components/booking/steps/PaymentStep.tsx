import { Box, Divider, Typography, TextField, Button, Chip, Stack, CircularProgress } from '@mui/material';
import { formatAccountNumber } from '@utils/input';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QRPayment from '@components/booking/QRPayment';
import { useClipboard } from 'use-clipboard-copy';
import { useState, useEffect } from 'react';
import PricesAPI, { DiscountCode, PriceDetail } from '@apis/prices';
import { format } from 'date-fns';

interface PaymentStepProps {
  checkinDate: Date;
  checkoutDate: Date;
  additionGuestNumber: number | null;
  additionTowel: number | null;
  additionGuestNumberPrice: number;
  additionTowelPrice: number;
  depositPrice: number;
  discountCode: string;
  roomId: string;
  QRcode: string;
  QRname: string;
  bankName: string;
  bankAccount: string;
  onPriceCalculated: (totalPrice: number, roomPrices: PriceDetail[], discount: number, discountType: 'amount' | 'percentage' | null) => void;
  onDiscountCodeValidated: (isValid: boolean, discountData: DiscountCode | null) => void;
}

function PaymentStep({
  checkinDate,
  checkoutDate,
  additionGuestNumber,
  additionTowel,
  additionGuestNumberPrice,
  additionTowelPrice,
  depositPrice,
  discountCode,
  roomId,
  QRcode,
  QRname,
  bankName,
  bankAccount,
  onPriceCalculated,
  onDiscountCodeValidated,
}: PaymentStepProps) {
  const [copying, setCopying] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);
  const [roomPrices, setRoomPrices] = useState<PriceDetail[]>([]);
  const [totalRoomPrice, setTotalRoomPrice] = useState(0);
  const [discountData, setDiscountData] = useState<DiscountCode | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountApplied, setDiscountApplied] = useState(false);

  const clipboard = useClipboard();

  // Calculate room price from API
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
      } catch (error) {
        console.error('Error calculating price:', error);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    calculatePrice();
  }, [checkinDate, checkoutDate, roomId]);

  // Validate discount code if provided
  useEffect(() => {
    const validateDiscount = async () => {
      if (!discountCode || discountApplied) return;

      setIsLoadingDiscount(true);
      setDiscountError(null);
      try {
        const { data } = await PricesAPI.getDiscountDataByCode(discountCode);
        if (data.usedAt) {
          setDiscountError('โค้ดนี้ถูกใช้แล้ว');
          setDiscountData(null);
          onDiscountCodeValidated(false, null);
        } else {
          setDiscountData(data);
          setDiscountApplied(true);
          onDiscountCodeValidated(true, data);
        }
      } catch (error: any) {
        setDiscountError('ไม่พบโค้ดส่วนลดนี้');
        setDiscountData(null);
        onDiscountCodeValidated(false, null);
      } finally {
        setIsLoadingDiscount(false);
      }
    };

    if (discountCode && !discountApplied) {
      validateDiscount();
    }
  }, [discountCode]);

  // Calculate total price with discount
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

  // Notify parent of calculated price
  useEffect(() => {
    if (!isLoadingPrice) {
      const discountType = discountData
        ? Number(discountData.discount) > 0
          ? 'amount'
          : Number(discountData.discountPercentage) > 0
            ? 'percentage'
            : null
        : null;
      onPriceCalculated(totalPrice, roomPrices, discountAmount, discountType);
    }
  }, [totalRoomPrice, discountData, isLoadingPrice]);

  const handleCopy = async () => {
    clipboard.copy(bankAccount);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
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
      <Typography sx={{ fontSize: 18, fontWeight: 600 }}>ยอดชำระของท่าน</Typography>

      <Typography>
        ค่าห้องพัก {totalRoomPrice.toLocaleString('th-TH')} บาท
      </Typography>
      <Typography>
        {`เสริมที่นอน ${((additionGuestNumber || 0) * additionGuestNumberPrice).toLocaleString('th-TH')} บาท`}
      </Typography>
      <Typography>
        {`เซ็ตผ้าขนหนู+ผ้าเช็ดผม(เพิ่มเติม) ${((additionTowel || 0) * additionTowelPrice).toLocaleString('th-TH')} บาท`}
      </Typography>
      <Typography>
        {`ค่ามัดจำ ${depositPrice.toLocaleString('th-TH')} บาท `}
        <span style={{ color: '#939393ff' }}>(คืนหลัง Check-out)</span>
      </Typography>

      {/* Discount Section */}
      {discountCode && (
        <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: discountData ? '#e8f5e9' : '#fff3e0' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ fontWeight: 500 }}>โค้ดส่วนลด: {discountCode}</Typography>
            {isLoadingDiscount ? (
              <CircularProgress size={16} />
            ) : discountData ? (
              <Chip label="ใช้ได้" color="success" size="small" />
            ) : discountError ? (
              <Chip label={discountError} color="warning" size="small" />
            ) : null}
          </Stack>
          {discountData && (
            <Typography sx={{ color: '#15a13aff', fontWeight: 600, mt: 0.5 }}>
              ส่วนลด: -{discountAmount.toLocaleString('th-TH')} บาท
              {Number(discountData.discountPercentage) > 0 && ` (${discountData.discountPercentage}%)`}
            </Typography>
          )}
        </Box>
      )}

      <Typography sx={{ fontSize: 18, fontWeight: 600 }}>{`รวมยอดชำระทั้งสิ้น:`}</Typography>
      <Typography sx={{ fontSize: 24, fontWeight: 600, color: '#15a13aff', mt: -2 }}>
        {totalPrice.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB',
        })}
      </Typography>
      <Divider />
      <Typography sx={{ fontSize: 18, fontWeight: 600 }}>ช่องทางชำระเงิน:</Typography>
      <Typography sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
        ธนาคาร:{' '}
        <Box
          component={'img'}
          src={
            'https://e7.pngegg.com/pngimages/591/354/png-clipart-krung-thai-bank-money-credit-kasikornbank-bank-blue-text-thumbnail.png'
          }
          sx={{ width: 24 }}
        />
        <span style={{ fontWeight: 600, color: '#00A3E3' }}>{bankName}</span>
      </Typography>
      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        ชื่อบัญชี: <span style={{ fontWeight: 600, color: '#00A3E3' }}>{QRname}</span>
      </Typography>
      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        หมายเลขบัญชี:{' '}
        <span style={{ fontWeight: 600, color: '#00A3E3' }}>{formatAccountNumber(bankAccount)}</span>
        <Box
          onClick={handleCopy}
          sx={{
            cursor: 'pointer',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
          display={'flex'}
          gap={1}
          alignItems={'center'}
          border={`1px solid ${copying ? '#077537ff' : '#7d7d7dff'}`}
          borderRadius={2}
          p={0.5}
          fontSize={12}
          color={copying ? '#077537ff' : '#7d7d7dff'}
        >
          {copying ? (
            <CheckCircleIcon sx={{ width: 18, height: 18, color: '#077537ff' }} />
          ) : (
            <ContentCopyIcon sx={{ width: 18, height: 18, color: '#7d7d7dff' }} />
          )}
          {copying ? `คัดลอกแล้ว` : `คัดลอก`}
        </Box>
      </Typography>
      <Typography sx={{ fontSize: 18, fontWeight: 600 }}>หรือโอนผ่าน QR Payment:</Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          justifyContent: 'center',
          alignItems: 'center',
          mt: 1,
          p: 2,
          borderRadius: 2,
          border: '1px solid #08080809',
        }}
      >
        <QRPayment qrId={QRcode} value={totalPrice} />
        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
          {QRcode.slice(0, 0) + 'x-xxxx-xxxx' + QRcode.slice(9).replace(/(\d)(\d{2})(\d)/, '$1-$2-$3')}
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{QRname}</Typography>
      </Box>
    </>
  );
}

export default PaymentStep;
