import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AuthAPI from '@apis/auth';
import BookingAPI, { MyBookingData } from '@apis/booking';
import PricesAPI from '@apis/prices';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, setUser, userSelector } from '@store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AdminBookingCalendar, { BookingData } from '@components/main/AdminBookingCalendar';
import { BookingStatus } from '@constants/booking.enum';
import Noti from '@components/Noti';

const ROOM_ID = 'a20626d8-dd06-45ca-b85d-71032e776543';

function AdminPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector(userSelector);

  const [activeTab, setActiveTab] = useState(0);
  const [calendarData, setCalendarData] = useState<BookingData[]>([]);
  const [allBookings, setAllBookings] = useState<MyBookingData[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Generate Prices State
  const [generateForm, setGenerateForm] = useState({
    year: new Date().getFullYear(),
    weekdayPrice: 2000,
    weekendPrice: 3000,
    holidayPrice: 3500,
    description: '',
  });

  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; booking: MyBookingData | null; action: BookingStatus | null }>({
    open: false,
    booking: null,
    action: null,
  });
  const [resetDialog, setResetDialog] = useState(false);
  const [generateDialog, setGenerateDialog] = useState(false);

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
        roomId: ROOM_ID,
      });

      if (data.data) {
        const formattedData: BookingData[] = data.data.map((item: any) => ({
          id: item.id,
          date: item.date,
          price: item.price,
          status: item.status,
          isMaintenance: item.isMaintenance || false,
        }));
        setCalendarData(formattedData);
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

  const handleGeneratePrices = async () => {
    try {
      await PricesAPI.generatePrices({
        year: generateForm.year,
        weekdayPrice: generateForm.weekdayPrice,
        weekendPrice: generateForm.weekendPrice,
        holidayPrice: generateForm.holidayPrice,
        description: generateForm.description,
        roomId: ROOM_ID,
      });
      showNoti('success', 'สร้างราคาสำเร็จ');
      setGenerateDialog(false);
      fetchCalendarData(currentMonth);
    } catch (error) {
      console.error('Error generating prices:', error);
      showNoti('error', 'ไม่สามารถสร้างราคาได้');
    }
  };

  const handleResetPrices = async () => {
    try {
      await PricesAPI.resetPrices({
        year: currentYear,
        roomId: ROOM_ID,
      });
      showNoti('success', 'รีเซ็ตราคาสำเร็จ');
      setResetDialog(false);
      fetchCalendarData(currentMonth);
    } catch (error) {
      console.error('Error resetting prices:', error);
      showNoti('error', 'ไม่สามารถรีเซ็ตราคาได้');
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCalendarData(new Date().getMonth());
    fetchAllBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Payment':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'สำเร็จ';
      case 'Pending':
        return 'รอการยืนยัน';
      case 'Payment':
        return 'รอการชำระเงิน';
      case 'Cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const BookingCard = ({ booking, showActions = true }: { booking: MyBookingData; showActions?: boolean }) => (
    <Card sx={{ borderRadius: 2, mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              รหัสการจอง
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {booking.refCode}
            </Typography>
          </Box>
          <Chip label={getStatusText(booking.status)} color={getStatusColor(booking.status) as any} size="small" />
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              เช็คอิน
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(booking.checkinDate)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              เช็คเอาท์
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(booking.checkoutDate)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              ผู้เข้าพัก
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {booking.guestNumber} คน
              {booking.additionGuestNumber ? ` (+${booking.additionGuestNumber})` : ''}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              ราคารวม
            </Typography>
            <Typography variant="body1" fontWeight={600} color="primary">
              ฿{booking.totalPrice.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          ผู้จอง: {booking.name} - {booking.phoneNumber}
        </Typography>

        {showActions && (booking.status === 'Pending' || booking.status === 'Payment') && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              fullWidth
              onClick={() => handleStatusChange(booking, BookingStatus.CONFIRMED)}
            >
              ยืนยัน
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              fullWidth
              onClick={() => handleStatusChange(booking, BookingStatus.CANCELLED)}
            >
              ยกเลิก
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );

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
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ py: 3, px: 2 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Tab 0: Calendar */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                คลิกที่วันเพื่อดูและจัดการการจอง
              </Typography>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <AdminBookingCalendar
                    bookingData={calendarData}
                    onChangeMonth={fetchCalendarData}
                    disablePast={false}
                    pastMonthRange={12}
                    futureMonthRange={12}
                    getBookingsByDate={getBookingsByDate}
                    onUpdatePrice={handleUpdatePrice}
                    onUpdateMaintenance={handleUpdateMaintenance}
                    onAddBooking={handleAddBooking}
                  />
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Tab 1: All Bookings */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                การจองทั้งหมด ({allBookings.length})
              </Typography>

              {allBookings.length === 0 ? (
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">ยังไม่มีการจอง</Typography>
                  </CardContent>
                </Card>
              ) : (
                <Stack spacing={0}>
                  {allBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {/* Tab 2: Price Settings */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                ตั้งค่าราคา
              </Typography>

              <Stack spacing={2}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      สร้างราคาทั้งปี
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      สร้างราคาสำหรับทุกวันในปีที่เลือก โดยแยกตามประเภทวัน
                    </Typography>
                    <Button variant="contained" onClick={() => setGenerateDialog(true)}>
                      สร้างราคา
                    </Button>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      รีเซ็ตราคา
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      ลบราคาทั้งหมดของปี {currentYear} และเริ่มต้นใหม่
                    </Typography>
                    <Button variant="outlined" color="error" onClick={() => setResetDialog(true)}>
                      รีเซ็ตราคาปี {currentYear}
                    </Button>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      {/* Confirm Status Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, booking: null, action: null })}>
        <DialogTitle>ยืนยันการดำเนินการ</DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการ{confirmDialog.action === BookingStatus.CONFIRMED ? 'ยืนยัน' : 'ยกเลิก'}การจอง
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

      {/* Generate Prices Dialog */}
      <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>สร้างราคาทั้งปี</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="ปี"
              type="number"
              value={generateForm.year}
              onChange={(e) => setGenerateForm({ ...generateForm, year: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="ราคาวันธรรมดา (จันทร์-ศุกร์)"
              type="number"
              value={generateForm.weekdayPrice}
              onChange={(e) => setGenerateForm({ ...generateForm, weekdayPrice: Number(e.target.value) })}
              fullWidth
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>฿</Typography> }}
            />
            <TextField
              label="ราคาวันหยุด (เสาร์-อาทิตย์)"
              type="number"
              value={generateForm.weekendPrice}
              onChange={(e) => setGenerateForm({ ...generateForm, weekendPrice: Number(e.target.value) })}
              fullWidth
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>฿</Typography> }}
            />
            <TextField
              label="ราคาวันหยุดนักขัตฤกษ์"
              type="number"
              value={generateForm.holidayPrice}
              onChange={(e) => setGenerateForm({ ...generateForm, holidayPrice: Number(e.target.value) })}
              fullWidth
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>฿</Typography> }}
            />
            <TextField
              label="รายละเอียด (ไม่บังคับ)"
              value={generateForm.description}
              onChange={(e) => setGenerateForm({ ...generateForm, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleGeneratePrices}>
            สร้างราคา
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Prices Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>ยืนยันการรีเซ็ตราคา</DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการรีเซ็ตราคาทั้งหมดของปี <strong>{currentYear}</strong> ใช่หรือไม่?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={handleResetPrices}>
            รีเซ็ตราคา
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Noti type={noti.type} open={noti.open} value={noti.message} onClose={() => setNoti({ ...noti, open: false })} />
    </Box>
  );
}

export default AdminPage;
