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
import CustomDatePicker from "@components/booking/CustomDatePicker";
import { useEffect, useState } from "react";
import NumberField from "@components/booking/NumberField";
import { formatAccountNumber, isValidThaiPhoneNumber } from "@utils/input";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CheckIcon from "@mui/icons-material/Check";
import { addDays, format } from "date-fns";
import { FormatDate } from "@utils/date";
import BookingAPI, { BookingInterface } from "@apis/booking";
import Loading from "@components/Loading";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useClipboard } from 'use-clipboard-copy';
import QRPayment from "@components/booking/QRPayment";
import MultiImageUpload from "@components/MultiImageUpload";
import { useSearchParams, useNavigate } from "react-router-dom";
import { UploadfileAPI } from "@apis/upload";
import { userSelector } from "@store/slices/userSlice";
import { useSelector } from "react-redux";

type Props = {
  bookingData: any;
};

const QRcode = '1100400100824'
const QRname = 'นางสุจิตรา อ่อนคำ'
// const roomPrice = 5000
const additionGuestNumberPrice = 300
const additionTowelPrice = 100
const depositPrice = 2000
const bankName = 'กรุงไทย'
const bankAccount = '7790516787'
const roomId = import.meta.env.VITE_ROOM_ID

function Booking(props: Props) {
  const isMobile = useMediaQuery("(max-width:800px)");
  const [checkinDate, setCheckinDate] = useState<Date | null>(null);
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(null);
  const [guestNumber, setGuestNumber] = useState<number | null>(null);
  const [additionGuestNumber, setAdditionGuestNumber] = useState<number | null>(null);
  const [additionTowel, setAdditionTowel] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [discountCode, setDiscountCode] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [percentageDiscount, setPercentageDiscount] = useState<number>(0);
  const [roomPrices, setRoomPrices] = useState<{ date: string, price: number }[]>([]);
  const [totalRoomPrice, setTotalRoomPrice] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);

  const [step, setStep] = useState<number>(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copying, setCopying] = useState<boolean>(false);
  const [disableDate, setDisableDate] = useState<any[]>([])
  const [totalDate, setTotalDate] = useState<number>(0)
  const [totalPrice, setTotalPrice] = useState<number>(0)

  const [refCode, setRefCode] = useState<string>("");
  const [slipImages, setSlipImages] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { userData } = useSelector(userSelector)

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const getDate = async () => {
    try {
      setLoading(true);
      const { data } = await BookingAPI.getBookedDate();
      setDisableDate(data)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userData.id) {
      setName(userData.firstName + ' ' + userData.lastName)
      setPhoneNumber(userData.phoneNumber)
    }
  }, [userData])

  useEffect(() => {
    if (step === 0) getDate()
  }, [step])

  useEffect(() => {
    if (checkinDate && checkoutDate) {
      setTotalDate(
        (checkoutDate!.getDate() - checkinDate!.getDate())
      );
    }
  }, [checkinDate, checkoutDate])

  useEffect(() => {
    setTotalRoomPrice(roomPrices.reduce((accumulator, currentValue) => accumulator + currentValue.price, 0))
  }, [roomPrices])

  useEffect(() => {
    if (totalDate) {
      setTotalPrice(
        totalRoomPrice +
        (additionGuestNumber || 0) * additionGuestNumberPrice +
        (additionTowel || 0) * additionTowelPrice +
        depositPrice
      );
    }
  }, [totalDate, additionGuestNumber, additionTowel, totalRoomPrice]);

  useEffect(() => {
    if (searchParams.get('startDate')) {
      setCheckinDate(new Date(String(searchParams.get('startDate'))))
    }
  }, [searchParams])

  const handleBook = async () => {
    if (isInvalidPhoneNumber || !checkinDate || !checkoutDate || !guestNumber || !name || !phoneNumber) return;
    const payload: BookingInterface = {
      checkinDate: format(checkinDate, 'yyyy-MM-dd'),
      checkoutDate: format(checkoutDate, 'yyyy-MM-dd'),
      guestNumber: guestNumber,
      additionGuestNumber: additionGuestNumber,
      name: name,
      phoneNumber: phoneNumber,
      totalPrice: totalPrice,
      roomId: roomId
    };
    try {
      setLoading(true);
      setErrorMessage(""); // ล้าง error message เก่า
      const { data } = await BookingAPI.book(payload);
      setRefCode(data.refCode);
      setRoomPrices(data.prices.map((p: any) => ({ date: p.date, price: Number(p.price) })))
      setStep(2);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.response?.data?.message || error?.message || "เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง";
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
    formData.append('typeslip', "slip");

    try {
      const { data } = await UploadfileAPI.uploadFile(formData);
      console.log('data', data.slipVerification?.code === "200000");
      if (data.slipVerification.code === "200000") {
        setStep(4);
      }
    } catch (e: any) {
      console.log(e.response.data.message);
      if (e.response.data.message === "notfound  QR Code in file should upload picture is correct") {
        alert("ได้โปรดอัพรูปที่เป็น QR Code ของสลิปเงิน")
      }
    }
  }

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
      navigate("/")
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

  const clipboard = useClipboard();

  const handleCopy = async () => {
    clipboard.copy(bankAccount);
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
              label={`ที่นอนเสริม (ชุดละ ${additionGuestNumberPrice} บาท)`}
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
              label={`เพิ่มผ้าขนหนู+ผ้าเช็ดผม (ชุดละ ${additionTowelPrice} บาท)`}
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
              disabled={!!userData.firstName}
            />
            <TextField
              label="เบอร์โทรศัพท์มือถือ"
              variant="outlined"
              onChange={(e) => {
                setIsInvalidPhoneNumber(
                  !!userData.phoneNumber ? false : !isValidThaiPhoneNumber(e.target.value)
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
              disabled={!!userData.phoneNumber}
            />
          </>
        );

      case 1:
        return (
          <>
            <Typography sx={{ display: "flex", gap: 1 }}>
              {`Check-in: `}
              <span style={{ color: "#0b538eff" }}>
                วันที่ {FormatDate(checkinDate!, 4)}
              </span>
            </Typography>
            <Typography sx={{ display: "flex", gap: 1 }}>
              {`Check-out: `}
              <span style={{ color: "#0b538eff" }}>
                วันที่ {FormatDate(checkoutDate!, 4)}
              </span>
            </Typography>
            <Typography sx={{ display: "flex", gap: 1 }}>
              รวมเข้าพัก:
              <span style={{ color: "#0b538eff" }}>
                {`${totalDate} `}
                คืน
              </span>
            </Typography>
            <Typography sx={{ display: "flex", gap: 1 }}>
              จำนวนผู้เข้าพัก:{" "}
              <span style={{ color: "#0b538eff" }}>{guestNumber} คน</span>
            </Typography>
            {!!additionGuestNumber &&
              <Typography sx={{ display: "flex", gap: 1 }}>
                ที่นอนเสริม:{" "}
                <span style={{ color: "#57768fff" }}>
                  {additionGuestNumber} ชุด
                </span>
              </Typography>
            }
            {!!additionTowel &&
              <Typography sx={{ display: "flex", gap: 1 }}>
                ชุดผ้าขนหนู+ผ้าเช็ดผม(เพิ่มเติม):{" "}
                <span style={{ color: "#0b538eff" }}>{additionTowel} ชุด</span>
              </Typography>
            }
            <Typography sx={{ display: "flex", gap: 1 }}>
              ชื่อผู้จอง: <span style={{ color: "#0b538eff" }}>{name}</span>
            </Typography>
            <Typography sx={{ display: "flex", gap: 1 }}>
              เบอร์โทรศัพท์มือถือ:{" "}
              <span style={{ color: "#0b538eff" }}>{phoneNumber}</span>
            </Typography>
            <Divider />
            <TextField
              label="รหัสส่วนลด (ถ้ามี)"
              variant="outlined"
              onChange={(e) => setDiscountCode(e.target.value)}
              value={discountCode}
              sx={{ width: "100%" }}
              slotProps={{
                input: {
                  inputProps: {
                    maxLength: 10,
                  },
                },
              }}
            />
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
                totalRoomPrice
              ).toLocaleString("th-TH")}{" "}
              บาท
            </Typography>
            <Typography>
              {`เสริมที่นอน ${((additionGuestNumber || 0) * additionGuestNumberPrice).toLocaleString(
                "th-TH"
              )} บาท`}
            </Typography>
            <Typography>
              {`เซ็ตผ้าขนหนู+ผ้าเช็ดผม(เพิ่มเติม) ${(
                (additionTowel || 0) * additionTowelPrice
              ).toLocaleString("th-TH")} บาท`}
            </Typography>
            <Typography>
              {`ค่ามัดจำ ${depositPrice.toLocaleString("th-TH")} บาท `}
              <span style={{ color: "#939393ff" }}>(คืนหลัง Check-out)</span>
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
              {`รวมยอดชำระทั้งสิ้น:`}
            </Typography>
            <Typography
              sx={{ fontSize: 24, fontWeight: 600, color: "#15a13aff", mt: -2 }}
            >
              {totalPrice.toLocaleString("th-TH", {
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
                  "https://e7.pngegg.com/pngimages/591/354/png-clipart-krung-thai-bank-money-credit-kasikornbank-bank-blue-text-thumbnail.png"
                }
                sx={{ width: 24 }}
              />
              <span style={{ fontWeight: 600, color: "#00A3E3" }}>
                {bankName}
              </span>
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              ชื่อบัญชี:{" "}
              <span style={{ fontWeight: 600, color: "#00A3E3" }}>
                {QRname}
              </span>
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              หมายเลขบัญชี:{" "}
              <span style={{ fontWeight: 600, color: "#00A3E3" }}>
                {formatAccountNumber(bankAccount)}
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
                {copying ? `คัดลอกแล้ว` : `คัดลอก`}
              </Box>
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
              หรือโอนผ่าน QR Payment:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center', alignItems: 'center', mt: 1, p: 2, borderRadius: 2, border: '1px solid #08080809' }}>
              <QRPayment qrId={QRcode} value={totalPrice} />

              <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                {QRcode.slice(0, 0) + 'x-xxxx-xxxx' + QRcode.slice(9).replace(/(\d)(\d{2})(\d)/, "$1-$2-$3")}
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                {QRname}
              </Typography>
            </Box>
          </>
        );

      case 3:
        return <>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            แนบสลิปชำระเงิน
          </Typography>
          <Box sx={{ height: 400 }}>
            <MultiImageUpload
              maxImages={1}
              minHeight="370px"
              onImagesChange={(files, base64s) => {
                setSlipImages(files);
              }}
            />
          </Box>
        </>;

      case 4:
        return <>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            textAlign: 'center'
          }}>
            {/* Success Icon */}
            <CheckCircleIcon sx={{ fontSize: 80, color: '#15a13aff' }} />

            <Typography sx={{ fontSize: 24, fontWeight: 600, color: '#15a13aff' }}>
              จองห้องพักสำเร็จ!
            </Typography>

            <Typography sx={{ fontSize: 14, color: '#7d7d7dff' }}>
              ขอบคุณที่ใช้บริการ ระบบได้รับการชำระเงินของคุณเรียบร้อยแล้ว
            </Typography>

            {/* Divider */}
            <Divider sx={{ width: '100%', my: 1 }} />

            {/* Reference Code */}
            <Box sx={{
              width: '100%',
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: 2,
              border: '2px dashed #0b538eff'
            }}>
              <Typography sx={{ fontSize: 12, color: '#7d7d7dff', mb: 0.5 }}>
                รหัสอ้างอิง
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#0b538eff', letterSpacing: 2 }}>
                {refCode}
              </Typography>
            </Box>

            {/* Booking Details */}
            <Box sx={{ width: '100%', textAlign: 'left', mt: 1 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1.5 }}>
                รายละเอียดการจอง
              </Typography>

              <Grid container spacing={1}>
                <Grid size={6}>
                  <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>
                    ชื่อผู้จอง
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {name}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>
                    เบอร์โทรศัพท์
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {phoneNumber}
                  </Typography>
                </Grid>
                <Grid size={6} sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>
                    Check-in
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#0b538eff' }}>
                    {FormatDate(checkinDate!, 4)}
                  </Typography>
                </Grid>
                <Grid size={6} sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>
                    Check-out
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#0b538eff' }}>
                    {FormatDate(checkoutDate!, 4)}
                  </Typography>
                </Grid>
                <Grid size={6} sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>
                    จำนวนคืน
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {totalDate} คืน
                  </Typography>
                </Grid>
                <Grid size={6} sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: 13, color: '#7d7d7dff' }}>
                    จำนวนผู้เข้าพัก
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {guestNumber} คน
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ width: '100%', my: 1 }} />

            {/* Payment Summary */}
            <Box sx={{ width: '100%', textAlign: 'left' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1.5 }}>
                สรุปค่าใช้จ่าย
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: 14 }}>ค่าห้องพัก</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                  {totalRoomPrice.toLocaleString('th-TH')} บาท
                </Typography>
              </Box>

              {!!additionGuestNumber && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: 14 }}>ที่นอนเสริม ({additionGuestNumber} ชุด)</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {((additionGuestNumber || 0) * additionGuestNumberPrice).toLocaleString('th-TH')} บาท
                  </Typography>
                </Box>
              )}

              {!!additionTowel && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: 14 }}>ผ้าขนหนู+ผ้าเช็ดผม ({additionTowel} ชุด)</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {((additionTowel || 0) * additionTowelPrice).toLocaleString('th-TH')} บาท
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: 14 }}>
                  ค่ามัดจำ <span style={{ fontSize: 12, color: '#7d7d7dff' }}>(คืนหลัง Check-out)</span>
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                  {depositPrice.toLocaleString('th-TH')} บาท
                </Typography>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                  ยอดรวมทั้งสิ้น
                </Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#15a13aff' }}>
                  {totalPrice.toLocaleString('th-TH', {
                    style: 'currency',
                    currency: 'THB',
                  })}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ width: '100%', my: 1 }} />

            {/* Additional Info */}
            <Box sx={{
              width: '100%',
              bgcolor: '#f9f9f9',
              p: 2,
              borderRadius: 2,
              textAlign: 'left'
            }}>
              <Typography sx={{ fontSize: 13, color: '#7d7d7dff', lineHeight: 1.6 }}>
                📌 กรุณาเก็บรหัสอ้างอิงนี้ไว้เพื่อใช้สำหรับการติดต่อหรือสอบถามข้อมูล<br />
                📞 หากมีข้อสงสัย กรุณาติดต่อ: โจ
              </Typography>
            </Box>
          </Box>
        </>
      default:
        break;
    }
  };

  const steps = ["เลือกวันเข้าพัก", "ยืนยันรายการ", "ชำระเงิน", "ใบเสร็จ"];

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
              step === steps.length ? (
                <CheckIcon />
              ) : (
                <ArrowForwardIosIcon />
              )
            }
            sx={{ height: 50, borderRadius: 2 }}
            disabled={
              step !== 4 && (
                !checkinDate ||
                !checkoutDate ||
                !guestNumber ||
                !name ||
                !phoneNumber ||
                isInvalidPhoneNumber
              )
            }
          >
            {step === steps.length ? "ยืนยัน" : "ถัดไป"}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
export default Booking;
