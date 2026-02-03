import { Button, Checkbox, FormControlLabel, Grid, Link, SxProps, TextField, Typography, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import AuthAPI from '@apis/auth';
import { validateEmailRFC } from '@utils/validation';
import Noti from '@components/Noti';
import Loading from "@components/Loading";
import PDPADialog from '@components/PDPADialog';
import { useNavigate } from 'react-router-dom';

const textFieldStyle: SxProps = {
  borderRadius: 2
}

function Register() {
  const isMobile = useMediaQuery("(max-width:800px)");
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [verifyPassword, setVerifyPassword] = useState<string>('')
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')


  const [isValidEmail, setIsVaildEmail] = useState<boolean>(true)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [errorType, setErrorType] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [acceptedPDPA, setAcceptedPDPA] = useState<boolean>(false)
  const [pdpaDialogOpen, setPdpaDialogOpen] = useState<boolean>(false)


  const navigate = useNavigate()

  const handleRegister = async () => {
    if (!email || !password || !verifyPassword || !firstName || !lastName || !phoneNumber) {
      setError(true)
      setErrorType('empty')
      return setErrorMessage('กรุณากรอกข้อมูลให้ครบถ้วน')
    }
    if (!acceptedPDPA) {
      setError(true)
      setErrorType('pdpa')
      return setErrorMessage('กรุณายอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคล')
    }
    if (!isValidEmail) {
      setError(true)
      setErrorType('email')
      return setErrorMessage('รูปแบบอีเมลไม่ถูกต้อง')
    }
    if (password !== verifyPassword) {
      setError(true)
      setErrorType('password')
      return setErrorMessage('รหัสผ่านไม่ตรงกัน')
    }
    if (email === '' || password === '') return;
    try {
      const { data } = await AuthAPI.register({ email, password, firstName, lastName, phoneNumber })
      if (data) {
        setError(false)
        setSuccess(true)
        setLoading(true)
        setTimeout(() => {
          setLoading(false)
          navigate('/member/login')
        }, 1000)
      }
    } catch (error: any) {
      console.log(error)
      if (error.status === 409) {
        setError(true)
        if (error.response.data.message === 'Email already exists') {
          setErrorType('email')
          return setErrorMessage('อีเมลถูกใช้แล้ว')
        }
        if (error.response.data.message === 'Phone number already exists') {
          setErrorType('phoneNumber')
          return setErrorMessage('เบอร์โทรศัพท์ถูกใช้แล้ว')
        }
      }
    }
  }

  return (
    <Grid>
      {loading && <Loading />}
      <Grid
        gap={4}
        container
        direction={"column"}
        textAlign={"center"}
        alignItems={"center"}
        justifyContent={"center"}
        sx={{
          border: `1px solid #B03052`,
          borderRadius: 4,
          p: 3,
          width: isMobile ? "90vw" : 400,
          mt: 4,
        }}
      >
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 600,
            mt: -5.5,
            bgcolor: "white",
            width: 160,
          }}
        >
          สมัครสมาชิก
        </Typography>
        <TextField
          value={email}
          onChange={(e) => {
            if (e.target.value === '') {
              setIsVaildEmail(true)
            } else {
              setIsVaildEmail(validateEmailRFC(e.target.value))
            }
            setEmail(e.target.value)
          }}
          label={"อีเมล"}
          type="email"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
          error={errorType === 'email' || (errorType === 'empty' && !email)}
          helperText={error ? errorMessage : ""}
        />
        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label={"รหัสผ่าน"}
          type="password"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
          error={errorType === 'password' || (errorType === 'empty' && !password)}
          helperText={error ? errorMessage : ""}
        />
        <TextField
          value={verifyPassword}
          onChange={(e) => setVerifyPassword(e.target.value)}
          label={"รหัสผ่านอีกครั้ง"}
          type="password"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
          error={errorType === 'password' || (errorType === 'empty' && !verifyPassword)}
          helperText={error ? errorMessage : ""}
        />
        <TextField
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          label={"ชื่อ"}
          type="text"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
          error={errorType === 'empty' && !firstName}
          helperText={error ? errorMessage : ""}
        />
        <TextField
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          label={"นามสกุล"}
          type="text"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
          error={errorType === 'empty' && !lastName}
          helperText={error ? errorMessage : ""}
        />
        <TextField
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          label={"เบอร์โทรศัพท์"}
          type="text"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
          error={errorType === 'phoneNumber' || (errorType === 'empty' && !phoneNumber)}
          helperText={error ? errorMessage : ""}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={acceptedPDPA}
              onChange={(e) => setAcceptedPDPA(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              ฉันได้อ่านและยอมรับ{' '}
              <Link
                component="button"
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setPdpaDialogOpen(true)
                }}
                sx={{ fontWeight: 500 }}
              >
                นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
              </Link>
            </Typography>
          }
          sx={{
            alignItems: 'flex-start',
            '& .MuiCheckbox-root': { pt: 0 },
            ...(errorType === 'pdpa' && { color: 'error.main' }),
          }}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ borderRadius: 2, height: 48 }}
          onClick={handleRegister}
          disabled={email === '' || password === '' || !acceptedPDPA}
        >
          สมัคร
        </Button>
        <Button
          fullWidth
          variant="text"
          sx={{ mt: -2, borderRadius: 2, height: 48 }}
          onClick={() => navigate('/member/login')}
        >
          ย้อนกลับ
        </Button>
      </Grid>
      <Noti type={'error'} open={error} value={errorMessage} onClose={() => setError(false)} />
      <Noti type={'success'} open={success} onClose={() => setSuccess(false)} value='สมัครสมาชิกสำเร็จ' />
      <PDPADialog open={pdpaDialogOpen} onClose={() => setPdpaDialogOpen(false)} />
    </Grid>
  );
}

export default Register