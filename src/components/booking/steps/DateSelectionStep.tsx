import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CustomDatePicker from '@components/booking/CustomDatePicker';
import NumberField from '@components/booking/NumberField';
import PDPADialog from '@components/PDPADialog';
import { addDays } from 'date-fns';
import { useState, useEffect } from 'react';
import { COUNTRY_CODES, isValidPhoneNumber } from '@utils/input';
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
  const { t, i18n } = useTranslation();
  const [pdpaDialogOpen, setPdpaDialogOpen] = useState(false);

  // Helper to extract countryCode and localNumber from existing phoneNumber
  const parsePhone = (phone: string) => {
    if (!phone) return { code: '+66', local: '' };
    if (phone.startsWith('+')) {
      const sortedCodes = [...COUNTRY_CODES]
        .filter((c) => c.code !== '+')
        .sort((a, b) => b.code.length - a.code.length);
      const matched = sortedCodes.find((c) => phone.startsWith(c.code));
      if (matched) {
        return { code: matched.code, local: phone.slice(matched.code.length) };
      }
      return { code: '+', local: phone.slice(1) };
    }
    return { code: '+66', local: phone };
  };

  const initial = parsePhone(phoneNumber);
  const [countryCode, setCountryCode] = useState<string>(initial.code);
  const [localNumber, setLocalNumber] = useState<string>(initial.local);

  useEffect(() => {
    const parsed = parsePhone(phoneNumber);
    if (parsed.local !== localNumber || parsed.code !== countryCode) {
      setCountryCode(parsed.code);
      setLocalNumber(parsed.local);
    }
  }, [phoneNumber]);

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode);
    const isValid = isValidPhoneNumber(newCode, localNumber);
    const fullPhone = localNumber
      ? (newCode === '+66'
          ? localNumber
          : (newCode === '+' ? `+${localNumber}` : `${newCode}${localNumber.replace(/^0+/, '')}`))
      : '';
    onPhoneNumberChange(fullPhone, !isValid);
  };

  const handleLocalNumberChange = (rawVal: string) => {
    const cleaned = countryCode === '+' ? rawVal.replace(/[^\d+]/g, '') : rawVal.replace(/\D/g, '');
    setLocalNumber(cleaned);
    const isValid = isValidPhoneNumber(countryCode, cleaned);
    const fullPhone = cleaned
      ? (countryCode === '+66'
          ? cleaned
          : (countryCode === '+' ? `+${cleaned.replace(/^\+/, '')}` : `${countryCode}${cleaned.replace(/^0+/, '')}`))
      : '';
    onPhoneNumberChange(fullPhone, !isValid);
  };

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);

  const nights = checkinDate && checkoutDate ? Math.max(1, Math.round((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <Stack spacing={3}>
      {/* Section 1: Stay Dates */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>📅</span> {t("booking.steps.dates", "เลือกวันเข้าพัก")}
          {nights > 0 && (
            <Chip
              label={`${nights} ${t("success.nightsCount", { count: nights })}`}
              size="small"
              sx={{ bgcolor: 'rgba(176, 48, 82, 0.1)', color: '#B03052', fontWeight: 600, ml: 'auto' }}
            />
          )}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomDatePicker
              label={t("dateSelection.checkin", "เลือกวันที่ Check-in")}
              onChange={(e) => {
                onCheckinChange(e);
                onCheckoutChange(null);
              }}
              value={checkinDate}
              sx={{ width: '100%' }}
              disabledDates={disabledDates}
              maximumMonth={advanceBookingMonths || 6}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomDatePicker
              label={t("dateSelection.checkout", "เลือกวันที่ Check-out")}
              onChange={(e) => onCheckoutChange(e)}
              value={checkoutDate}
              sx={{ width: '100%' }}
              minDate={addDays(checkinDate || new Date(), 1)}
              checkInDate={checkinDate}
              disabledDates={disabledDates}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Section 2: Guests & Add-ons */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>👥</span> {t("member.guestsTitle", "จำนวนผู้เข้าพักและบริการเสริม")}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <NumberField
              label={t("dateSelection.adults", "จำนวนผู้ใหญ่")}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  onGuestNumberChange(null);
                  onAdditionGuestNumberChange(null);
                  return;
                }
                const num = parseInt(val, 10);
                if (isNaN(num) || num <= 0) {
                  onGuestNumberChange(1);
                  onAdditionGuestNumberChange(null);
                  return;
                }
                const maxTotal = maxGuests + maxExtraBeds;
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
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <NumberField
              label={t("dateSelection.children", "จำนวนเด็ก (ต่ำกว่า 8 ขวบ)")}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  onChildrenNumberChange(null);
                  return;
                }
                const num = parseInt(val, 10);
                if (isNaN(num) || num < 0) {
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
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <NumberField
              label={t("dateSelection.extraBed", { price: additionGuestNumberPrice })}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  onAdditionGuestNumberChange(null);
                  return;
                }
                const num = parseInt(val, 10);
                const minBeds = guestNumber && guestNumber > maxGuests ? guestNumber - maxGuests : 0;
                if (isNaN(num) || num < minBeds) {
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
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <NumberField
              label={t("dateSelection.extraTowel", { price: additionTowelPrice })}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  onAdditionTowelChange(null);
                  return;
                }
                const num = parseInt(val, 10);
                if (isNaN(num) || num <= 0) {
                  onAdditionTowelChange(null);
                  return;
                }
                if (num > maxTowels) {
                  onAdditionTowelChange(maxTowels);
                  return;
                }
                onAdditionTowelChange(num);
              }}
              value={additionTowel}
              sx={{ width: '100%' }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Section 3: Guest Information */}
      <Box>
        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>👤</span> {t("member.guestNameLabel", "ข้อมูลผู้จอง")}
        </Typography>

        <Stack spacing={2}>
          <TextField
            label={t("dateSelection.customerName", "ชื่อผู้จอง")}
            variant="outlined"
            onChange={(e) => onNameChange(e.target.value)}
            value={name}
            slotProps={{
              input: {
                sx: { borderRadius: 3 },
                inputProps: {
                  maxLength: 50,
                },
              },
            }}
            sx={{ width: '100%' }}
            disabled={hasUserData}
          />

          {/* Phone Number Field with Country Code Dropdown */}
          <Box sx={{ width: '100%', display: 'flex', gap: 1 }}>
            <FormControl sx={{ width: { xs: 105, sm: 115 }, flexShrink: 0 }} disabled={hasUserData}>
              <Select
                value={countryCode}
                onChange={(e) => handleCountryCodeChange(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 280,
                    },
                  },
                }}
                sx={{
                  borderRadius: 3,
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                    fontSize: { xs: '0.9rem', sm: '0.95rem' },
                    py: '15px',
                  },
                }}
              >
                {COUNTRY_CODES.map((c) => (
                  <MenuItem key={c.code} value={c.code} sx={{ display: 'flex', gap: 1.2, fontSize: '0.9rem', py: 1 }}>
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{c.flag}</span>
                    <span style={{ fontWeight: 600 }}>{c.code}</span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t("dateSelection.phoneNumber", "เบอร์โทรศัพท์มือถือ")}
              type="tel"
              variant="outlined"
              onChange={(e) => handleLocalNumberChange(e.target.value)}
              value={localNumber}
              placeholder={selectedCountry?.example || '088 084 4455'}
              sx={{ flex: 1 }}
              slotProps={{
                input: {
                  sx: { borderRadius: 3 },
                  inputProps: {
                    maxLength: countryCode === '+66' ? 12 : 18,
                    pattern: '[0-9]*',
                    inputMode: 'tel',
                  },
                },
              }}
              error={isInvalidPhoneNumber}
              helperText={isInvalidPhoneNumber ? t("dateSelection.invalidPhone", "เบอร์โทรศัพท์ไม่ถูกต้อง") : ''}
              disabled={hasUserData}
            />
          </Box>
        </Stack>
      </Box>

      {/* Section 4: PDPA Acceptance */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: '#f8fafc',
          borderRadius: 3,
          border: '1px solid #f1f5f9',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={acceptedPDPA}
              onChange={(e) => onAcceptedPDPAChange(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="#475569">
              {t("dateSelection.acceptPdpaText", "ฉันได้อ่านและยอมรับ")}{' '}
              <Link
                component="button"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setPdpaDialogOpen(true);
                }}
                sx={{ fontWeight: 600, color: '#B03052' }}
              >
                {t("dateSelection.pdpaLink", "นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)")}
              </Link>
            </Typography>
          }
          sx={{
            alignItems: 'flex-start',
            m: 0,
            '& .MuiCheckbox-root': { pt: 0, pr: 1 },
          }}
        />
      </Box>

      <PDPADialog open={pdpaDialogOpen} onClose={() => setPdpaDialogOpen(false)} />
    </Stack>
  );
}

export default DateSelectionStep;
