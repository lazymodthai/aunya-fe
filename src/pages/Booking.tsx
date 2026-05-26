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
      setTotalDate(checkoutDate.getDate() - checkinDate.getDate());
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
    <Grid container direction={'column'} gap={2} width={isMobile ? '100%' : 600}>
      {loading && <Loading />}
      <Grid textAlign={'center'}>
        <Typography sx={{ fontSize: 24 }}>{t("booking.title", "จองห้องพัก")}</Typography>
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
              {t("booking.buttons.back", "ย้อนกลับ")}
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
              (!checkinDate || !checkoutDate || !guestNumber || !name || !phoneNumber || isInvalidPhoneNumber || !acceptedPDPA)
            }
          >
            {step === 4
              ? t("booking.buttons.backToHome", "กลับหน้าหลัก")
              : step === steps.length - 1
              ? t("booking.buttons.confirm", "ยืนยัน")
              : t("booking.buttons.next", "ถัดไป")}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Booking;
