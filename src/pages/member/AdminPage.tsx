import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import AuthAPI from '@apis/auth';
import BookingAPI, { MyBookingData } from '@apis/booking';
import PricesAPI from '@apis/prices';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, setUser, userSelector } from '@store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BookingData } from '@components/main/AdminBookingCalendar';
import { BookingStatus } from '@constants/booking.enum';
import Noti from '@components/Noti';

// Tab Components
import CalendarTab from '@components/admin/CalendarTab';
import BookingsTab from '@components/admin/BookingsTab';
import PriceSettingsTab from '@components/admin/PriceSettingsTab';
import DiscountCodeTab from '@components/admin/DiscountCodeTab';

const roomId = import.meta.env.VITE_ROOM_ID;

function AdminPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector(userSelector);

  const [activeTab, setActiveTab] = useState(0);
  const [calendarData, setCalendarData] = useState<BookingData[]>([]);
  const [allBookings, setAllBookings] = useState<MyBookingData[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; booking: MyBookingData | null; action: BookingStatus | null }>({
    open: false,
    booking: null,
    action: null,
  });

  // Notifications
  const [noti, setNoti] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({
    open: false,
    type: 'success',
    message: '',
  });

  const showNoti = (type: 'success' | 'error', message: string) => {
    setNoti({ open: true, type, message });
  };

  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(clearUser());
      navigate('/member/login');
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await AuthAPI.getProfile();
      if (data.user.isAdmin) {
        dispatch(setUser(data.user));
      } else if (!data.user.isActive) {
        dispatch(clearUser());
        navigate('/member/login');
      } else {
        navigate('/member/user');
      }
    } catch (error) {
      dispatch(clearUser());
      navigate('/member/login');
    }
  };

  const fetchCalendarData = async (month: number) => {
    try {
      const year = currentYear;
      const adjustedMonth = month < 0 ? 11 : month > 11 ? 0 : month;
      const adjustedYear = month < 0 ? year - 1 : month > 11 ? year + 1 : year;

      setCurrentMonth(adjustedMonth);
      setCurrentYear(adjustedYear);

      const { data } = await PricesAPI.getPrices({
        month: adjustedMonth + 1,
        year: adjustedYear,
        roomId: roomId,
      });

      if (data) {
        setCalendarData(data.prices);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const { data } = await BookingAPI.getAllBookings();
      setAllBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Function for AdminBookingCalendar
  const getBookingsByDate = async (date: string): Promise<MyBookingData[]> => {
    try {
      const { data } = await BookingAPI.getBookingsByDate({ date });
      if (data.success) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching bookings by date:', error);
      return [];
    }
  };

  const handleUpdatePrice = async (id: string, price: number): Promise<void> => {
    try {
      await PricesAPI.updatePriceById(id, { price });
      showNoti('success', 'อัปเดตราคาสำเร็จ');
      fetchCalendarData(currentMonth);
    } catch (error) {
      console.error('Error updating price:', error);
      showNoti('error', 'ไม่สามารถอัปเดตราคาได้');
    }
  };

  const handleUpdateMaintenance = async (id: string, isMaintenance: boolean): Promise<void> => {
    try {
      await PricesAPI.updateRoomStatusById(id, { isMaintenance });
      showNoti('success', isMaintenance ? 'ปิดปรับปรุงแล้ว' : 'เปิดให้บริการแล้ว');
      fetchCalendarData(currentMonth);
    } catch (error) {
      console.error('Error updating maintenance:', error);
      showNoti('error', 'ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const handleAddBooking = (date: string) => {
    navigate(`/booking?startDate=${date}`);
  };

  const handleStatusChange = async (booking: MyBookingData, newStatus: BookingStatus) => {
    setConfirmDialog({ open: true, booking, action: newStatus });
  };

  const confirmStatusChange = async () => {
    if (!confirmDialog.booking || !confirmDialog.action) return;

    try {
      await BookingAPI.updateBookingStatus(confirmDialog.booking.id, { status: confirmDialog.action });
      showNoti('success', 'อัปเดตสถานะสำเร็จ');
      fetchAllBookings();
    } catch (error) {
      console.error('Error updating status:', error);
      showNoti('error', 'ไม่สามารถอัปเดตสถานะได้');
    } finally {
      setConfirmDialog({ open: false, booking: null, action: null });
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCalendarData(new Date().getMonth());
    fetchAllBookings();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', px: 2, py: 1.5, width: '98vw' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" maxWidth={800} mx="auto">
          <Typography variant="h6" fontWeight={600}>
            Admin Panel
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {userData?.firstName}
            </Typography>
            <Button variant="outlined" color="error" size="small" onClick={handleLogout}>
              ออกจากระบบ
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          centered
          sx={{ maxWidth: 800, mx: 'auto' }}
        >
          <Tab label="ปฏิทิน" />
          <Tab label="การจองทั้งหมด" />
          <Tab label="ตั้งราคา" />
          <Tab label="โค้ดส่วนลด" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ py: 3, px: 2 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Tab 0: Calendar */}
          {activeTab === 0 && (
            <CalendarTab
              calendarData={calendarData}
              onChangeMonth={fetchCalendarData}
              getBookingsByDate={getBookingsByDate}
              onUpdatePrice={handleUpdatePrice}
              onUpdateMaintenance={handleUpdateMaintenance}
              onAddBooking={handleAddBooking}
            />
          )}

          {/* Tab 1: All Bookings */}
          {activeTab === 1 && (
            <BookingsTab
              allBookings={allBookings}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* Tab 2: Price Settings */}
          {activeTab === 2 && (
            <PriceSettingsTab
              currentYear={currentYear}
              currentMonth={currentMonth}
              onRefreshCalendar={fetchCalendarData}
              showNoti={showNoti}
            />
          )}

          {/* Tab 3: Discount Codes */}
          {activeTab === 3 && (
            <DiscountCodeTab showNoti={showNoti} />
          )}
        </Box>
      </Box>

      {/* Confirm Status Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, booking: null, action: null })}>
        <DialogTitle>ยืนยันการดำเนินการ</DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการ{confirmDialog.action === BookingStatus.CONFIRMED ? 'ยืนยันการจอง' : confirmDialog.action === BookingStatus.CHECKED_IN ? 'เช็คอิน' : confirmDialog.action === BookingStatus.CHECKED_OUT ? 'เช็คเอาท์' : 'ยกเลิกการจอง'}
            <strong> {confirmDialog.booking?.refCode}</strong> ใช่หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, booking: null, action: null })}>ยกเลิก</Button>
          <Button
            variant="contained"
            color={confirmDialog.action === BookingStatus.CONFIRMED ? 'success' : 'error'}
            onClick={confirmStatusChange}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Noti type={noti.type} open={noti.open} value={noti.message} onClose={() => setNoti({ ...noti, open: false })} />
    </Box>
  );
}

export default AdminPage;
