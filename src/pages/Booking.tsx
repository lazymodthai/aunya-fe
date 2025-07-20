import {
  Button,
  Grid,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CustomDatePicker from "../components/booking/CustomDatePicker";
import { useState } from "react";
import NumberField from "../components/booking/NumberField";
import { isValidThaiPhoneNumber } from "../utils/input";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CheckIcon from '@mui/icons-material/Check';
import {addDays, format, parseISO} from 'date-fns'

type Props = {
  bookingData: any;
};

function Booking(props: Props) {
  const isMobile = useMediaQuery("(max-width:800px)");
  const [checkinDate, setCheckinDate] = useState<Date | null>(null);
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(null);
  const [guestNumber, setGuestNumber] = useState<number>(1);
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] =
    useState<boolean>(false);

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
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

  const handleSkip = () => {
    setStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(step);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setStep(0);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Grid>
              <CustomDatePicker
                label="เลือกวันที่ Check-in"
                onChange={(e) => {
                  setCheckinDate(e);
                  setCheckoutDate(null);
                }}
                value={checkinDate}
                sx={{ width: "100%" }}
                disabledDates={[new Date("2025-07-23"), new Date("2025-07-26")]}
              />
            </Grid>
            <Grid>
              <CustomDatePicker
                label="เลือกวันที่ Check-out"
                onChange={(e) => setCheckoutDate(e)}
                value={checkoutDate}
                sx={{ width: "100%" }}
                minDate={addDays(checkinDate || new Date(), 1)}
                checkInDate={checkinDate}
                disabledDates={[new Date("2025-07-23"), new Date("2025-07-26")]}
              />
            </Grid>
            <Grid>
              <NumberField
                label="จำนวนผู้เข้าพัก"
                onChange={(e) => {
                  const num = parseInt(e.target.value);
                  if (num <= 0) {
                    setGuestNumber(1);
                    return;
                  } else {
                    setGuestNumber(num);
                  }
                }}
                value={guestNumber}
                sx={{ width: "100%" }}
              />
            </Grid>
            <Grid>
              <TextField
                label="ชื่อผู้จอง"
                variant="outlined"
                onChange={(e) => setName(e.target.value)}
                value={name}
                slotProps={{
                  input: {
                    inputProps: {
                      maxLength: 50,
                    },
                  },
                }}
                sx={{ width: "100%" }}
              />
            </Grid>

            <Grid>
              <TextField
                label="เบอร์โทรศัพท์มือถือ"
                variant="outlined"
                onChange={(e) => {
                  setIsInvalidPhoneNumber(
                    !isValidThaiPhoneNumber(e.target.value)
                  );
                  setPhoneNumber(e.target.value.replace(/\D/g, ""));
                }}
                value={phoneNumber}
                sx={{ width: "100%" }}
                slotProps={{
                  input: {
                    inputProps: {
                      maxLength: 10,
                      pattern: "[0-9]*",
                      inputMode: "numeric",
                    },
                  },
                }}
                error={isInvalidPhoneNumber}
                helperText={
                  isInvalidPhoneNumber ? "เบอร์โทรศัพท์ไม่ถูกต้อง" : ""
                }
              />
            </Grid>
          </>
        );
      default:
        break;
    }
  };

  const steps = ["เลือกวันเข้าพัก", "ยืนยันรายการ", "ชำระเงิน"];

  return (
    <Grid container direction={"column"} gap={2} width={isMobile ? undefined : 600}>
      <Grid textAlign={'center'}>
        <Typography sx={{fontSize: 24}}>จองห้องพัก</Typography>
      </Grid>
      <Stepper activeStep={step} sx={{mt: 2}}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
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
        direction={"column"}
        gap={2}
        sx={{ border: "1px solid #A9B5DF", padding: 2, borderRadius: 2 }}
      >
        {renderStep()}
      </Grid>
      <Grid
        container
        direction={"row"}
        spacing={2}
        justifyContent={"center"}
        sx={{ mt: 2 }}
        size={12}
      >
        {step > 0 && (
          <Grid size={6}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              disabled={step === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIosIcon />}
              sx={{height: 50, borderRadius: 2}}
            >
              ย้อนกลับ
            </Button>
          </Grid>
        )}
        <Grid size={step === 0 ? 12 : 6}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleNext}
            endIcon={step === steps.length - 1 ? <CheckIcon /> : <ArrowForwardIosIcon />}
            sx={{height: 50, borderRadius: 2}}
          >
            {step === steps.length - 1 ? "ยืนยัน" : "ถัดไป"}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Booking;
