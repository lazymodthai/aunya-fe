import { Divider, TextField, Typography } from '@mui/material';
import { FormatDate } from '@utils/date';

interface ConfirmationStepProps {
  checkinDate: Date;
  checkoutDate: Date;
  totalDate: number;
  guestNumber: number;
  additionGuestNumber: number | null;
  additionTowel: number | null;
  name: string;
  phoneNumber: string;
  discountCode: string;
  onDiscountCodeChange: (value: string) => void;
}

function ConfirmationStep({
  checkinDate,
  checkoutDate,
  totalDate,
  guestNumber,
  additionGuestNumber,
  additionTowel,
  name,
  phoneNumber,
  discountCode,
  onDiscountCodeChange,
}: ConfirmationStepProps) {
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
        <span style={{ color: '#0b538eff' }}>{`${totalDate} `} คืน</span>
      </Typography>
      <Typography sx={{ display: 'flex', gap: 1 }}>
        จำนวนผู้เข้าพัก: <span style={{ color: '#0b538eff' }}>{guestNumber} คน</span>
      </Typography>
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
      <TextField
        label="รหัสส่วนลด (ถ้ามี)"
        variant="outlined"
        onChange={(e) => onDiscountCodeChange(e.target.value.toUpperCase())}
        value={discountCode}
        sx={{ width: '100%' }}
        slotProps={{
          input: {
            inputProps: {
              maxLength: 20,
              style: { textTransform: 'uppercase' },
            },
          },
        }}
        placeholder="เช่น SAVE100"
      />
    </>
  );
}

export default ConfirmationStep;
