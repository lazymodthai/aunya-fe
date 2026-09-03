import { Checkbox, FormControlLabel, Link, TextField, Typography } from '@mui/material';
import CustomDatePicker from '@components/booking/CustomDatePicker';
import NumberField from '@components/booking/NumberField';
import PDPADialog from '@components/PDPADialog';
import { addDays } from 'date-fns';
import { useState } from 'react';
import { isValidThaiPhoneNumber } from '@utils/input';
import { useTranslation } from 'react-i18next';

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
  advanceBookingMonths?: number;
  acceptedPDPA: boolean;
  onCheckinChange: (date: Date | null) => void;
  onCheckoutChange: (date: Date | null) => void;
  onGuestNumberChange: (value: number | null) => void;
  onChildrenNumberChange: (value: number | null) => void;
  onAdditionGuestNumberChange: (value: number | null) => void;
  onAdditionTowelChange: (value: number | null) => void;
  onNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string, isInvalid: boolean) => void;
  onAcceptedPDPAChange: (value: boolean) => void;
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
  advanceBookingMonths,
  acceptedPDPA,
  onCheckinChange,
  onCheckoutChange,
  onGuestNumberChange,
  onChildrenNumberChange,
  onAdditionGuestNumberChange,
  onAdditionTowelChange,
  onNameChange,
  onPhoneNumberChange,
  onAcceptedPDPAChange,
}: DateSelectionStepProps) {
  const { t } = useTranslation();
  const [pdpaDialogOpen, setPdpaDialogOpen] = useState(false);

  return (
    <>
      <CustomDatePicker
        label={t("dateSelection.checkin", "เลือกวันที่ Check-in")}
        onChange={(e) => {
          onCheckinChange(e);
          onCheckoutChange(null);
        }}
        value={checkinDate}
        sx={{ width: '100%' }}
        // disabledDateRange={disabledDateRange}
        disabledDates={disabledDates}
        maximumMonth={advanceBookingMonths || 6}
      />
      <CustomDatePicker
        label={t("dateSelection.checkout", "เลือกวันที่ Check-out")}
        onChange={(e) => onCheckoutChange(e)}
        value={checkoutDate}
        sx={{ width: '100%' }}
        minDate={addDays(checkinDate || new Date(), 1)}
        checkInDate={checkinDate}
        // disabledDateRange={disabledDateRange}
        disabledDates={disabledDates}
      />
      <NumberField
        label={t("dateSelection.adults", "จำนวนผู้ใหญ่")}
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
        label={t("dateSelection.children", "จำนวนเด็ก (ต่ำกว่า 8 ขวบ)")}
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
        label={t("dateSelection.extraBed", { price: additionGuestNumberPrice })}
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
        label={t("dateSelection.extraTowel", { price: additionTowelPrice })}
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
        label={t("dateSelection.customerName", "ชื่อผู้จอง")}
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
        label={t("dateSelection.phoneNumber", "เบอร์โทรศัพท์มือถือ")}
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
        helperText={isInvalidPhoneNumber ? t("dateSelection.invalidPhone", "เบอร์โทรศัพท์ไม่ถูกต้อง") : ''}
        disabled={hasUserData}
      />

      {/* PDPA Acceptance */}
      <FormControlLabel
        control={
          <Checkbox
            checked={acceptedPDPA}
            onChange={(e) => onAcceptedPDPAChange(e.target.checked)}
          />
        }
        label={
          <Typography variant="body2">
            {t("dateSelection.acceptPdpaText", "ฉันได้อ่านและยอมรับ")}{' '}
            <Link
              component="button"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setPdpaDialogOpen(true);
              }}
              sx={{ fontWeight: 500 }}
            >
              {t("dateSelection.pdpaLink", "นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)")}
            </Link>
          </Typography>
        }
        sx={{
          alignItems: 'flex-start',
          '& .MuiCheckbox-root': { pt: 0 },
        }}
      />
      <PDPADialog open={pdpaDialogOpen} onClose={() => setPdpaDialogOpen(false)} />
    </>
  );
}

export default DateSelectionStep;
