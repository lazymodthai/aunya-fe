import {
  Box,
  Button,
  Divider,
  Grid,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CustomDatePicker from "../components/booking/CustomDatePicker";
import { useEffect, useState } from "react";
import NumberField from "../components/booking/NumberField";
import { isValidThaiPhoneNumber } from "../utils/input";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CheckIcon from "@mui/icons-material/Check";
import { addDays, format, parseISO, set } from "date-fns";
import { FormatDate, formatDateTime } from "../utils/date";
import AuthAPI from "../apis/auth";
import BookingAPI from "../apis/booking";
import Loading from "../components/Loading";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useClipboard } from 'use-clipboard-copy';

type Props = {
  bookingData: any;
};

function Booking(props: Props) {
  const isMobile = useMediaQuery("(max-width:800px)");
  const [checkinDate, setCheckinDate] = useState<Date | null>(null);
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(null);
  const [guestNumber, setGuestNumber] = useState<number | null>(null);
  const [additionGuestNumber, setAdditionGuestNumber] = useState<number | null>(null);
  const [additionTowel, setAdditionTowel] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copying, setCopying] = useState<boolean>(false);
  const [disableDate, setDisableDate] = useState<any[]>([])

  const [refCode, setRefCode] = useState<string>("");

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const getDate = async () => {
    try {
      setLoading(true);
      const { data } = await BookingAPI.getBookedDate();
      console.log(data)
      setDisableDate(data)
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{
    getDate()
  },[])

  const handleBook = async () => {
    if (isInvalidPhoneNumber) return;
    const payload = {
      checkinDate: checkinDate,
      checkoutDate: checkoutDate,
      guestNumber: guestNumber,
      additionGuestNumber: additionGuestNumber,
      name: name,
      phoneNumber: phoneNumber,
    };
    try {
      setLoading(true);
      const { data } = await BookingAPI.book(payload);
      setRefCode(data.refCode);
      setStep(2);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      await handleBook();
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

  const clipboard = useClipboard();

  const handleCopy = async () => {
    clipboard.copy('123-456-789-0');
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <CustomDatePicker
              label="เลือกวันที่ Check-in"
              onChange={(e) => {
                setCheckinDate(e);
                setCheckoutDate(null);
              }}
              value={checkinDate}
              sx={{ width: "100%" }}
              disabledDates={disableDate}
              maximumMonth={3}
            />
            <CustomDatePicker
              label="เลือกวันที่ Check-out"
              onChange={(e) => setCheckoutDate(e)}
              value={checkoutDate}
              sx={{ width: "100%" }}
              minDate={addDays(checkinDate || new Date(), 1)}
              checkInDate={checkinDate}
              disabledDates={disableDate}
            />
            <NumberField
              label="จำนวนผู้เข้าพัก"
              onChange={(e) => {
                const num = parseInt(e.target.value);
                if (num <= 0) {
                  setGuestNumber(1);
                  return;
                }
                if (num > 10) {
                  setGuestNumber(10);
                  return;
                } else {
                  setGuestNumber(num);
                  setAdditionGuestNumber(null);
                }
              }}
              value={guestNumber}
              sx={{ width: "100%" }}
            />
            <NumberField
              label="ที่นอนเสริม (ชุดละ 300 บาท)"
              onChange={(e) => {
                const num = parseInt(e.target.value);
                if (num > 2) {
                  setAdditionGuestNumber(2);
                  return;
                } else {
                  setAdditionGuestNumber(num);
                }
              }}
              value={additionGuestNumber}
              disabled={!guestNumber || guestNumber < 10}
              sx={{ width: "100%" }}
            />
            <NumberField
              label="เพิ่มผ้าขนหนู+ผ้าเช็ดผม (ชุดละ 100 บาท)"
              onChange={(e) => {
                const num = parseInt(e.target.value);
                if (num > 20) {
                  setAdditionTowel(20);
                  return;
                } else {
                  setAdditionTowel(num);
                }
              }}
              value={additionTowel}
              sx={{ width: "100%" }}
            />
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
              helperText={isInvalidPhoneNumber ? "เบอร์โทรศัพท์ไม่ถูกต้อง" : ""}
            />
          </>
        );

      case 1:
        return (
          <>
            <Typography sx={{display: 'flex', gap: 1}}>
              Check-in: <span style={{color: "#0b538eff"}}>วันที่ {FormatDate(checkinDate!, 4)}</span>
            </Typography>
            <Typography sx={{display: 'flex', gap: 1}}>
              Check-out: <span style={{color: "#0b538eff"}}>วันที่ {FormatDate(checkoutDate!, 4)}</span>
            </Typography>
            <Typography sx={{display: 'flex', gap: 1}}>
              รวมเข้าพัก: 
              <span style={{color: "#0b538eff"}}>{(checkoutDate!.getTime() - checkinDate!.getTime()) /
                (1000 * 60 * 60 * 24)} คืน</span>
            </Typography>
            <Typography sx={{display: 'flex', gap: 1}}>
              จำนวนผู้เข้าพัก: <span style={{color: "#0b538eff"}}>{guestNumber} คน</span>
            </Typography>
            <Typography sx={{display: 'flex', gap: 1}}>ที่นอนเสริม: <span style={{color: "#0b538eff"}}>{additionGuestNumber} ชุด</span></Typography>
            <Typography sx={{display: 'flex', gap: 1}}>ชุดผ้าขนหนู+ผ้าเช็ดผม(เพิ่มเติม): <span style={{color: "#0b538eff"}}>{additionTowel} ชุด</span></Typography>
            <Typography sx={{display: 'flex', gap: 1}}>ชื่อผู้จอง: <span style={{color: "#0b538eff"}}>{name}</span></Typography>
            <Typography sx={{display: 'flex', gap: 1}}>เบอร์โทรศัพท์มือถือ: <span style={{color: "#0b538eff"}}>{phoneNumber}</span></Typography>
          </>
        );

      case 2:
        return (
          <>
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
              ยอดชำระของท่าน
            </Typography>

            <Typography>
              ค่าห้องพัก{" "}
              {(
                (5000 * (checkoutDate!.getTime() - checkinDate!.getTime())) /
                (1000 * 60 * 60 * 24)
              ).toLocaleString("th-TH")}{" "}
              บาท
            </Typography>
            <Typography>
              เสริมที่นอน
              {((additionGuestNumber || 0) * 300).toLocaleString("th-TH")} บาท
            </Typography>
            <Typography>
              เซ็ตผ้าขนหนู+ผ้าเช็ดผม(เพิ่มเติม)
              {((additionTowel || 0) * 100).toLocaleString("th-TH")} บาท
            </Typography>
            <Typography>
              ค่ามัดจำ{" "}
              2,000 บาท <span style={{color: "#939393ff"}}>(คืนหลัง Check-out)</span>
            </Typography>
            <Typography sx={{fontSize: 18, fontWeight: 600}}>
              รวมยอดชำระ:
            </Typography>
            <Typography
              sx={{ fontSize: 24, fontWeight: 600, color: "#2196f3", mt: -2 }}
            >
              {(
                (5000 * (checkoutDate!.getTime() - checkinDate!.getTime())) /
                  (1000 * 60 * 60 * 24) +
                (additionGuestNumber || 0) * 300 + 2000
              ).toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            </Typography>
            <Divider />
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
              ช่องทางชำระเงิน:
            </Typography>
            <Typography sx={{ alignItems: "center", display: "flex", gap: 1 }}>
              ธนาคาร:{" "}
              <Box
                component={"img"}
                src={
                  "https://whatphone.net/wp-content/uploads/2018/10/new-k-plus-logo.png"
                }
                sx={{ width: 24 }}
              />
              <span style={{ fontWeight: 600, color: "#0dab2dff" }}>
                กสิกรไทย
              </span>
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              ชื่อบัญชี:{" "}
              <span style={{ fontWeight: 600, color: "#f36e21ff" }}>
                นาง สุจิตรา อ่อนคำ
              </span>
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              หมายเลขบัญชี:{" "}
              <span style={{ fontWeight: 600, color: "#f36e21ff" }}>
                123-456-789-0
              </span>
              <Box
                onClick={handleCopy}
                sx={{
                  cursor: "pointer",
                  // ป้องกันการ select text
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  // ป้องกันการ highlight บน mobile
                  WebkitTapHighlightColor: "transparent",
                  WebkitTouchCallout: "none",
                  // ป้องกันการ drag
                  WebkitUserDrag: "none",
                  KhtmlUserDrag: "none",
                  MozUserDrag: "none",
                  OUserDrag: "none",
                  userDrag: "none",
                }}
                display={"flex"}
                gap={1}
                alignItems={"center"}
                border={`1px solid ${copying ? "#077537ff" : "  #7d7d7dff"}`}
                borderRadius={2}
                p={0.5}
                fontSize={12}
                color={copying ? "#077537ff" : "#7d7d7dff"}
              >
                {copying ? (
                  <CheckCircleIcon
                    sx={{ width: 18, height: 18, color: "#077537ff" }}
                  />
                ) : (
                  <ContentCopyIcon
                    sx={{ width: 18, height: 18, color: "#7d7d7dff" }}
                  />
                )}
                {copying? `คัดลอกแล้ว`:`คัดลอก`}
              </Box>
            </Typography>
          </>
        );

      default:
        break;
    }
  };

  const steps = ["เลือกวันเข้าพัก", "ยืนยันรายการ", "ชำระเงิน"];

  return (
    <Grid
      container
      direction={"column"}
      gap={2}
      width={isMobile ? undefined : 600}
    >
      {loading && <Loading />}
      <Grid textAlign={"center"}>
        <Typography sx={{ fontSize: 24 }}>จองห้องพัก</Typography>
      </Grid>
      <Stepper activeStep={step} sx={{ mt: 2 }}>
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
              sx={{ height: 50, borderRadius: 2 }}
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
            endIcon={
              step === steps.length - 1 ? (
                <CheckIcon />
              ) : (
                <ArrowForwardIosIcon />
              )
            }
            sx={{ height: 50, borderRadius: 2 }}
            disabled={
              !checkinDate ||
              !checkoutDate ||
              !guestNumber ||
              !name ||
              !phoneNumber ||
              isInvalidPhoneNumber
            }
          >
            {step === steps.length - 1 ? "ยืนยัน" : "ถัดไป"}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Booking;
