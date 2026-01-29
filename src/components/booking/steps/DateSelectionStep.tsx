import { TextField } from '@mui/material';
import CustomDatePicker from '@components/booking/CustomDatePicker';
import NumberField from '@components/booking/NumberField';
import { addDays } from 'date-fns';
import { isValidThaiPhoneNumber } from '@utils/input';

interface DateSelectionStepProps {
  checkinDate: Date | null;
  checkoutDate: Date | null;
  guestNumber: number | null;
  childrenNumber: number | null;
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
  maxChildren: number;
  maxExtraBeds: number;
  maxTowels: number;
  onCheckinChange: (date: Date | null) => void;
  onCheckoutChange: (date: Date | null) => void;
  onGuestNumberChange: (value: number | null) => void;
  onChildrenNumberChange: (value: number | null) => void;
  onAdditionGuestNumberChange: (value: number | null) => void;
  onAdditionTowelChange: (value: number | null) => void;
  onNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string, isInvalid: boolean) => void;
}

function DateSelectionStep({
  checkinDate,
  checkoutDate,
  guestNumber,
  childrenNumber,
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
  maxChildren,
  maxExtraBeds,
  maxTowels,
  onCheckinChange,
  onCheckoutChange,
  onGuestNumberChange,
  onChildrenNumberChange,
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
        maximumMonth={4}
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
        label="จำนวนผู้ใหญ่"
        onChange={(e) => {
          const num = parseInt(e.target.value);
          const maxTotal = maxGuests + maxExtraBeds;
          if (num <= 0) {
            onGuestNumberChange(1);
            onAdditionGuestNumberChange(null);
            return;
          }
          if (num > maxTotal) {
            onGuestNumberChange(maxTotal);
            onAdditionGuestNumberChange(maxExtraBeds);
            return;
          }
          onGuestNumberChange(num);
          if (num > maxGuests) {
            const minBeds = num - maxGuests;
            onAdditionGuestNumberChange(minBeds);
          } else {
            onAdditionGuestNumberChange(null);
          }
        }}
        value={guestNumber}
        sx={{ width: '100%' }}
      />
      <NumberField
        label="จำนวนเด็ก (ต่ำกว่า 8 ขวบ)"
        onChange={(e) => {
          const num = parseInt(e.target.value);
          if (num < 0) {
            onChildrenNumberChange(0);
            return;
          }
          if (num > maxChildren) {
            onChildrenNumberChange(maxChildren);
            return;
          }
          onChildrenNumberChange(num);
        }}
        value={childrenNumber}
        sx={{ width: '100%' }}
      />
      <NumberField
        label={`ที่นอนเสริม (ชุดละ ${additionGuestNumberPrice} บาท)`}
        onChange={(e) => {
          const num = parseInt(e.target.value);
          const minBeds = guestNumber && guestNumber > maxGuests ? guestNumber - maxGuests : 0;
          if (num < minBeds) {
            onAdditionGuestNumberChange(minBeds);
            return;
          }
          if (num > maxExtraBeds) {
            onAdditionGuestNumberChange(maxExtraBeds);
            return;
          }
          onAdditionGuestNumberChange(num);
        }}
        onBlur={() => {
          const minBeds = guestNumber && guestNumber > maxGuests ? guestNumber - maxGuests : 0;
          if (!additionGuestNumber) {
            onAdditionGuestNumberChange(minBeds);
          }
        }}
        value={additionGuestNumber}
        disabled={!guestNumber || guestNumber <= maxGuests}
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
