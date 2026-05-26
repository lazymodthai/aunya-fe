import { Button, Checkbox, FormControlLabel, Grid, Link, SxProps, TextField, Typography, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import AuthAPI from '@apis/auth';
import { validateEmailRFC } from '@utils/validation';
import Noti from '@components/Noti';
import Loading from "@components/Loading";
import PDPADialog from '@components/PDPADialog';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const textFieldStyle: SxProps = {
  borderRadius: 2
}

function Register() {
  const { t } = useTranslation();
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
      return setErrorMessage(t('member.emptyFields'))
    }
    if (!acceptedPDPA) {
      setError(true)
      setErrorType('pdpa')
      return setErrorMessage(t('member.acceptPdpaError'))
    }
    if (!isValidEmail) {
      setError(true)
      setErrorType('email')
      return setErrorMessage(t('member.emailInvalid'))
    }
    if (password !== verifyPassword) {
      setError(true)
      setErrorType('password')
      return setErrorMessage(t('member.passwordMismatch'))
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
          return setErrorMessage(t('member.emailExists'))
        }
        if (error.response.data.message === 'Phone number already exists') {
          setErrorType('phoneNumber')
          return setErrorMessage(t('member.phoneExists'))
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
          width: isMobile ? '90vw' : 400,
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
          {t('member.register')}
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
          label={t('member.email')}
          type="email"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
          error={errorType === 'email' || (errorType === 'empty' && !email)}
          helperText={error ? errorMessage : ""}
        />
        <TextField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label={t('member.password')}
          type="password"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
          error={errorType === 'password' || (errorType === 'empty' && !password)}
          helperText={error ? errorMessage : ""}
        />
        <TextField
          value={verifyPassword}
          onChange={(e) => setVerifyPassword(e.target.value)}
          label={t('member.passwordConfirm')}
          type="password"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
          error={errorType === 'password' || (errorType === 'empty' && !verifyPassword)}
          helperText={error ? errorMessage : ""}
        />
        <TextField
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          label={t('member.firstName')}
          type="text"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
          error={errorType === 'empty' && !firstName}
          helperText={error ? errorMessage : ""}
        />
        <TextField
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          label={t('member.lastName')}
          type="text"
          fullWidth
          slotProps={{ input: { sx: textFieldStyle } }}
          error={errorType === 'empty' && !lastName}
          helperText={error ? errorMessage : ""}
        />
        <TextField
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          label={t('member.phone')}
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
              {t('dateSelection.acceptPdpaText')}
              <Link
                component="button"
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setPdpaDialogOpen(true)
                }}
                sx={{ fontWeight: 500 }}
              >
                {t('dateSelection.pdpaLink')}
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
          {t('member.submitRegister')}
        </Button>
        <Button
          fullWidth
          variant="text"
          sx={{ mt: -2, borderRadius: 2, height: 48 }}
          onClick={() => navigate('/member/login')}
        >
          {t('booking.buttons.back')}
        </Button>
      </Grid>
      <Noti type={'error'} open={error} value={errorMessage} onClose={() => setError(false)} />
      <Noti type={'success'} open={success} onClose={() => setSuccess(false)} value={t('member.registerSuccess')} />
      <PDPADialog open={pdpaDialogOpen} onClose={() => setPdpaDialogOpen(false)} />
    </Grid>
  );
}

export default Register