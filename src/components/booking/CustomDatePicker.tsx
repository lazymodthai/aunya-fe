import { useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { SxProps } from '@mui/material';

type Props = {
  label: string
  value: Date | null
  onChange: (e: any)=> void
  sx?: SxProps
  disabled?: boolean
  minDate?: Date | null
  disabledDates?: Date[]
  checkInDate?: Date | null
}

const CustomDatePicker = (props: Props) => {
  const [open, setOpen] = useState(false);

  const shouldDisableDate = (date: Date) => {
    if (props.disabledDates) {
      return props.disabledDates.some(disabledDate => {
        return date.getFullYear() === disabledDate.getFullYear() &&
               date.getMonth() === disabledDate.getMonth() &&
               date.getDate() === disabledDate.getDate();
      });
    }

    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!props.checkInDate || !props.value) return false;
    
    const checkInTime = new Date(props.checkInDate).getTime();
    const valueTime = new Date(props.value).getTime();
    const dateTime = new Date(date).getTime();
    
    const startTime = Math.min(checkInTime, valueTime);
    const endTime = Math.max(checkInTime, valueTime);
    
    return dateTime >= startTime && dateTime <= endTime;
  };

  const isRangeStart = (date: Date) => {
    if (!props.checkInDate || !props.value) return false;
    
    const checkInTime = new Date(props.checkInDate).getTime();
    const valueTime = new Date(props.value).getTime();
    const dateTime = new Date(date).getTime();
    
    return dateTime === Math.min(checkInTime, valueTime);
  };

  const isRangeEnd = (date: Date) => {
    if (!props.checkInDate || !props.value) return false;
    
    const checkInTime = new Date(props.checkInDate).getTime();
    const valueTime = new Date(props.value).getTime();
    const dateTime = new Date(date).getTime();
    
    return dateTime === Math.max(checkInTime, valueTime);
  };

  const isCheckInDate = (date: Date) => {
    if (!props.checkInDate) return false;
    
    return date.getFullYear() === props.checkInDate.getFullYear() &&
           date.getMonth() === props.checkInDate.getMonth() &&
           date.getDate() === props.checkInDate.getDate();
  };

  const hasDisabledDateInRange = (endDate: Date) => {
    if (!props.checkInDate || !props.disabledDates) return false;
    
    const startTime = new Date(props.checkInDate).getTime();
    const endTime = new Date(endDate).getTime();
    
    const rangeStart = Math.min(startTime, endTime);
    const rangeEnd = Math.max(startTime, endTime);
    
    return props.disabledDates.some(disabledDate => {
      const disabledTime = new Date(disabledDate).getTime();
      return disabledTime > rangeStart && disabledTime < rangeEnd;
    });
  };

  const getNextDisabledDate = () => {
    if (!props.checkInDate || !props.disabledDates) return null;
    
    const checkInTime = new Date(props.checkInDate).getTime();
    
    const nextDisabledDates = props.disabledDates
      .filter(date => new Date(date).getTime() > checkInTime)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    return nextDisabledDates.length > 0 ? nextDisabledDates[0] : null;
  };

  const customShouldDisableDate = (date: Date) => {
    // ตรวจสอบ disabled dates ตามปกติ
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

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={th}
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
        disablePast
        minDate={props.minDate || new Date()}
        shouldDisableDate={customShouldDisableDate}
        localeText={{
          okButtonLabel: 'ตกลง',
          cancelButtonLabel: 'ยกเลิก',
          toolbarTitle: props.label
        }}
        slotProps={{
          textField: {
            onClick: () => setOpen(true),
            inputProps: {
              readOnly: true,
            },
            onFocus: (e:any) => {
              e.target.blur();
              setOpen(true);
            },
            onKeyDown: (e) => {
              e.preventDefault();
              setOpen(true);
            },
            onKeyUp: (e) => {
              e.preventDefault();
            },
            onKeyPress: (e) => {
              e.preventDefault();
            },
            onPaste: (e) => {
              e.preventDefault();
            },
            style: {
              cursor: 'pointer'
            }
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
            // สไตล์สำหรับวันที่อยู่ในช่วง
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