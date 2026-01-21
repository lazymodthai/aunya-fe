import {
  Box,
  Button,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useState } from 'react';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CheckIcon from '@mui/icons-material/Check';
import { format } from 'date-fns';
import BookingAPI, { BookingPayload } from '@apis/booking';
import PricesAPI, { DiscountCode, PriceDetail } from '@apis/prices';
import Loading from '@components/Loading';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UploadfileAPI } from '@apis/upload';
import { userSelector } from '@store/slices/userSlice';
import { useSelector } from 'react-redux';

// Step Components
import DateSelectionStep from '@components/booking/steps/DateSelectionStep';
import ConfirmationStep from '@components/booking/steps/ConfirmationStep';
import PaymentStep from '@components/booking/steps/PaymentStep';
import SlipUploadStep from '@components/booking/steps/SlipUploadStep';
import SuccessStep from '@components/booking/steps/SuccessStep';

type Props = {
  bookingData: any;
};

// Constants
const QRcode = '1100400100824';
const QRname = 'นางสุจิตรา อ่อนคำ';
const additionGuestNumberPrice = 300;
const additionTowelPrice = 100;
const depositPrice = 2000;
const bankName = 'กรุงไทย';
const bankAccount = '7790516787';
const roomId = import.meta.env.VITE_ROOM_ID;

function Booking(props: Props) {
  const isMobile = useMediaQuery('(max-width:800px)');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userData } = useSelector(userSelector);

  // Form State
  const [checkinDate, setCheckinDate] = useState<Date | null>(null);
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(null);
  const [guestNumber, setGuestNumber] = useState<number | null>(null);
  const [additionGuestNumber, setAdditionGuestNumber] = useState<number | null>(null);
  const [additionTowel, setAdditionTowel] = useState<number | null>(null);
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [discountCode, setDiscountCode] = useState<string>('');

  // Price State
  const [roomPrices, setRoomPrices] = useState<PriceDetail[]>([]);
  const [totalRoomPrice, setTotalRoomPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [validatedDiscountData, setValidatedDiscountData] = useState<DiscountCode | null>(null);

  // UI State
  const [step, setStep] = useState<number>(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [disableDate, setDisableDate] = useState<any[]>([]);
  const [totalDate, setTotalDate] = useState<number>(0);

  // Booking State
  const [refCode, setRefCode] = useState<string>('');
  const [slipImages, setSlipImages] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const steps = ['เลือกวันเข้าพัก', 'ยืนยันรายการ', 'ชำระเงิน', 'ใบเสร็จ'];

  const isStepSkipped = (step: number) => skipped.has(step);

  const getDate = async () => {
    try {
      setLoading(true);
      const { data } = await BookingAPI.getBookedDate();
      setDisableDate(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (userData.id) {
      setName(userData.firstName + ' ' + userData.lastName);
      setPhoneNumber(userData.phoneNumber);
    }
  }, [userData]);

  useEffect(() => {
    if (step === 0) getDate();
  }, [step]);

  useEffect(() => {
    if (checkinDate && checkoutDate) {
      setTotalDate(checkoutDate.getDate() - checkinDate.getDate());
    }
  }, [checkinDate, checkoutDate]);

  useEffect(() => {
    if (searchParams.get('startDate')) {
      setCheckinDate(new Date(String(searchParams.get('startDate'))));
    }
  }, [searchParams]);

  // Handlers
  const handleBook = async () => {
    if (isInvalidPhoneNumber || !checkinDate || !checkoutDate || !guestNumber || !name || !phoneNumber)
      return;

    const payload: BookingPayload = {
      checkinDate: format(checkinDate, 'yyyy-MM-dd'),
      checkoutDate: format(checkoutDate, 'yyyy-MM-dd'),
      guestNumber: guestNumber,
      additionGuestNumber: additionGuestNumber,
      name: name,
      phoneNumber: phoneNumber,
      totalPrice: totalPrice,
      roomId: roomId,
      customerId: userData.id,
    };

    try {
      setLoading(true);
      setErrorMessage('');
      const { data } = await BookingAPI.book(payload);
      setRefCode(data.refCode);
      setRoomPrices(data.prices.map((p: any) => ({ date: p.date, price: Number(p.price) })));
      setStep(2);
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error?.response?.data?.message || error?.message || 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSlip = async () => {
    const formData = new FormData();
    formData.append('file', slipImages[0]);
    formData.append('roomId', refCode);
    formData.append('userTell', phoneNumber);
    formData.append('typeslip', 'slip');

    try {
      setLoading(true);
      const { data } = await UploadfileAPI.uploadFile(formData);
      if (data.slipVerification?.code === '200000') {
        // Use discount code if valid
        if (validatedDiscountData && discountCode) {
          try {
            await PricesAPI.useDiscountCode(discountCode);
          } catch (error) {
            console.error('Error using discount code:', error);
          }
        }
        setStep(4);
      }
    } catch (e: any) {
      console.log(e.response?.data?.message);
      if (e.response?.data?.message === 'notfound  QR Code in file should upload picture is correct') {
        alert('ได้โปรดอัพรูปที่เป็น QR Code ของสลิปเงิน');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      await handleBook();
      return;
    }

    if (step === 3) {
      await handleUploadSlip();
      return;
    }

    if (step === 4) {
      navigate('/');
      return;
    }

    let newSkipped = skipped;
    if (isStepSkipped(step)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(step);
    }

    setStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePriceCalculated = (
    calculatedTotalPrice: number,
    calculatedRoomPrices: PriceDetail[],
    discount: number,
    discountType: 'amount' | 'percentage' | null
  ) => {
    setTotalPrice(calculatedTotalPrice);
    setRoomPrices(calculatedRoomPrices);
    setTotalRoomPrice(calculatedRoomPrices.reduce((acc, curr) => acc + curr.price, 0));
    setDiscountAmount(discount);
  };

  const handleDiscountCodeValidated = (isValid: boolean, discountData: DiscountCode | null) => {
    setValidatedDiscountData(isValid ? discountData : null);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <DateSelectionStep
            checkinDate={checkinDate}
            checkoutDate={checkoutDate}
            guestNumber={guestNumber}
            additionGuestNumber={additionGuestNumber}
            additionTowel={additionTowel}
            name={name}
            phoneNumber={phoneNumber}
            disableDate={disableDate}
            isInvalidPhoneNumber={isInvalidPhoneNumber}
            hasUserData={!!userData.firstName}
            additionGuestNumberPrice={additionGuestNumberPrice}
            additionTowelPrice={additionTowelPrice}
            onCheckinChange={setCheckinDate}
            onCheckoutChange={setCheckoutDate}
            onGuestNumberChange={setGuestNumber}
            onAdditionGuestNumberChange={setAdditionGuestNumber}
            onAdditionTowelChange={setAdditionTowel}
            onNameChange={setName}
            onPhoneNumberChange={(value, isInvalid) => {
              setPhoneNumber(value);
              setIsInvalidPhoneNumber(isInvalid);
            }}
          />
        );

      case 1:
        return (
          <ConfirmationStep
            checkinDate={checkinDate!}
            checkoutDate={checkoutDate!}
            totalDate={totalDate}
            guestNumber={guestNumber!}
            additionGuestNumber={additionGuestNumber}
            additionTowel={additionTowel}
            name={name}
            phoneNumber={phoneNumber}
            discountCode={discountCode}
            onDiscountCodeChange={setDiscountCode}
          />
        );

      case 2:
        return (
          <PaymentStep
            checkinDate={checkinDate!}
            checkoutDate={checkoutDate!}
            additionGuestNumber={additionGuestNumber}
            additionTowel={additionTowel}
            additionGuestNumberPrice={additionGuestNumberPrice}
            additionTowelPrice={additionTowelPrice}
            depositPrice={depositPrice}
            discountCode={discountCode}
            roomId={roomId}
            QRcode={QRcode}
            QRname={QRname}
            bankName={bankName}
            bankAccount={bankAccount}
            onPriceCalculated={handlePriceCalculated}
            onDiscountCodeValidated={handleDiscountCodeValidated}
          />
        );

      case 3:
        return <SlipUploadStep onSlipChange={setSlipImages} />;

      case 4:
        return (
          <SuccessStep
            refCode={refCode}
            name={name}
            phoneNumber={phoneNumber}
            checkinDate={checkinDate!}
            checkoutDate={checkoutDate!}
            totalDate={totalDate}
            guestNumber={guestNumber!}
            additionGuestNumber={additionGuestNumber}
            additionTowel={additionTowel}
            totalRoomPrice={totalRoomPrice}
            additionGuestNumberPrice={additionGuestNumberPrice}
            additionTowelPrice={additionTowelPrice}
            depositPrice={depositPrice}
            totalPrice={totalPrice}
            discountAmount={discountAmount}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Grid container direction={'column'} gap={2} width={isMobile ? undefined : 600}>
      {loading && <Loading />}
      <Grid textAlign={'center'}>
        <Typography sx={{ fontSize: 24 }}>จองห้องพัก</Typography>
      </Grid>
      <Stepper activeStep={step} sx={{ mt: 2 }}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: { optional?: React.ReactNode } = {};
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <Grid
        container
        direction={'column'}
        gap={2}
        sx={{ border: '1px solid #A9B5DF', padding: 2, borderRadius: 2 }}
      >
        {renderStep()}
        {errorMessage && (
          <Typography color="error" sx={{ textAlign: 'center' }}>
            {errorMessage}
          </Typography>
        )}
      </Grid>
      <Grid container direction={'row'} spacing={2} justifyContent={'center'} sx={{ mt: 2 }} size={12}>
        {step > 0 && step < 4 && (
          <Grid size={6}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              disabled={step === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIosIcon />}
              sx={{ height: 50, borderRadius: 2 }}
            >
              ย้อนกลับ
            </Button>
          </Grid>
        )}
        <Grid size={step === 0 || step === 4 ? 12 : 6}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleNext}
            endIcon={step === steps.length ? <CheckIcon /> : <ArrowForwardIosIcon />}
            sx={{ height: 50, borderRadius: 2 }}
            disabled={
              step !== 4 &&
              (!checkinDate || !checkoutDate || !guestNumber || !name || !phoneNumber || isInvalidPhoneNumber)
            }
          >
            {step === 4 ? 'กลับหน้าหลัก' : step === steps.length - 1 ? 'ยืนยัน' : 'ถัดไป'}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Booking;
