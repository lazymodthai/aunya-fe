import { Button, Grid, SxProps, TextField, Typography, useMediaQuery } from '@mui/material'
import { useState } from 'react'
import AuthAPI from '@apis/auth';
import { validateEmailRFC } from '@utils/validation';
import Noti from '@components/Noti';
import Loading from "@components/Loading";
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
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const navigate = useNavigate()

  const handleRegister = async () => {
    if(email === '' || password === '') return;
    try {
      const { data } = await AuthAPI.login({ email, password })
      if(data){
        setError(false)
        setSuccess(true)
        setLoading(true)
        setTimeout(()=>setLoading(false), 1000)
      }
    } catch (error:any) {
      if(error.status === 400) {
        setError(true)
        if(error.response.data.message[0] === 'email must be an email') return setErrorMessage('รูปแบบอีเมลไม่ถูกต้อง')
      }
      if(error.status === 401) {
        setError(true)
        return setErrorMessage('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
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
            if(e.target.value === '') {
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
          error={!isValidEmail}
          helperText={!isValidEmail ? "รูปแบบอีเมลไม่ถูกต้อง" : ""}
        />
        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label={"รหัสผ่าน"}
          type="password"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
        />
        <TextField
          value={verifyPassword}
          onChange={(e) => setVerifyPassword(e.target.value)}
          label={"รหัสผ่านอีกครั้ง"}
          type="password"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
        />
        <TextField
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          label={"ชื่อ"}
          type="text"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
        />
        <TextField
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          label={"นามสกุล"}
          type="text"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
        />
        <TextField
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          label={"เบอร์โทรศัพท์"}
          type="text"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ borderRadius: 2, height: 48 }}
          onClick={handleRegister}
          disabled={email === '' || password === ''}
        >
          สมัคร
        </Button>
        <Button
          fullWidth
          variant="text"
          sx={{ mt: -2, borderRadius: 2, height: 48 }}
          onClick={()=>navigate('/member/login')}
        >
          ย้อนกลับ
        </Button>
      </Grid>
      <Noti type={'error'} open={error} value={errorMessage} onClose={() => setError(false)} />
      <Noti type={'success'} open={success} onClose={() => setSuccess(false)} value='สมัครสมาชิกสำเร็จ' />
    </Grid>
  );
}

export default Register