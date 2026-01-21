import { Box, Card, CardContent, Typography } from '@mui/material';
import AdminBookingCalendar, { BookingData } from '@components/main/AdminBookingCalendar';
import { MyBookingData } from '@apis/booking';

interface CalendarTabProps {
  calendarData: BookingData[];
  onChangeMonth: (month: number) => void;
  getBookingsByDate: (date: string) => Promise<MyBookingData[]>;
  onUpdatePrice: (id: string, price: number) => Promise<void>;
  onUpdateMaintenance: (id: string, isMaintenance: boolean) => Promise<void>;
  onAddBooking: (date: string) => void;
}

function CalendarTab({
  calendarData,
  onChangeMonth,
  getBookingsByDate,
  onUpdatePrice,
  onUpdateMaintenance,
  onAddBooking,
}: CalendarTabProps) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
        คลิกที่วันเพื่อดูและจัดการการจอง
      </Typography>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <AdminBookingCalendar
            bookingData={calendarData}
            onChangeMonth={onChangeMonth}
            disablePast={false}
            pastMonthRange={12}
            futureMonthRange={12}
            getBookingsByDate={getBookingsByDate}
            onUpdatePrice={onUpdatePrice}
            onUpdateMaintenance={onUpdateMaintenance}
            onAddBooking={onAddBooking}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

export default CalendarTab;
