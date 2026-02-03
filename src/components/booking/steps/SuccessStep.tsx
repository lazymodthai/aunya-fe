import { Box, Button, Divider, Grid, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { FormatDate } from '@utils/date';
import { CONTACTS } from '@configs/app-settings';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

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
        จองห้องพักสำเร็จ!
      </Typography>

      <Typography sx={{ fontSize: 14, color: '#7d7d7dff' }}>
        ขอบคุณที่ใช้บริการ ระบบได้รับการชำระเงินของคุณเรียบร้อยแล้ว
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
        <Typography sx={{ fontSize: 12, color: '#7d7d7dff', mb: 0.5 }}>รหัสอ้างอิง</Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#0b538eff', letterSpacing: 2 }}>
          {refCode}
        </Typography>
      </Box>

      {/* Booking Details */}
      <Box sx={{ width: '100%', textAlign: 'left', mt: 1 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1.5 }}>รายละเอียดการจอง</Typography>

        <Grid container spacing={1}>
          <Grid size={6}>
            <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>ชื่อผู้จอง</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{name}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>เบอร์โทรศัพท์</Typography>
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
            <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>จำนวนคืน</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{totalDate} คืน</Typography>
          </Grid>
          <Grid size={6} sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>ผู้ใหญ่</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{guestNumber} คน</Typography>
          </Grid>
          {!!childrenNumber && (
            <Grid size={6} sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>เด็ก</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{childrenNumber} คน</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      <Divider sx={{ width: '100%', my: 1 }} />

      {/* Payment Summary */}
      <Box sx={{ width: '100%', textAlign: 'left' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1.5 }}>สรุปค่าใช้จ่าย</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: 14 }}>ค่าห้องพัก</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
            {totalRoomPrice.toLocaleString('th-TH')} บาท
          </Typography>
        </Box>

        {!!additionGuestNumber && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: 14 }}>ที่นอนเสริม ({additionGuestNumber} ชุด)</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
              {((additionGuestNumber || 0) * additionGuestNumberPrice).toLocaleString('th-TH')} บาท
            </Typography>
          </Box>
        )}

        {!!additionTowel && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: 14 }}>ผ้าขนหนู+ผ้าเช็ดผม ({additionTowel} ชุด)</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
              {((additionTowel || 0) * additionTowelPrice).toLocaleString('th-TH')} บาท
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: 14 }}>
            ค่ามัดจำ <span style={{ fontSize: 12, color: '#7d7d7dff' }}>(คืนหลัง Check-out)</span>
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
            {depositPrice.toLocaleString('th-TH')} บาท
          </Typography>
        </Box>

        {discountAmount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: 14, color: '#15a13aff' }}>ส่วนลด</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#15a13aff' }}>
              -{discountAmount.toLocaleString('th-TH')} บาท
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            {isOnlyDeposit ? 'ยอดชำระครั้งนี้ (มัดจำ)' : 'ยอดรวมทั้งสิ้น'}
          </Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#15a13aff' }}>
            {paidAmount.toLocaleString('th-TH', {
              style: 'currency',
              currency: 'THB',
            })}
          </Typography>
        </Box>
        {isOnlyDeposit && remainingAmount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>ยอดค้างชำระ (จ่ายตอน Check-in)</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#ed6c02' }}>
              {remainingAmount.toLocaleString('th-TH', {
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
            กรุณาชำระยอดคงเหลือในวัน Check-in
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>
            ยอดค้างชำระ {remainingAmount.toLocaleString('th-TH')} บาท จะต้องชำระให้ครบก่อนเข้าพัก
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
          📌 กรุณาเก็บรหัสอ้างอิงนี้ไว้เพื่อใช้สำหรับการติดต่อหรือสอบถามข้อมูล
          <br />
          📞 หากมีข้อสงสัย กรุณาติดต่อ: {`${CONTACTS[0].phoneDisplay} ${CONTACTS[0].name}`}
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
        {isSaving ? 'กำลังบันทึก...' : 'บันทึกภาพหลักฐาน'}
      </Button>
    </Box>
  );
}

export default SuccessStep;
