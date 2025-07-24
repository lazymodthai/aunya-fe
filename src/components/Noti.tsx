import { Alert, Snackbar, SxProps, Slide, SlideProps } from "@mui/material";

function TransitionLeft(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

type Props = {
  type?: 'error' | 'success' | 'warning' | 'info'
  value?: string,
  sx?: SxProps,
  open?: boolean
  onClose?: () => void
}

function Noti(props: Props) {
  return (
    <Snackbar
      key={'Noti'}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      open={props.open}
      onClose={() => props.onClose?.()}
      autoHideDuration={3000}
      sx={{ bottom: 90, ...props.sx }}
      slots={{
        transition: TransitionLeft,
      }}
    >
      <Alert variant="filled" severity={props.type || 'error'}>
        {props.value || 'เกิดข้อผิดพลาด'}
      </Alert>
    </Snackbar>
  );
}

export default Noti;