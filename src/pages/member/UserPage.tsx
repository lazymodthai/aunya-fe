import { Button, Grid, Typography } from '@mui/material';
import AuthAPI from '@apis/auth';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, setUser, userSelector } from '@store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function UserPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector(userSelector);


  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(clearUser());
      navigate('/member/login');
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await AuthAPI.getProfile()
      if (data.user.isAdmin) {
        navigate('/member/admin')
      } else if (!data.user.isActive) {
        dispatch(clearUser());
        navigate('/member/login');
      } else {
        dispatch(setUser(data.user));
      }
    } catch (error) {
      dispatch(clearUser());
      navigate('/member/login');
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh', gap: 2 }}
    >
      <Typography variant="h4">User Page</Typography>
      <Button
        variant="contained"
        color="error"
        onClick={handleLogout}
      >
        ออกจากระบบ
      </Button>
    </Grid>
  );
}

export default UserPage;