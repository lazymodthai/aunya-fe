import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
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
  Visibility,
  VisibilityOff,
  LoginOutlined,
  SearchOutlined,
} from '@mui/icons-material';
import AuthAPI from '@apis/auth';
import { validateEmailRFC } from '@utils/validation';
import Noti from '@components/Noti';
import Loading from "@components/Loading";
import TrackBookingModal from '@components/booking/TrackBookingModal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [openTrackModal, setOpenTrackModal] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return;
    try {
      setLoading(true);
      const { data } = await AuthAPI.login({ email, password });
      if (data) {
        setError(false);
        setSuccess(true);
        verifyUser();
      }
    } catch (err: any) {
      if (err.status === 400) {
        setError(true);
        if (err.response?.data?.message?.[0] === 'email must be an email') {
          return setErrorMessage(t('member.emailInvalid'));
        }
      }
      if (err.status === 401) {
        setError(true);
        return setErrorMessage(t('member.credentialsInvalid'));
      }
      setError(true);
      setErrorMessage(t('member.credentialsInvalid'));
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async () => {
    try {
      setLoading(true);
      const { data } = await AuthAPI.verify();
      if (data.isActive && data.isAdmin) {
        navigate('/member/admin');
      } else if (data.isActive && !data.isAdmin) {
        navigate('/member/user');
      }
    } catch {
      navigate('/member/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 440,
        mx: 'auto',
        my: 'auto',
        px: 2,
        py: { xs: 2, sm: 4 },
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
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
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
              <LockOutlined sx={{ fontSize: 26 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#1e293b" sx={{ mb: 0.8 }}>
              {t('member.loginTitle')}
            </Typography>
            <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.875rem' }}>
              {t('member.loginSubtitle')}
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleLogin}>
            <Stack spacing={2.5}>
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
                error={!isValidEmail}
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

              <TextField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label={t('member.password')}
                type={showPassword ? 'text' : 'password'}
                fullWidth
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<LoginOutlined />}
                disabled={!email || !password || !isValidEmail}
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
                {t('member.login')}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 2.5, color: '#94a3b8', fontSize: '0.8rem' }} />

          {/* Action Links */}
          <Stack spacing={1.5} sx={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<SearchOutlined />}
              onClick={() => setOpenTrackModal(true)}
              sx={{
                borderRadius: 3,
                py: 1.1,
                borderColor: '#e2e8f0',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.88rem',
                textTransform: 'none',
                bgcolor: '#f8fafc',
                '&:hover': {
                  bgcolor: '#f1f5f9',
                  borderColor: '#cbd5e1',
                  color: '#1e293b',
                },
              }}
            >
              {t('track.trackTitle', 'ค้นหาข้อมูลการจอง')}
            </Button>

            {/* Footer Link to Register */}
            <Typography variant="body2" color="#64748b" sx={{ pt: 0.5 }}>
              {t('member.noAccount')}{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/member/register')}
                sx={{
                  color: '#B03052',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {t('member.register')}
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <TrackBookingModal open={openTrackModal} onClose={() => setOpenTrackModal(false)} />
      <Noti type={'error'} open={error} value={errorMessage} onClose={() => setError(false)} />
      <Noti type={'success'} open={success} onClose={() => setSuccess(false)} value={t('member.loginSuccess')} />
    </Box>
  );
}

export default Login;