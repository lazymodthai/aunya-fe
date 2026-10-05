import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  RestartAlt as ResetIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { parseLocalDate } from '@utils/date';

interface DisabledDateRange {
  checkinDate: string;
  checkoutDate: string;
}

interface CustomDateRangePickerProps {
  checkinDate: Date | null;
  checkoutDate: Date | null;
  onChange: (checkin: Date | null, checkoutDate: Date | null) => void;
  disabledDates?: string[]; // format: YYYY-MM-DD
  disabledDateRange?: DisabledDateRange[];
  maximumMonth?: number;
  disablePast?: boolean;
  label?: string;
}

const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const ENG_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const THAI_DAY_NAMES = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const ENG_DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  checkinDate,
  checkoutDate,
  onChange,
  disabledDates,
  disabledDateRange,
  maximumMonth = 6,
  disablePast = true,
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  const [selectingField, setSelectingField] = useState<'checkin' | 'checkout'>('checkin');
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return checkinDate ? new Date(checkinDate.getFullYear(), checkinDate.getMonth(), 1) : new Date();
  });
  const [tempCheckin, setTempCheckin] = useState<Date | null>(checkinDate);
  const [tempCheckout, setTempCheckout] = useState<Date | null>(checkoutDate);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const handleOpenCheckin = () => {
    setSelectingField('checkin');
    setOpen(true);
  };

  const handleOpenCheckout = () => {
    if (!checkinDate) {
      setSelectingField('checkin');
    } else {
      setSelectingField('checkout');
    }
    setOpen(true);
  };

  // Sync state when dialog opens
  useEffect(() => {
    if (open) {
      setTempCheckin(checkinDate);
      setTempCheckout(checkoutDate);
      if (checkinDate) {
        setCurrentMonth(new Date(checkinDate.getFullYear(), checkinDate.getMonth(), 1));
      } else {
        setCurrentMonth(new Date());
      }
      setHoverDate(null);
    }
  }, [open, checkinDate, checkoutDate]);

  // Compute all disabled dates
  const flatDisabledDates = useMemo(() => {
    const allDisabled: Date[] = [];

    if (disabledDateRange) {
      disabledDateRange.forEach((range) => {
        const startDate = parseLocalDate(range.checkinDate);
        const endDate = parseLocalDate(range.checkoutDate);
        let currentDate = new Date(startDate);
        while (currentDate < endDate) {
          allDisabled.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    }

    if (disabledDates) {
      disabledDates.forEach((item) => {
        allDisabled.push(parseLocalDate(item));
      });
    }

    return allDisabled;
  }, [disabledDateRange, disabledDates]);

  // Max selectable date
  const maxSelectableDate = useMemo(() => {
    if (maximumMonth && maximumMonth > 0 && disablePast !== false) {
      const today = new Date();
      const targetMonth = today.getMonth() + maximumMonth - 1;
      return new Date(today.getFullYear(), targetMonth + 1, 0, 23, 59, 59, 999);
    }
    return undefined;
  }, [maximumMonth, disablePast]);

  const hasDisabledDateBetween = (start: Date, end: Date) => {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(0, 0, 0, 0);
    const min = Math.min(s.getTime(), e.getTime());
    const max = Math.max(s.getTime(), e.getTime());

    return flatDisabledDates.some((disabledDate) => {
      const d = new Date(disabledDate);
      d.setHours(0, 0, 0, 0);
      const time = d.getTime();
      return time > min && time < max;
    });
  };

  const isDateBooked = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const time = d.getTime();
    return flatDisabledDates.some((disabledDate) => {
      const disabled = new Date(disabledDate);
      disabled.setHours(0, 0, 0, 0);
      return time === disabled.getTime();
    });
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const time = d.getTime();

    // Disable past
    if (disablePast !== false && time < today.getTime()) return true;

    // Disable beyond max range
    if (disablePast !== false && maxSelectableDate && time > maxSelectableDate.getTime()) return true;

    const booked = isDateBooked(date);

    // MODE 1: Selecting Check-in date
    // A booked date can NEVER be selected as Check-in date!
    if (selectingField === 'checkin') {
      return booked;
    }

    // MODE 2: Selecting Check-out date
    // Must have a tempCheckin
    if (!tempCheckin) {
      return booked;
    }

    const checkinTime = new Date(tempCheckin);
    checkinTime.setHours(0, 0, 0, 0);

    // Any date <= tempCheckin cannot be selected as Check-out
    if (time <= checkinTime.getTime()) {
      return true;
    }

    // A date after tempCheckin can be selected as Check-out if there are NO booked dates strictly between checkin and this date
    // (Notice: The checkout date ITSELF is allowed to be booked because the guest leaves before the next guest arrives)
    return hasDisabledDateBetween(tempCheckin, date);
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (selectingField === 'checkin') {
      // User selected a valid check-in date
      setTempCheckin(date);
      setTempCheckout(null);
      setHoverDate(null);
      // Switch mode to selecting checkout
      setSelectingField('checkout');
    } else {
      // Selecting Check-out date
      if (!tempCheckin) {
        setTempCheckin(date);
        setSelectingField('checkout');
        return;
      }

      const checkinTime = new Date(tempCheckin);
      checkinTime.setHours(0, 0, 0, 0);
      const clickedTime = new Date(date);
      clickedTime.setHours(0, 0, 0, 0);

      if (clickedTime.getTime() <= checkinTime.getTime()) {
        return;
      }

      if (hasDisabledDateBetween(tempCheckin, date)) {
        return;
      }

      // Valid check-out date selected!
      setTempCheckout(date);
      setHoverDate(null);
      onChange(tempCheckin, date);
      setOpen(false);
    }
  };

  const handleConfirm = () => {
    if (tempCheckin && tempCheckout) {
      onChange(tempCheckin, tempCheckout);
      setOpen(false);
    }
  };

  const handleClear = () => {
    setTempCheckin(null);
    setTempCheckout(null);
    setHoverDate(null);
    onChange(null, null);
  };

  const isPrevDisabled = useMemo(() => {
    if (disablePast === false) return false;
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const today = new Date();
    today.setDate(1);
    today.setHours(0, 0, 0, 0);
    return prev < today;
  }, [currentMonth, disablePast]);

  const isNextDisabled = useMemo(() => {
    if (disablePast === false) return false;
    if (!maxSelectableDate) return false;
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    return next > maxSelectableDate;
  }, [currentMonth, disablePast, maxSelectableDate]);

  // Month navigation
  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const today = new Date();
    today.setDate(1);
    today.setHours(0, 0, 0, 0);
    if (disablePast === false || prev >= today) {
      setCurrentMonth(prev);
    }
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (disablePast === false || !maxSelectableDate || next <= maxSelectableDate) {
      setCurrentMonth(next);
    }
  };

  // Compute days in month grid
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  // Formatter helpers
const THAI_SHORT_MONTH_NAMES = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const ENG_SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '';
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const month = i18n.language === 'en' ? ENG_MONTH_NAMES[monthIndex] : THAI_MONTH_NAMES[monthIndex];
    const year = i18n.language === 'en' ? date.getFullYear() : date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const formatDateShort = (date: Date | null) => {
    if (!date) return '';
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const month = i18n.language === 'en' ? ENG_SHORT_MONTH_NAMES[monthIndex] : THAI_SHORT_MONTH_NAMES[monthIndex];
    const year = i18n.language === 'en' ? date.getFullYear() : date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const nights = useMemo(() => {
    if (checkinDate && checkoutDate) {
      const s = new Date(checkinDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(checkoutDate);
      e.setHours(0, 0, 0, 0);
      return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
    }
    return 0;
  }, [checkinDate, checkoutDate]);

  const monthTitle = useMemo(() => {
    const monthIndex = currentMonth.getMonth();
    const month = i18n.language === 'en' ? ENG_MONTH_NAMES[monthIndex] : THAI_MONTH_NAMES[monthIndex];
    const year = i18n.language === 'en' ? currentMonth.getFullYear() : currentMonth.getFullYear() + 543;
    return `${month} ${year}`;
  }, [currentMonth, i18n.language]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Unified Trigger Card */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.2, sm: 1.8 },
          borderRadius: 3,
          borderColor: open || (checkinDate && checkoutDate) ? '#b03052' : '#cbd5e1',
          borderWidth: open || (checkinDate && checkoutDate) ? 2 : 1,
          bgcolor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }} sx={{ width: '100%' }}>
          {/* Check-in Box */}
          <Box
            onClick={handleOpenCheckin}
            sx={{
              flex: 1,
              bgcolor: (open && selectingField === 'checkin') || checkinDate ? '#fff5f7' : '#f8fafc',
              py: { xs: 1.2, sm: 1.5 },
              px: { xs: 1, sm: 1.5 },
              borderRadius: 2.5,
              border: '1.5px solid',
              borderColor: (open && selectingField === 'checkin') ? '#b03052' : checkinDate ? '#fecdd3' : '#e2e8f0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: '#b03052',
                boxShadow: '0 2px 8px rgba(176, 48, 82, 0.1)',
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: (open && selectingField === 'checkin') ? '#b03052' : '#64748b',
                fontSize: { xs: '0.72rem', sm: '0.78rem' },
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Check-in
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: checkinDate ? '#1e293b' : '#94a3b8',
                fontSize: { xs: '0.88rem', sm: '0.98rem' },
                mt: 0.3,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {checkinDate ? (isMobile ? formatDateShort(checkinDate) : formatDateDisplay(checkinDate)) : '-'}
            </Typography>
          </Box>

          {/* Center Divider / Nights */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {nights > 0 ? (
              <Chip
                label={t('success.nightsCount', { count: nights })}
                size="small"
                sx={{
                  bgcolor: '#b03052',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: { xs: '0.72rem', sm: '0.8rem' },
                  height: { xs: 24, sm: 28 },
                  px: { xs: 0.5, sm: 1 },
                }}
              />
            ) : (
              <ArrowForwardIcon sx={{ color: '#94a3b8', fontSize: { xs: 18, sm: 22 } }} />
            )}
          </Box>

          {/* Check-out Box */}
          <Box
            onClick={handleOpenCheckout}
            sx={{
              flex: 1,
              bgcolor: (open && selectingField === 'checkout') || checkoutDate ? '#fff5f7' : '#f8fafc',
              py: { xs: 1.2, sm: 1.5 },
              px: { xs: 1, sm: 1.5 },
              borderRadius: 2.5,
              border: '1.5px solid',
              borderColor: (open && selectingField === 'checkout') ? '#b03052' : checkoutDate ? '#fecdd3' : '#e2e8f0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: '#b03052',
                boxShadow: '0 2px 8px rgba(176, 48, 82, 0.1)',
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: (open && selectingField === 'checkout') ? '#b03052' : '#64748b',
                fontSize: { xs: '0.72rem', sm: '0.78rem' },
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Check-out
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: checkoutDate ? '#1e293b' : '#94a3b8',
                fontSize: { xs: '0.88rem', sm: '0.98rem' },
                mt: 0.3,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {checkoutDate ? (isMobile ? formatDateShort(checkoutDate) : formatDateDisplay(checkoutDate)) : '-'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* 2. Unified Single Calendar Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            p: { xs: 1, sm: 1.5 },
            boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
            maxWidth: { xs: 'calc(100% - 24px)', sm: 440 },
            mx: 'auto',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 1.5, px: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.15rem', color: '#1e293b' }}>
              {selectingField === 'checkin'
                ? t('dateSelection.checkin', 'เลือกวัน Check-in')
                : t('dateSelection.checkout', 'เลือกวัน Check-out')}
            </Typography>
            <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: '#94a3b8' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Interactive Check-in / Check-out Tab Selector */}
          <Stack direction="row" spacing={1} sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: 2 }}>
            <Box
              onClick={() => setSelectingField('checkin')}
              sx={{
                flex: 1,
                py: 0.8,
                px: 1,
                borderRadius: 1.5,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: selectingField === 'checkin' ? '#ffffff' : 'transparent',
                boxShadow: selectingField === 'checkin' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: selectingField === 'checkin' ? '#b03052' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              >
                CHECK-IN
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: tempCheckin ? '#1e293b' : '#94a3b8',
                }}
              >
                {tempCheckin ? formatDateShort(tempCheckin) : 'เลือกวันที่'}
              </Typography>
            </Box>

            <Box
              onClick={() => {
                if (tempCheckin) {
                  setSelectingField('checkout');
                }
              }}
              sx={{
                flex: 1,
                py: 0.8,
                px: 1,
                borderRadius: 1.5,
                textAlign: 'center',
                cursor: tempCheckin ? 'pointer' : 'not-allowed',
                opacity: tempCheckin ? 1 : 0.6,
                bgcolor: selectingField === 'checkout' ? '#ffffff' : 'transparent',
                boxShadow: selectingField === 'checkout' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: selectingField === 'checkout' ? '#b03052' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              >
                CHECK-OUT
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: tempCheckout ? '#1e293b' : '#94a3b8',
                }}
              >
                {tempCheckout ? formatDateShort(tempCheckout) : 'เลือกวันที่'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
          {/* Month Header with Navigation */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, px: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1e293b' }}>
              {monthTitle}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton onClick={handlePrevMonth} disabled={isPrevDisabled} size="small" sx={{ border: '1px solid #e2e8f0' }}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={handleNextMonth} disabled={isNextDisabled} size="small" sx={{ border: '1px solid #e2e8f0' }}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          {/* Days of Week Header */}
          <Grid container sx={{ mb: 1, textAlign: 'center' }}>
            {(i18n.language === 'en' ? ENG_DAY_NAMES : THAI_DAY_NAMES).map((dayName, idx) => (
              <Grid key={dayName} size={12 / 7}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: idx === 0 || idx === 6 ? '#b03052' : '#64748b',
                    fontSize: '0.78rem',
                  }}
                >
                  {dayName}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Days Grid with Range Highlight */}
          <Grid container sx={{ rowGap: 0.8 }}>
            {daysInMonth.map((day, index) => {
              if (!day) {
                return <Grid key={`empty-${index}`} size={12 / 7} />;
              }

              const dayTime = new Date(day).setHours(0, 0, 0, 0);
              const startTime = tempCheckin ? new Date(tempCheckin).setHours(0, 0, 0, 0) : null;
              const endTime = tempCheckout ? new Date(tempCheckout).setHours(0, 0, 0, 0) : null;
              const hoverTime = hoverDate ? new Date(hoverDate).setHours(0, 0, 0, 0) : null;

              const isStart = startTime !== null && dayTime === startTime;
              const isEnd = endTime !== null && dayTime === endTime;
              const isHoverEnd =
                startTime !== null &&
                endTime === null &&
                hoverTime !== null &&
                dayTime === hoverTime &&
                hoverTime > startTime;

              // Range calculation
              const isInSelectedRange =
                startTime !== null &&
                endTime !== null &&
                dayTime > startTime &&
                dayTime < endTime;

              const isInHoverRange =
                startTime !== null &&
                endTime === null &&
                hoverTime !== null &&
                dayTime > startTime &&
                dayTime < hoverTime &&
                !hasDisabledDateBetween(tempCheckin!, hoverDate!);

              const inRange = isInSelectedRange || isInHoverRange;
              const disabled = isDateDisabled(day);

              return (
                <Grid
                  key={day.toISOString()}
                  size={12 / 7}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    py: 0.2,
                  }}
                >
                  {/* Range Background Connector */}
                  {inRange && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        bottom: 4,
                        left: 0,
                        right: 0,
                        bgcolor: '#fff1f2',
                        zIndex: 0,
                      }}
                    />
                  )}
                  {isStart && (endTime !== null || (hoverTime !== null && hoverTime > startTime!)) && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        bottom: 4,
                        left: '50%',
                        right: 0,
                        bgcolor: '#fff1f2',
                        zIndex: 0,
                      }}
                    />
                  )}
                  {(isEnd || isHoverEnd) && startTime !== null && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        bottom: 4,
                        left: 0,
                        right: '50%',
                        bgcolor: '#fff1f2',
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Day Button */}
                  <Box
                    onClick={() => handleDateClick(day)}
                    onMouseEnter={() => !disabled && tempCheckin && !tempCheckout && setHoverDate(day)}
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: isStart || isEnd || isHoverEnd ? '50%' : inRange ? '10px' : '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1,
                      cursor: (disabled && !isStart && !isEnd) ? 'not-allowed' : 'pointer',
                      bgcolor: isStart || isEnd
                        ? '#b03052'
                        : isHoverEnd
                        ? '#e11d48'
                        : inRange
                        ? '#ffe4e6'
                        : 'transparent',
                      color: isStart || isEnd || isHoverEnd
                        ? '#ffffff'
                        : (disabled && !isStart && !isEnd)
                        ? '#cbd5e1'
                        : inRange
                        ? '#b03052'
                        : '#1e293b',
                      fontWeight: isStart || isEnd || isHoverEnd || inRange ? 700 : 500,
                      fontSize: '0.88rem',
                      textDecoration: (disabled && !isStart && !isEnd) ? 'line-through' : 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: (disabled && !isStart && !isEnd)
                          ? 'transparent'
                          : isStart || isEnd
                          ? '#8e2340'
                          : '#fecdd3',
                      },
                    }}
                  >
                    {day.getDate()}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ pt: 1, pb: 1.5, px: 2, justifyContent: 'space-between' }}>
          <Button
            size="small"
            onClick={handleClear}
            startIcon={<ResetIcon sx={{ fontSize: 16 }} />}
            sx={{ color: '#64748b', fontWeight: 600 }}
          >
            {t('dateSelection.clearDates', 'ล้างวันที่')}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleConfirm}
            disabled={!tempCheckin || !tempCheckout}
            startIcon={<CheckIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              px: 2.5,
              bgcolor: '#b03052',
              '&:hover': { bgcolor: '#8e2340' },
            }}
          >
            {t('dateSelection.confirmDates', 'ยืนยันวันที่')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomDateRangePicker;
