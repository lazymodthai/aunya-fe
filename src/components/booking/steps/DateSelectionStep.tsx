import { TextField } from '@mui/material';
import CustomDatePicker from '@components/booking/CustomDatePicker';
import NumberField from '@components/booking/NumberField';
import { addDays } from 'date-fns';
import { isValidThaiPhoneNumber } from '@utils/input';

interface DateSelectionStepProps {
  checkinDate: Date | null;
  checkoutDate: Date | null;
  guestNumber: number | null;
  additionGuestNumber: number | null;
  additionTowel: number | null;
  name: string;
  phoneNumber: string;
  disabledDateRange?: any[];
  disabledDates?: any[];
  isInvalidPhoneNumber: boolean;
  hasUserData: boolean;
  additionGuestNumberPrice: number;
  additionTowelPrice: number;
  maxGuests: number;
  maxExtraBeds: number;
  maxTowels: number;
  onCheckinChange: (date: Date | null) => void;
  onCheckoutChange: (date: Date | null) => void;
  onGuestNumberChange: (value: number | null) => void;
  onAdditionGuestNumberChange: (value: number | null) => void;
  onAdditionTowelChange: (value: number | null) => void;
  onNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string, isInvalid: boolean) => void;
}

function DateSelectionStep({
  checkinDate,
  checkoutDate,
  guestNumber,
  additionGuestNumber,
  additionTowel,
  name,
  phoneNumber,
  disabledDateRange,
  disabledDates,
  isInvalidPhoneNumber,
  hasUserData,
  additionGuestNumberPrice,
  additionTowelPrice,
  maxGuests,
  maxExtraBeds,
  maxTowels,
  onCheckinChange,
  onCheckoutChange,
  onGuestNumberChange,
  onAdditionGuestNumberChange,
  onAdditionTowelChange,
  onNameChange,
  onPhoneNumberChange,
}: DateSelectionStepProps) {
  return (
    <>
      <CustomDatePicker
        label="เลือกวันที่ Check-in"
        onChange={(e) => {
          onCheckinChange(e);
          onCheckoutChange(null);
        }}
        value={checkinDate}
        sx={{ width: '100%' }}
        // disabledDateRange={disabledDateRange}
        disabledDates={disabledDates}
        maximumMonth={3}
      />
      <CustomDatePicker
        label="เลือกวันที่ Check-out"
        onChange={(e) => onCheckoutChange(e)}
        value={checkoutDate}
        sx={{ width: '100%' }}
        minDate={addDays(checkinDate || new Date(), 1)}
        checkInDate={checkinDate}
        // disabledDateRange={disabledDateRange}
        disabledDates={disabledDates}
      />
      <NumberField
        label="จำนวนผู้เข้าพัก"
        onChange={(e) => {
          const num = parseInt(e.target.value);
          if (num <= 0) {
            onGuestNumberChange(1);
            return;
          }
          if (num > maxGuests) {
            onGuestNumberChange(maxGuests);
            return;
          } else {
            onGuestNumberChange(num);
            onAdditionGuestNumberChange(null);
          }
        }}
        value={guestNumber}
        sx={{ width: '100%' }}
      />
      <NumberField
        label={`ที่นอนเสริม (ชุดละ ${additionGuestNumberPrice} บาท)`}
        onChange={(e) => {
          const num = parseInt(e.target.value);
          if (num > maxExtraBeds) {
            onAdditionGuestNumberChange(maxExtraBeds);
            return;
          } else {
            onAdditionGuestNumberChange(num);
          }
        }}
        value={additionGuestNumber}
        disabled={!guestNumber || guestNumber < maxGuests}
        sx={{ width: '100%' }}
      />
      <NumberField
        label={`เพิ่มผ้าขนหนู+ผ้าเช็ดผม (ชุดละ ${additionTowelPrice} บาท)`}
        onChange={(e) => {
          const num = parseInt(e.target.value);
          if (num > maxTowels) {
            onAdditionTowelChange(maxTowels);
            return;
          } else {
            onAdditionTowelChange(num);
          }
        }}
        value={additionTowel}
        sx={{ width: '100%' }}
      />
      <TextField
        label="ชื่อผู้จอง"
        variant="outlined"
        onChange={(e) => onNameChange(e.target.value)}
        value={name}
        slotProps={{
          input: {
            inputProps: {
              maxLength: 50,
            },
          },
        }}
        sx={{ width: '100%' }}
        disabled={hasUserData}
      />
      <TextField
        label="เบอร์โทรศัพท์มือถือ"
        variant="outlined"
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '');
          const isInvalid = hasUserData ? false : !isValidThaiPhoneNumber(value);
          onPhoneNumberChange(value, isInvalid);
        }}
        value={phoneNumber}
        sx={{ width: '100%' }}
        slotProps={{
          input: {
            inputProps: {
              maxLength: 10,
              pattern: '[0-9]*',
              inputMode: 'numeric',
            },
          },
        }}
        error={isInvalidPhoneNumber}
        helperText={isInvalidPhoneNumber ? 'เบอร์โทรศัพท์ไม่ถูกต้อง' : ''}
        disabled={hasUserData}
      />
    </>
  );
}

export default DateSelectionStep;
