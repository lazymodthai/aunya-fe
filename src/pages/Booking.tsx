import {
  Box,
  Button,
  Chip,
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
import { format, differenceInCalendarDays } from 'date-fns';
import { parseLocalDate } from '@utils/date';
import BookingAPI, { BookingPayload } from '@apis/booking';
import PricesAPI, { DiscountCode, PriceDetail } from '@apis/prices';
import Loading from '@components/Loading';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UploadfileAPI } from '@apis/upload';
import { userSelector } from '@store/slices/userSlice';
import { useSelector } from 'react-redux';
import {
  fetchAppSettings,
  DEFAULT_EXTRA_BED_PRICE,
  DEFAULT_TOWEL_PRICE,
  DEFAULT_MAX_GUESTS,
  DEFAULT_EXTRA_BED_COUNT,
  DEFAULT_TOWEL_COUNT,
  DEFAULT_MAX_CHILDREN,
  DEFAULT_ADVANCE_BOOKING_MONTHS,
  DEPOSIT_PRICE,
  PROMPTPAY_QR_CODE,
  PROMPTPAY_NAME,
  BANK_NAME,
  BANK_ACCOUNT,
  ROOM_ID,
} from '@configs/app-settings';

// Step Components
import DateSelectionStep from '@components/booking/steps/DateSelectionStep';
import ConfirmationStep from '@components/booking/steps/ConfirmationStep';
import PaymentStep from '@components/booking/steps/PaymentStep';
import SlipUploadStep from '@components/booking/steps/SlipUploadStep';
import SuccessStep from '@components/booking/steps/SuccessStep';
import { BookingStatus } from '@constants/booking.enum';

import { useTranslation } from 'react-i18next';

type Props = {
  bookingData: any;
};

const QRcode = PROMPTPAY_QR_CODE;
const QRname = PROMPTPAY_NAME;
const depositPrice = DEPOSIT_PRICE;
const bankName = BANK_NAME;
const bankAccount = BANK_ACCOUNT;
const roomId = ROOM_ID;

function Booking(props: Props) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width:800px)');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userData } = useSelector(userSelector);

  // Settings from API
  const [additionGuestNumberPrice, setAdditionGuestNumberPrice] = useState(DEFAULT_EXTRA_BED_PRICE);
  const [additionTowelPrice, setAdditionTowelPrice] = useState(DEFAULT_TOWEL_PRICE);
  const [maxGuests, setMaxGuests] = useState(DEFAULT_MAX_GUESTS);
  const [maxChildren, setMaxChildren] = useState(DEFAULT_MAX_CHILDREN);
  const [maxExtraBeds, setMaxExtraBeds] = useState(DEFAULT_EXTRA_BED_COUNT);
  const [maxTowels, setMaxTowels] = useState(DEFAULT_TOWEL_COUNT);
  const [advanceBookingMonths, setAdvanceBookingMonths] = useState(DEFAULT_ADVANCE_BOOKING_MONTHS);

  // Form State
  const [checkinDate, setCheckinDate] = useState<Date | null>(null);
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(null);
  const [guestNumber, setGuestNumber] = useState<number | null>(null);
  const [childrenNumber, setChildrenNumber] = useState<number | null>(null);
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
  const [disabledDateRange, setDisabledDateRange] = useState<any[]>([]);
  const [disabledDates, setDisabledDates] = useState<any[]>([]);
  const [totalDate, setTotalDate] = useState<number>(0);

  // Booking State
  const [refCode, setRefCode] = useState<string>('');
  const [slipImages, setSlipImages] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [isOnlyDeposit, setIsOnlyDeposit] = useState<boolean>(false);
  const [actualDeposit, setActualDeposit] = useState<number>(depositPrice);
  const [acceptedPDPA, setAcceptedPDPA] = useState<boolean>(false);

  const steps = [
    t('booking.steps.dates', 'เลือกวันเข้าพัก'),
    t('booking.steps.confirm', 'ยืนยันรายการ'),
    t('booking.steps.payment', 'ชำระเงิน'),
    t('booking.steps.receipt', 'ใบเสร็จ'),
  ];

  const isStepSkipped = (step: number) => skipped.has(step);

  const getDate = async () => {
    try {
      setLoading(true);
      const { data } = await BookingAPI.getBookedDate();
      setDisabledDateRange(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getAllDisabledDate = async () => {
    try {
      setLoading(true);
      const { data } = await BookingAPI.getAllDisabledDate();
      setDisabledDates(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings from API
  useEffect(() => {
    fetchAppSettings().then((s) => {
      setAdditionGuestNumberPrice(s.extraBedPrice);
      setAdditionTowelPrice(s.towelPrice);
      setMaxGuests(s.maxGuests);
      setMaxChildren(s.maxChildren);
      setMaxExtraBeds(s.extraBedCount);
      setMaxTowels(s.towelCount);
      setAdvanceBookingMonths(s.advanceBookingMonths);
    });
  }, []);

  // Effects
  useEffect(() => {
    if (userData.id) {
      setName(userData.firstName + ' ' + userData.lastName);
      setPhoneNumber(userData.phoneNumber);
    }
  }, [userData]);

  useEffect(() => {
    if (step === 0) {
      // getDate();
      getAllDisabledDate();
    }
  }, [step]);

  useEffect(() => {
    if (checkinDate && checkoutDate) {
      setTotalDate(Math.max(1, differenceInCalendarDays(checkoutDate, checkinDate)));
    }
  }, [checkinDate, checkoutDate]);

  useEffect(() => {
    if (searchParams.get('startDate')) {
      setCheckinDate(parseLocalDate(String(searchParams.get('startDate'))));
    }
  }, [searchParams]);

  // Handlers
  const handleBook = async () => {
    if (isInvalidPhoneNumber || !checkinDate || !checkoutDate || !guestNumber || !name || !phoneNumber)
      return;

    const currentPaidAmount = isOnlyDeposit ? actualDeposit : totalPrice;
    const currentRemainingAmount = isOnlyDeposit ? totalPrice - actualDeposit : 0;

    const payload: BookingPayload = {
      checkinDate: format(checkinDate, 'yyyy-MM-dd'),
      checkoutDate: format(checkoutDate, 'yyyy-MM-dd'),
      guestNumber: guestNumber,
      childrenNumber: childrenNumber || 0,
      additionGuestNumber: additionGuestNumber || 0,
      name: name,
      phoneNumber: phoneNumber,
      totalPrice: totalPrice,
      roomId: roomId,
      customerId: userData.id,
      discount: discountAmount,
      isOnlyDeposit: isOnlyDeposit,
      depositAmount: actualDeposit,
      paidAmount: currentPaidAmount,
      remainingAmount: currentRemainingAmount,
      additionTowel: additionTowel || 0,
    };

    try {
      setLoading(true);
      setErrorMessage('');
      const { data } = await BookingAPI.book(payload);
      setRefCode(data.refCode);
      setBookingId(data.id);
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
    formData.append('type', "upload-slip");

    try {
      setLoading(true);
      const { data } = await UploadfileAPI.uploadFile(formData);
      if (data) {
        // Use discount code if valid
        if (validatedDiscountData && discountCode) {
          try {
            await PricesAPI.useDiscountCode(discountCode);
          } catch (error) {
            console.error('Error using discount code:', error);
          }
        }
        await BookingAPI.updateBookingStatus(bookingId, { status: BookingStatus.PENDING });
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
    discountData: DiscountCode | null,
    nights: number,
    calculatedDeposit: number
  ) => {
    setTotalPrice(calculatedTotalPrice);
    setRoomPrices(calculatedRoomPrices);
    setTotalRoomPrice(calculatedRoomPrices.reduce((acc, curr) => acc + curr.price, 0));
    setDiscountAmount(discount);
    setValidatedDiscountData(discountData);
    setTotalDate(nights);
    setActualDeposit(calculatedDeposit);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <DateSelectionStep
            checkinDate={checkinDate}
            checkoutDate={checkoutDate}
            guestNumber={guestNumber}
            childrenNumber={childrenNumber}
            additionGuestNumber={additionGuestNumber}
            additionTowel={additionTowel}
            name={name}
            phoneNumber={phoneNumber}
            // disabledDateRange={disabledDateRange}
            disabledDates={disabledDates}
            isInvalidPhoneNumber={isInvalidPhoneNumber}
            hasUserData={!!userData.firstName}
            additionGuestNumberPrice={additionGuestNumberPrice}
            additionTowelPrice={additionTowelPrice}
            maxGuests={maxGuests}
            maxChildren={maxChildren}
            maxExtraBeds={maxExtraBeds}
            maxTowels={maxTowels}
            advanceBookingMonths={advanceBookingMonths}
            acceptedPDPA={acceptedPDPA}
            onCheckinChange={setCheckinDate}
            onCheckoutChange={setCheckoutDate}
            onGuestNumberChange={setGuestNumber}
            onChildrenNumberChange={setChildrenNumber}
            onAdditionGuestNumberChange={setAdditionGuestNumber}
            onAdditionTowelChange={setAdditionTowel}
            onNameChange={setName}
            onPhoneNumberChange={(value, isInvalid) => {
              setPhoneNumber(value);
              setIsInvalidPhoneNumber(isInvalid);
            }}
            onAcceptedPDPAChange={setAcceptedPDPA}
          />
        );

      case 1:
        return (
          <ConfirmationStep
            checkinDate={checkinDate!}
            checkoutDate={checkoutDate!}
            guestNumber={guestNumber!}
            childrenNumber={childrenNumber}
            additionGuestNumber={additionGuestNumber}
            additionTowel={additionTowel}
            name={name}
            phoneNumber={phoneNumber}
            discountCode={discountCode}
            roomId={roomId}
            additionGuestNumberPrice={additionGuestNumberPrice}
            additionTowelPrice={additionTowelPrice}
            depositPrice={depositPrice}
            isOnlyDeposit={isOnlyDeposit}
            onIsOnlyDepositChange={setIsOnlyDeposit}
            onDiscountCodeChange={setDiscountCode}
            onPriceCalculated={handlePriceCalculated}
          />
        );

      case 2:
        return (
          <PaymentStep
            totalRoomPrice={totalRoomPrice}
            additionGuestNumber={additionGuestNumber}
            additionTowel={additionTowel}
            additionGuestNumberPrice={additionGuestNumberPrice}
            additionTowelPrice={additionTowelPrice}
            depositPrice={actualDeposit}
            discountAmount={discountAmount}
            totalPrice={totalPrice}
            QRcode={QRcode}
            QRname={QRname}
            bankName={bankName}
            bankAccount={bankAccount}
            isOnlyDeposit={isOnlyDeposit}
            paidAmount={isOnlyDeposit ? actualDeposit : totalPrice}
            remainingAmount={isOnlyDeposit ? totalPrice - actualDeposit : 0}
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
            childrenNumber={childrenNumber}
            additionGuestNumber={additionGuestNumber}
            additionTowel={additionTowel}
            totalRoomPrice={totalRoomPrice}
            additionGuestNumberPrice={additionGuestNumberPrice}
            additionTowelPrice={additionTowelPrice}
            depositPrice={actualDeposit}
            totalPrice={totalPrice}
            discountAmount={discountAmount}
            isOnlyDeposit={isOnlyDeposit}
            paidAmount={isOnlyDeposit ? actualDeposit : totalPrice}
            remainingAmount={isOnlyDeposit ? totalPrice - actualDeposit : 0}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto', px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 4 } }}>
      {loading && <Loading />}

      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Chip
          label={`✨ ${t('booking.badge', 'อันหยา พูลวิลล่า • ระบบจองห้องพัก')}`}
          size="small"
          sx={{
            bgcolor: 'rgba(176, 48, 82, 0.08)',
            color: '#B03052',
            fontWeight: 700,
            fontSize: '0.78rem',
            mb: 1.5,
            px: 1,
            py: 0.5,
            borderRadius: '12px',
          }}
        />
        <Typography
          variant="h4"
          fontWeight={800}
          color="#1e293b"
          sx={{
            fontSize: { xs: '1.6rem', sm: '2.1rem' },
            letterSpacing: '-0.5px',
          }}
        >
          {t('booking.title', 'จองห้องพัก')}
        </Typography>
      </Box>

      {/* Modern Stepper */}
      <Box sx={{ mb: 3.5 }}>
        <Stepper
          activeStep={step}
          alternativeLabel
          sx={{
            '& .MuiStepIcon-root': {
              color: '#e2e8f0',
              width: 32,
              height: 32,
              '&.Mui-active': {
                color: '#B03052',
              },
              '&.Mui-completed': {
                color: '#16a34a',
              },
            },
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              fontWeight: 500,
              mt: 0.8,
              '&.Mui-active': {
                fontWeight: 700,
                color: '#B03052',
              },
              '&.Mui-completed': {
                fontWeight: 600,
                color: '#1e293b',
              },
            },
            '& .MuiStepConnector-line': {
              borderColor: '#e2e8f0',
              borderTopWidth: 2,
            },
          }}
        >
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
      </Box>

      {/* Form Content Card */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          p: { xs: 2.5, sm: 3.5 },
          position: 'relative',
        }}
      >
        {renderStep()}

        {errorMessage && (
          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2.5, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
            <Typography variant="body2" color="error.main" sx={{ textAlign: 'center', fontWeight: 600 }}>
              {errorMessage}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Action Navigation Buttons */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {step > 0 && step < 4 && (
          <Grid size={{ xs: 6 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleBack}
              startIcon={<ArrowBackIosIcon sx={{ fontSize: 14 }} />}
              sx={{
                height: 48,
                borderRadius: 3,
                borderColor: '#cbd5e1',
                color: '#475569',
                fontWeight: 600,
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
              }}
            >
              {t('booking.buttons.back', 'ย้อนกลับ')}
            </Button>
          </Grid>
        )}
        <Grid size={{ xs: step === 0 || step === 4 ? 12 : 6 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleNext}
            endIcon={step === steps.length ? <CheckIcon /> : <ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
            sx={{
              height: 48,
              borderRadius: 3,
              bgcolor: '#B03052',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 4px 14px rgba(176, 48, 82, 0.25)',
              '&:hover': { bgcolor: '#962342', boxShadow: '0 6px 18px rgba(176, 48, 82, 0.35)' },
              '&.Mui-disabled': {
                bgcolor: '#e2e8f0',
                color: '#94a3b8',
              },
            }}
            disabled={
              step !== 4 &&
              (!checkinDate || !checkoutDate || !guestNumber || !name || !phoneNumber || isInvalidPhoneNumber || !acceptedPDPA)
            }
          >
            {step === 4
              ? t('booking.buttons.backToHome', 'กลับหน้าหลัก')
              : step === steps.length - 1
              ? t('booking.buttons.confirm', 'ยืนยัน')
              : t('booking.buttons.next', 'ถัดไป')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Booking;
