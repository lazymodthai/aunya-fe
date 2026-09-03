import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  PersonOutline,
  PhoneOutlined,
  Visibility,
  VisibilityOff,
  PersonAddOutlined,
} from '@mui/icons-material';
import AuthAPI from '@apis/auth';
import { validateEmailRFC } from '@utils/validation';
import Noti from '@components/Noti';
import Loading from "@components/Loading";
import PDPADialog from '@components/PDPADialog';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [verifyPassword, setVerifyPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [acceptedPDPA, setAcceptedPDPA] = useState<boolean>(false);
  const [pdpaDialogOpen, setPdpaDialogOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password || !verifyPassword || !firstName || !lastName || !phoneNumber) {
      setError(true);
      setErrorType('empty');
      return setErrorMessage(t('member.emptyFields'));
    }
    if (!acceptedPDPA) {
      setError(true);
      setErrorType('pdpa');
      return setErrorMessage(t('member.acceptPdpaError'));
    }
    if (!isValidEmail) {
      setError(true);
      setErrorType('email');
      return setErrorMessage(t('member.emailInvalid'));
    }
    if (password !== verifyPassword) {
      setError(true);
      setErrorType('password');
      return setErrorMessage(t('member.passwordMismatch'));
    }

    try {
      setLoading(true);
      const { data } = await AuthAPI.register({ email, password, firstName, lastName, phoneNumber });
      if (data) {
        setError(false);
        setSuccess(true);
        setTimeout(() => {
          setLoading(false);
          navigate('/member/login');
        }, 1200);
      }
    } catch (err: any) {
      setLoading(false);
      if (err.status === 409) {
        setError(true);
        if (err.response?.data?.message === 'Email already exists') {
          setErrorType('email');
          return setErrorMessage(t('member.emailExists'));
        }
        if (err.response?.data?.message === 'Phone number already exists') {
          setErrorType('phoneNumber');
          return setErrorMessage(t('member.phoneExists'));
        }
      }
      setError(true);
      setErrorMessage(t('member.credentialsInvalid'));
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 500,
        mx: 'auto',
        my: 'auto',
        px: 2,
        py: { xs: 2, sm: 3 },
      }}
    >
      {loading && <Loading />}

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.07), 0 0 1px 1px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          bgcolor: '#fff',
        }}
      >
        {/* Top Accent Gradient Bar */}
        <Box sx={{ height: 5, background: 'linear-gradient(90deg, #B03052 0%, #E8A87C 100%)' }} />

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                bgcolor: 'rgba(176, 48, 82, 0.1)',
                color: '#B03052',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5,
              }}
            >
              <PersonAddOutlined sx={{ fontSize: 26 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#1e293b" sx={{ mb: 0.8 }}>
              {t('member.registerTitle')}
            </Typography>
            <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.875rem' }}>
              {t('member.registerSubtitle')}
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleRegister}>
            <Stack spacing={2}>
              {/* Names row */}
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    label={t('member.firstName')}
                    type="text"
                    fullWidth
                    error={errorType === 'empty' && !firstName}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutline sx={{ color: '#94a3b8', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3 },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    label={t('member.lastName')}
                    type="text"
                    fullWidth
                    error={errorType === 'empty' && !lastName}
                    slotProps={{
                      input: {
                        sx: { borderRadius: 3 },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Email */}
              <TextField
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  setIsValidEmail(val === '' ? true : validateEmailRFC(val));
                }}
                label={t('member.email')}
                type="email"
                fullWidth
                error={errorType === 'email' || (errorType === 'empty' && !email) || !isValidEmail}
                helperText={!isValidEmail ? t('member.emailInvalid') : ''}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 },
                  },
                }}
              />

              {/* Phone */}
              <TextField
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                label={t('member.phone')}
                type="tel"
                fullWidth
                error={errorType === 'phoneNumber' || (errorType === 'empty' && !phoneNumber)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 },
                  },
                }}
              />

              {/* Password */}
              <TextField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label={t('member.password')}
                type={showPassword ? 'text' : 'password'}
                fullWidth
                error={errorType === 'password' || (errorType === 'empty' && !password)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#94a3b8' }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 },
                  },
                }}
              />

              {/* Verify Password */}
              <TextField
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                label={t('member.passwordConfirm')}
                type={showVerifyPassword ? 'text' : 'password'}
                fullWidth
                error={errorType === 'password' || (errorType === 'empty' && !verifyPassword)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#94a3b8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#94a3b8' }}
                        >
                          {showVerifyPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3 },
                  },
                }}
              />

              {/* PDPA Agreement */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptedPDPA}
                    onChange={(e) => setAcceptedPDPA(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: errorType === 'pdpa' ? 'error.main' : '#475569' }}>
                    {t('dateSelection.acceptPdpaText')}{' '}
                    <Link
                      component="button"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPdpaDialogOpen(true);
                      }}
                      sx={{ fontWeight: 600, color: '#B03052' }}
                    >
                      {t('dateSelection.pdpaLink')}
                    </Link>
                  </Typography>
                }
                sx={{
                  alignItems: 'flex-start',
                  '& .MuiCheckbox-root': { pt: 0 },
                }}
              />

              {/* Register Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!email || !password || !verifyPassword || !firstName || !lastName || !phoneNumber || !acceptedPDPA}
                sx={{
                  borderRadius: 3,
                  py: 1.4,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  bgcolor: '#B03052',
                  boxShadow: '0 4px 14px rgba(176, 48, 82, 0.35)',
                  '&:hover': {
                    bgcolor: '#962341',
                  },
                }}
              >
                {t('member.submitRegister')}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 2.5, color: '#94a3b8', fontSize: '0.8rem' }} />

          {/* Back to Login */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="#64748b">
              {t('member.hasAccount')}{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/member/login')}
                sx={{
                  color: '#B03052',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {t('member.login')}
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Noti type={'error'} open={error} value={errorMessage} onClose={() => setError(false)} />
      <Noti type={'success'} open={success} onClose={() => setSuccess(false)} value={t('member.registerSuccess')} />
      <PDPADialog open={pdpaDialogOpen} onClose={() => setPdpaDialogOpen(false)} />
    </Box>
  );
}

export default Register;