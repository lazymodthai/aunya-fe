import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import { format, addDays, differenceInDays, isBefore, isAfter, isSameDay } from 'date-fns';

// Types
interface BookingDataItem {
  m: number;
  d: number;
  price: number;
  promotion: 'yes' | 'no' | string;
  reserved: 'yes' | 'no' | string;
  maintenance: 'yes' | 'no' | string;
}

interface BookingProps {
  bookingData: BookingDataItem[];
  startDate?: Date;
}

interface BookingDetails {
  checkInDate: Date | null;
  checkOutDate: Date | null;
  guestCount: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface AdditionalService {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

interface PaymentDetails {
  receiptImage: File | null;
}

interface ApiBookingRequest {
  checkIn: string;
  checkOut: string;
  guestCount: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  totalDays: number;
  totalPrice: number;
  additionalServices: {
    id: string;
    name: string;
    price: number;
  }[];
}

interface ApiPaymentRequest {
  bookingId: string;
  receiptImage: File;
}

// Constants
const steps = ['รายละเอียดการจอง', 'คำนวณค่าใช้จ่าย', 'โอนเงิน'];

// Mock API functions
const submitBooking = async (data: ApiBookingRequest): Promise<{ success: boolean, bookingId: string }> => {
  // Simulate API call
  console.log('Submitting booking data:', data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, bookingId: 'BK' + Math.floor(Math.random() * 10000) };
};

const submitPayment = async (data: ApiPaymentRequest): Promise<{ success: boolean }> => {
  // Simulate API call
  console.log('Submitting payment data:', data);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

// Additional Services Mock Data
const additionalServicesList: AdditionalService[] = [
  { id: 'breakfast', name: 'อาหารเช้า', price: 250, selected: false },
  { id: 'airport_transfer', name: 'รถรับส่งสนามบิน', price: 800, selected: false },
  { id: 'spa', name: 'บริการสปา', price: 1500, selected: false },
];

// Component
const Booking: React.FC<BookingProps> = ({ bookingData, startDate }) => {
  // State
  const [activeStep, setActiveStep] = useState<number>(0);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    checkInDate: startDate || null,
    checkOutDate: null,
    guestCount: 1,
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>(additionalServicesList);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    receiptImage: null,
  });
  const [currentBookingId, setCurrentBookingId] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Derived state
  const totalDays = calculateTotalDays();
  const totalPrice = calculateTotalPrice();

  function calculateTotalDays(): number {
    if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) return 0;
    return differenceInDays(bookingDetails.checkOutDate, bookingDetails.checkInDate);
  }

  function calculateTotalPrice(): number {
    if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) return 0;

    let total = 0;
    
    // Calculate room price for each day
    const checkInDate = bookingDetails.checkInDate;
    const checkOutDate = bookingDetails.checkOutDate;
    const currentYear = new Date().getFullYear();
    
    // Count the days between check-in and check-out
    const days = differenceInDays(checkOutDate, checkInDate);
    
    // Loop through each day and find the price from bookingData
    for (let i = 0; i < days; i++) {
      const currentDate = addDays(new Date(checkInDate), i);
      const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
      const day = currentDate.getDate();
      
      // Find matching booking data entry
      const matchingDay = bookingData.find(item => item.m === month && item.d === day);
      if (matchingDay) {
        total += matchingDay.price;
      } else {
        // Fallback to default price if no data found for this date
        total += 5500; 
      }
    }
    
    // Add cost of additional services
    additionalServices.forEach(service => {
      if (service.selected) {
        total += service.price * days; // Apply service cost for each day
      }
    });
    
    return total;
  }

  // Validate form fields for Step 1
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!bookingDetails.checkInDate) {
      newErrors.checkInDate = 'กรุณาเลือกวันที่ Check-in';
    }
    
    if (!bookingDetails.checkOutDate) {
      newErrors.checkOutDate = 'กรุณาเลือกวันที่ Check-out';
    }
    
    if (bookingDetails.checkInDate && bookingDetails.checkOutDate) {
      if (isSameDay(bookingDetails.checkInDate, bookingDetails.checkOutDate) || 
          isBefore(bookingDetails.checkOutDate, bookingDetails.checkInDate)) {
        newErrors.checkOutDate = 'วันที่ Check-out ต้องเป็นวันหลังจากวัน Check-in';
      }
    }
    
    if (!bookingDetails.guestCount || bookingDetails.guestCount < 1) {
      newErrors.guestCount = 'กรุณาระบุจำนวนผู้เข้าพัก';
    }
    
    if (!bookingDetails.firstName.trim()) {
      newErrors.firstName = 'กรุณาระบุชื่อผู้จอง';
    }
    
    if (!bookingDetails.lastName.trim()) {
      newErrors.lastName = 'กรุณาระบุนามสกุลผู้จอง';
    }
    
    if (!bookingDetails.phoneNumber.trim()) {
      newErrors.phoneNumber = 'กรุณาระบุเบอร์โทรศัพท์';
    } else if (!/^[0-9]{10}$/.test(bookingDetails.phoneNumber)) {
      newErrors.phoneNumber = 'กรุณาระบุเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if a date is disabled (already reserved or under maintenance)
  const isDateDisabled = (date: Date): boolean => {
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const day = date.getDate();
    
    const matchingDay = bookingData.find(item => item.m === month && item.d === day);
    
    if (matchingDay) {
      return matchingDay.reserved === 'yes' || matchingDay.maintenance === 'yes';
    }
    
    // If no explicit data, assume available
    return false;
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      // Validate Step 1
      if (!validateStep1()) return;
    } else if (activeStep === 1) {
      // Submit booking data to API
      setLoading(true);
      try {
        const bookingRequest: ApiBookingRequest = {
          checkIn: format(bookingDetails.checkInDate!, 'yyyy-MM-dd'),
          checkOut: format(bookingDetails.checkOutDate!, 'yyyy-MM-dd'),
          guestCount: bookingDetails.guestCount,
          firstName: bookingDetails.firstName,
          lastName: bookingDetails.lastName,
          phoneNumber: bookingDetails.phoneNumber,
          totalDays,
          totalPrice,
          additionalServices: additionalServices
            .filter(service => service.selected)
            .map(({ id, name, price }) => ({ id, name, price }))
        };
        
        const response = await submitBooking(bookingRequest);
        
        if (response.success) {
          setCurrentBookingId(response.bookingId);
        } else {
          setSnackbarMessage('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง');
          setOpenSnackbar(true);
          return;
        }
      } catch (error) {
        console.error('Error submitting booking:', error);
        setSnackbarMessage('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง');
        setOpenSnackbar(true);
        return;
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 2) {
      // Submit payment data to API
      if (!paymentDetails.receiptImage) {
        setErrors({ receiptImage: 'กรุณาแนบสลิปการโอนเงิน' });
        return;
      }
      
      setLoading(true);
      try {
        const paymentRequest: ApiPaymentRequest = {
          bookingId: currentBookingId,
          receiptImage: paymentDetails.receiptImage
        };
        
        const response = await submitPayment(paymentRequest);
        
        if (response.success) {
          setSnackbarMessage('ส่งรายละเอียดการจองแล้ว โปรดรอการยืนยัน');
          setOpenSnackbar(true);
        } else {
          setSnackbarMessage('เกิดข้อผิดพลาดในการส่งข้อมูลการชำระเงิน กรุณาลองใหม่อีกครั้ง');
          setOpenSnackbar(true);
          return;
        }
      } catch (error) {
        console.error('Error submitting payment:', error);
        setSnackbarMessage('เกิดข้อผิดพลาดในการส่งข้อมูลการชำระเงิน กรุณาลองใหม่อีกครั้ง');
        setOpenSnackbar(true);
        return;
      } finally {
        setLoading(false);
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setBookingDetails({
      checkInDate: startDate || null,
      checkOutDate: null,
      guestCount: 1,
      firstName: '',
      lastName: '',
      phoneNumber: '',
    });
    setAdditionalServices(additionalServicesList.map(service => ({ ...service, selected: false })));
    setPaymentDetails({ receiptImage: null });
    setErrors({});
  };

  const handleAdditionalServiceChange = (serviceId: string, checked: boolean) => {
    setAdditionalServices(prevServices => 
      prevServices.map(service => 
        service.id === serviceId ? { ...service, selected: checked } : service
      )
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setPaymentDetails({ receiptImage: event.target.files[0] });
      setErrors(prev => ({ ...prev, receiptImage: '' }));
    }
  };

  // Render Step 1: Booking Details
  const renderBookingDetails = () => {
    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
            <DatePicker
              label="วันที่ Check-in"
              value={bookingDetails.checkInDate}
              onChange={(newValue) => {
                setBookingDetails(prev => ({ ...prev, checkInDate: newValue }));
                setErrors(prev => ({ ...prev, checkInDate: '' }));
              }}
              shouldDisableDate={isDateDisabled}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.checkInDate,
                  helperText: errors.checkInDate
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
            <DatePicker
              label="วันที่ Check-out"
              value={bookingDetails.checkOutDate}
              onChange={(newValue) => {
                setBookingDetails(prev => ({ ...prev, checkOutDate: newValue }));
                setErrors(prev => ({ ...prev, checkOutDate: '' }));
              }}
              shouldDisableDate={isDateDisabled}
              minDate={bookingDetails.checkInDate ? addDays(bookingDetails.checkInDate, 1) : undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.checkOutDate,
                  helperText: errors.checkOutDate
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={12}>
          <TextField
            label="จำนวนผู้เข้าพัก"
            type="number"
            fullWidth
            value={bookingDetails.guestCount}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setBookingDetails(prev => ({ ...prev, guestCount: value }));
              setErrors(prev => ({ ...prev, guestCount: '' }));
            }}
            inputProps={{ min: 1 }}
            error={!!errors.guestCount}
            helperText={errors.guestCount}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="ชื่อผู้จอง"
            fullWidth
            value={bookingDetails.firstName}
            onChange={(e) => {
              setBookingDetails(prev => ({ ...prev, firstName: e.target.value }));
              setErrors(prev => ({ ...prev, firstName: '' }));
            }}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="นามสกุลผู้จอง"
            fullWidth
            value={bookingDetails.lastName}
            onChange={(e) => {
              setBookingDetails(prev => ({ ...prev, lastName: e.target.value }));
              setErrors(prev => ({ ...prev, lastName: '' }));
            }}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="เบอร์โทรศัพท์"
            fullWidth
            value={bookingDetails.phoneNumber}
            onChange={(e) => {
              setBookingDetails(prev => ({ ...prev, phoneNumber: e.target.value }));
              setErrors(prev => ({ ...prev, phoneNumber: '' }));
            }}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            inputProps={{ maxLength: 10 }}
          />
        </Grid>
      </Grid>
    );
  };

  // Render Step 2: Calculate Costs
  const renderCalculateCosts = () => {
    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>รายละเอียดการจอง</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="วันที่เข้าพัก" 
                    secondary={bookingDetails.checkInDate ? format(bookingDetails.checkInDate, 'dd/MM/yyyy') : '-'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="วันที่ออก" 
                    secondary={bookingDetails.checkOutDate ? format(bookingDetails.checkOutDate, 'dd/MM/yyyy') : '-'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="จำนวนวัน" 
                    secondary={`${totalDays} วัน`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="จำนวนผู้เข้าพัก" 
                    secondary={`${bookingDetails.guestCount} คน`} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={12}>
          <Typography variant="h6" gutterBottom>บริการเพิ่มเติม</Typography>
          {additionalServices.map((service) => (
            <FormControlLabel
              key={service.id}
              control={
                <Checkbox
                  checked={service.selected}
                  onChange={(e) => handleAdditionalServiceChange(service.id, e.target.checked)}
                />
              }
              label={`${service.name} (${service.price} บาท/วัน)`}
            />
          ))}
        </Grid>
        
        <Grid size={12}>
          <Divider />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6">สรุปค่าใช้จ่าย</Typography>
            <Typography variant="body1">
              ค่าห้องพัก: {totalDays > 0 ? totalPrice - additionalServices.filter(s => s.selected).reduce((sum, service) => sum + service.price * totalDays, 0) : 0} บาท
            </Typography>
            {additionalServices.filter(s => s.selected).map((service) => (
              <Typography key={service.id} variant="body1">
                {service.name}: {service.price * totalDays} บาท ({service.price} บาท x {totalDays} วัน)
              </Typography>
            ))}
            <Typography variant="h6" sx={{ mt: 2 }}>
              ยอดรวมทั้งสิ้น: {totalPrice} บาท
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  };

  // Render Step 3: Payment
  const renderPayment = () => {
    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ข้อมูลการชำระเงิน</Typography>
              <Typography variant="body1" gutterBottom>หมายเลขการจอง: {currentBookingId}</Typography>
              <Typography variant="body1" gutterBottom>จำนวนเงินที่ต้องชำระ: {totalPrice} บาท</Typography>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" gutterBottom>ชื่อบัญชี: บริษัท ห้องพักสวย จำกัด</Typography>
              <Typography variant="body1" gutterBottom>เลขบัญชี: 123-4-56789-0</Typography>
              <Typography variant="body1" gutterBottom>ธนาคาร: กสิกรไทย</Typography>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Box
                  component="img"
                  sx={{
                    height: 180,
                    width: 180,
                    border: '1px solid #ddd',
                    p: 1
                  }}
                  alt="QR Code สำหรับการชำระเงิน"
                  src="https://placehold.co/180x180/png?text=QR-Payment"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>แนบหลักฐานการชำระเงิน</Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  component="label"
                  color={paymentDetails.receiptImage ? "success" : "primary"}
                >
                  {paymentDetails.receiptImage ? "เปลี่ยนรูปสลิป" : "แนบรูปสลิปการโอน"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </Button>
                
                {paymentDetails.receiptImage && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    ไฟล์ที่แนบ: {paymentDetails.receiptImage.name}
                  </Typography>
                )}
                
                {errors.receiptImage && (
                  <FormHelperText error>{errors.receiptImage}</FormHelperText>
                )}
                
                {paymentDetails.receiptImage && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={URL.createObjectURL(paymentDetails.receiptImage)}
                      alt="Receipt"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Render Confirmation
  const renderConfirmation = () => {
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>การจองเสร็จสมบูรณ์</Typography>
        <Typography variant="body1">
          หมายเลขการจองของคุณคือ: {currentBookingId}
        </Typography>
        <Typography variant="body1" gutterBottom>
          เราได้รับข้อมูลการจองและหลักฐานการชำระเงินของคุณแล้ว โปรดรอการยืนยันจากเจ้าหน้าที่
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleReset} 
          sx={{ mt: 2 }}
        >
          จองห้องพักเพิ่มเติม
        </Button>
      </Box>
    );
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          ระบบจองห้องพัก
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === steps.length ? (
          renderConfirmation()
        ) : (
          <>
            {activeStep === 0 && renderBookingDetails()}
            {activeStep === 1 && renderCalculateCosts()}
            {activeStep === 2 && renderPayment()}
            
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                ย้อนกลับ
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button 
                onClick={handleNext}
                disabled={loading}
                variant="contained"
              >
                {activeStep === steps.length - 1 ? 'ยืนยันการจอง' : 'ถัดไป'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Booking;