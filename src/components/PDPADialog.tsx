import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface PDPADialogProps {
  open: boolean;
  onClose: () => void;
}

function PDPADialog({ open, onClose }: PDPADialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 600, fontSize: 20 }}>
          นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            1. ข้อมูลที่เราเก็บรวบรวม
          </Typography>
          <Typography variant="body2">
            เราเก็บรวบรวมข้อมูลส่วนบุคคลของท่านเพื่อการให้บริการจองห้องพักและบริการที่เกี่ยวข้อง ได้แก่:
          </Typography>
          <Box component="ul" sx={{ pl: 2, my: 0 }}>
            <li>
              <Typography variant="body2">ชื่อ-นามสกุล</Typography>
            </li>
            <li>
              <Typography variant="body2">หมายเลขโทรศัพท์</Typography>
            </li>
            <li>
              <Typography variant="body2">อีเมล</Typography>
            </li>
            <li>
              <Typography variant="body2">ข้อมูลการจองและการชำระเงิน</Typography>
            </li>
          </Box>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            2. วัตถุประสงค์ในการใช้ข้อมูล
          </Typography>
          <Typography variant="body2">เราใช้ข้อมูลของท่านเพื่อ:</Typography>
          <Box component="ul" sx={{ pl: 2, my: 0 }}>
            <li>
              <Typography variant="body2">ดำเนินการจองห้องพักและให้บริการที่เกี่ยวข้อง</Typography>
            </li>
            <li>
              <Typography variant="body2">ติดต่อสื่อสารเกี่ยวกับการจองของท่าน</Typography>
            </li>
            <li>
              <Typography variant="body2">ปรับปรุงคุณภาพการบริการ</Typography>
            </li>
            <li>
              <Typography variant="body2">ปฏิบัติตามกฎหมายและข้อบังคับที่เกี่ยวข้อง</Typography>
            </li>
          </Box>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            3. การเปิดเผยข้อมูล
          </Typography>
          <Typography variant="body2">
            เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอก
            ยกเว้นกรณีที่จำเป็นสำหรับการให้บริการหรือตามที่กฎหมายกำหนด
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            4. การรักษาความปลอดภัยของข้อมูล
          </Typography>
          <Typography variant="body2">
            เรามีมาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อป้องกันการเข้าถึง การใช้ การเปิดเผย การเปลี่ยนแปลง
            หรือการทำลายข้อมูลส่วนบุคคลของท่านโดยไม่ได้รับอนุญาต
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            5. สิทธิของเจ้าของข้อมูล
          </Typography>
          <Typography variant="body2">ท่านมีสิทธิ:</Typography>
          <Box component="ul" sx={{ pl: 2, my: 0 }}>
            <li>
              <Typography variant="body2">เข้าถึงและขอสำเนาข้อมูลส่วนบุคคลของท่าน</Typography>
            </li>
            <li>
              <Typography variant="body2">ขอแก้ไขข้อมูลส่วนบุคคลที่ไม่ถูกต้อง</Typography>
            </li>
            <li>
              <Typography variant="body2">ขอลบข้อมูลส่วนบุคคลของท่าน</Typography>
            </li>
            <li>
              <Typography variant="body2">คัดค้านการประมวลผลข้อมูลส่วนบุคคล</Typography>
            </li>
            <li>
              <Typography variant="body2">ถอนความยินยอมที่ได้ให้ไว้</Typography>
            </li>
          </Box>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            6. ระยะเวลาการเก็บรักษาข้อมูล
          </Typography>
          <Typography variant="body2">
            เราจะเก็บรักษาข้อมูลส่วนบุคคลของท่านตลอดระยะเวลาที่จำเป็นสำหรับวัตถุประสงค์ที่ระบุไว้
            หรือตามที่กฎหมายกำหนด
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            7. การติดต่อ
          </Typography>
          <Typography variant="body2">
            หากท่านมีคำถามหรือต้องการใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคล
            สามารถติดต่อเราได้ผ่านช่องทางที่ระบุไว้ในเว็บไซต์
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" onClick={onClose} sx={{ borderRadius: 2 }}>
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PDPADialog;
