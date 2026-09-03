import { useState, useMemo } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th, enUS } from 'date-fns/locale';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { SxProps } from '@mui/material';
import { parseLocalDate } from '@utils/date';
import { useTranslation } from 'react-i18next';

type DisabledDateRange = {
  checkinDate: string;
  checkoutDate: string;
};

type Props = {
  label: string
  value: Date | null
  onChange: (e: any) => void
  sx?: SxProps
  disabled?: boolean
  minDate?: Date | null
  disabledDateRange?: DisabledDateRange[]
  disabledDates?: string[] // format: YYYY-MM-DD
  checkInDate?: Date | null
  maximumMonth?: number
  size?: 'small' | 'medium'
}

const CustomDatePicker = (props: Props) => {
  const [open, setOpen] = useState(false);

  const dynamicMinDate = useMemo(() => {
    if (props.checkInDate) {
      return props.checkInDate;
    }
    return props.minDate || new Date();
  }, [props.checkInDate, props.minDate]);

  // 2. Logic การคำนวณ maxDate ยังคงเดิม
  const maxDate = useMemo(() => {
    if (props.checkInDate) {
      const checkIn = new Date(props.checkInDate);
      const targetYear = checkIn.getFullYear();
      const targetMonth = checkIn.getMonth() + 1;
      const lastDayOfNextMonth = new Date(targetYear, targetMonth + 1, 0);
      return lastDayOfNextMonth;
    }

    if (props.maximumMonth && props.maximumMonth > 0) {
      const today = new Date();
      const targetMonth = today.getMonth() + props.maximumMonth - 1;
      const lastDayOfMonth = new Date(today.getFullYear(), targetMonth + 1, 0);
      return lastDayOfMonth;
    }

    return undefined;
  }, [props.checkInDate, props.maximumMonth]);

  const flatDisabledDates = useMemo(() => {
    const allDisabled: Date[] = [];

    if (props.disabledDateRange) {
      props.disabledDateRange.forEach(range => {
        const startDate = parseLocalDate(range.checkinDate);
        const endDate = parseLocalDate(range.checkoutDate);

        let currentDate = new Date(startDate);
        while (currentDate < endDate) {
          allDisabled.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    }

    if (props.disabledDates) {
      props.disabledDates.forEach(item => {
        allDisabled.push(parseLocalDate(item));
      });
    }

    return allDisabled;
  }, [props.disabledDateRange, props.disabledDates]);


  const shouldDisableDate = (date: Date) => {
    if (flatDisabledDates) {
      return flatDisabledDates.some(disabledDate => {
        return date.getFullYear() === disabledDate.getFullYear() &&
          date.getMonth() === disabledDate.getMonth() &&
          date.getDate() === disabledDate.getDate();
      });
    }
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!props.checkInDate || !props.value) return false;
    const checkInTime = new Date(props.checkInDate).setHours(0, 0, 0, 0);
    const valueTime = new Date(props.value).setHours(0, 0, 0, 0);
    const dateTime = new Date(date).setHours(0, 0, 0, 0);
    const startTime = Math.min(checkInTime, valueTime);
    const endTime = Math.max(checkInTime, valueTime);
    return dateTime >= startTime && dateTime <= endTime;
  };

  const isRangeStart = (date: Date) => {
    if (!props.checkInDate || !props.value) return false;
    const checkInTime = new Date(props.checkInDate).setHours(0, 0, 0, 0);
    const valueTime = new Date(props.value).setHours(0, 0, 0, 0);
    const dateTime = new Date(date).setHours(0, 0, 0, 0);
    return dateTime === Math.min(checkInTime, valueTime);
  };

  const isRangeEnd = (date: Date) => {
    if (!props.checkInDate || !props.value) return false;
    const checkInTime = new Date(props.checkInDate).setHours(0, 0, 0, 0);
    const valueTime = new Date(props.value).setHours(0, 0, 0, 0);
    const dateTime = new Date(date).setHours(0, 0, 0, 0);
    return dateTime === Math.max(checkInTime, valueTime);
  };

  const isCheckInDate = (date: Date) => {
    if (!props.checkInDate) return false;
    return date.getFullYear() === props.checkInDate.getFullYear() &&
      date.getMonth() === props.checkInDate.getMonth() &&
      date.getDate() === props.checkInDate.getDate();
  };

  const hasDisabledDateInRange = (endDate: Date) => {
    if (!props.checkInDate || !flatDisabledDates) return false;
    const startTime = new Date(props.checkInDate).getTime();
    const endTime = new Date(endDate).getTime();
    const rangeStart = Math.min(startTime, endTime);
    const rangeEnd = Math.max(startTime, endTime);

    return flatDisabledDates.some(disabledDate => {
      const disabledTime = new Date(disabledDate).getTime();
      return disabledTime > rangeStart && disabledTime < rangeEnd;
    });
  };

  const getNextDisabledDate = () => {
    if (!props.checkInDate || !flatDisabledDates) return null;
    const checkInTime = new Date(props.checkInDate).getTime();

    const nextDisabledDates = flatDisabledDates
      .filter(date => new Date(date).getTime() > checkInTime)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return nextDisabledDates.length > 0 ? nextDisabledDates[0] : null;
  };

  const customShouldDisableDate = (date: Date) => {
    if (shouldDisableDate(date)) {
      if (props.checkInDate) {
        const nextDisabledDate = getNextDisabledDate();
        if (nextDisabledDate) {
          const isNextDisabledDate = date.getFullYear() === nextDisabledDate.getFullYear() &&
            date.getMonth() === nextDisabledDate.getMonth() &&
            date.getDate() === nextDisabledDate.getDate();
          return !isNextDisabledDate;
        }
      }
      return true;
    }

    if (props.checkInDate && hasDisabledDateInRange(date)) {
      return true;
    }

    if (props.checkInDate) {
      const nextDisabledDate = getNextDisabledDate();
      if (nextDisabledDate && new Date(date).getTime() > new Date(nextDisabledDate).getTime()) {
        return true;
      }
    }

    return false;
  };

  const { i18n } = useTranslation();
  const currentLocale = i18n.language === 'en' ? enUS : th;

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={currentLocale}
    >
      <DatePicker
        label={props.label}
        value={props.value}
        onChange={props.onChange}
        views={['year', 'month', 'day']}
        format="dd MMMM yyyy"
        sx={props.sx}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        disablePast={!props.checkInDate}
        minDate={dynamicMinDate}
        maxDate={maxDate}
        shouldDisableDate={customShouldDisableDate}
        localeText={{
          okButtonLabel: i18n.language === 'en' ? 'OK' : 'ตกลง',
          cancelButtonLabel: i18n.language === 'en' ? 'Cancel' : 'ยกเลิก',
          toolbarTitle: props.label
        }}
        slotProps={{
          textField: {
            size: props.size,
            onClick: () => setOpen(true),
            inputProps: { readOnly: true, },
            onFocus: (e: any) => { e.target.blur(); setOpen(true); },
            onKeyDown: (e) => { e.preventDefault(); },
            style: { cursor: 'pointer' }
          },
          day: (ownerState) => {
            const date = ownerState.day;
            const isDisabled = shouldDisableDate(date);
            const inRange = isDateInRange(date);
            const isCheckIn = isCheckInDate(date);
            const isStart = isRangeStart(date);
            const isEnd = isRangeEnd(date);

            const isSelectableDisabledDate = isDisabled && props.checkInDate && (() => {
              const nextDisabledDate = getNextDisabledDate();
              if (nextDisabledDate) {
                return date.getFullYear() === nextDisabledDate.getFullYear() &&
                  date.getMonth() === nextDisabledDate.getMonth() &&
                  date.getDate() === nextDisabledDate.getDate();
              }
              return false;
            })();

            let sx: any = {};

            if (isDisabled && !isSelectableDisabledDate) {
              sx = {
                color: '#f44336 !important',
                backgroundColor: '#ffebee !important',
                '&:hover': {
                  backgroundColor: '#ffcdd2 !important',
                },
                fontWeight: 'bold'
              };
            }
            else if (isCheckIn) {
              const isSameDay = props.value &&
                date.getFullYear() === props.value.getFullYear() &&
                date.getMonth() === props.value.getMonth() &&
                date.getDate() === props.value.getDate();

              sx = {
                backgroundColor: '#2196f3 !important',
                color: '#fff !important',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#1976d2 !important',
                },
                ...(isSameDay && {
                  borderRadius: '50% !important',
                }),
                ...(!isSameDay && {
                  borderTopLeftRadius: '50% !important',
                  borderBottomLeftRadius: '50% !important',
                  borderTopRightRadius: '0 !important',
                  borderBottomRightRadius: '0 !important',
                })
              };
            }
            else if (inRange) {
              sx = {
                backgroundColor: '#e3f2fd !important',
                color: '#1976d2 !important',
                fontWeight: 'normal',
                '&:hover': {
                  backgroundColor: '#bbdefb !important',
                },
                borderRadius: '0 !important',
                ...(isStart && {
                  borderTopLeftRadius: '50% !important',
                  borderBottomLeftRadius: '50% !important',
                  backgroundColor: '#2196f3 !important',
                  color: '#fff !important',
                  fontWeight: 'bold',
                }),
                ...(isEnd && {
                  borderTopRightRadius: '50% !important',
                  borderBottomRightRadius: '50% !important',
                  backgroundColor: '#2196f3 !important',
                  color: '#fff !important',
                  fontWeight: 'bold',
                })
              };
            }

            return { sx };
          }
        }}
        disabled={props.disabled}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;