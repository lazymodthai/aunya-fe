import { Box, Divider, Typography } from '@mui/material';
import { formatAccountNumber } from '@utils/input';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QRPayment from '@components/booking/QRPayment';
import { useClipboard } from 'use-clipboard-copy';
import { useState } from 'react';

interface PaymentStepProps {
  totalRoomPrice: number;
  additionGuestNumber: number | null;
  additionTowel: number | null;
  additionGuestNumberPrice: number;
  additionTowelPrice: number;
  depositPrice: number;
  discountAmount: number;
  totalPrice: number;
  QRcode: string;
  QRname: string;
  bankName: string;
  bankAccount: string;
}

function PaymentStep({
  totalRoomPrice,
  additionGuestNumber,
  additionTowel,
  additionGuestNumberPrice,
  additionTowelPrice,
  depositPrice,
  discountAmount,
  totalPrice,
  QRcode,
  QRname,
  bankName,
  bankAccount,
}: PaymentStepProps) {
  const [copying, setCopying] = useState(false);
  const clipboard = useClipboard();

  const handleCopy = async () => {
    clipboard.copy(bankAccount);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

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

      {/* Discount */}
      {discountAmount > 0 && (
        <Typography sx={{ color: '#15a13aff', fontWeight: 600 }}>
          ส่วนลด: -{discountAmount.toLocaleString('th-TH')} บาท
        </Typography>
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
