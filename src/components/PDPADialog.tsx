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
import { useTranslation } from 'react-i18next';

interface PDPADialogProps {
  open: boolean;
  onClose: () => void;
}

function PDPADialog({ open, onClose }: PDPADialogProps) {
  const { t } = useTranslation();

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
          {t("pdpa.title", "นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)")}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {t("pdpa.sec1Title", "1. ข้อมูลที่เราเก็บรวบรวม")}
          </Typography>
          <Typography variant="body2">
            {t("pdpa.sec1Content", "เราเก็บรวบรวมข้อมูลส่วนบุคคลของท่านเพื่อการให้บริการจองห้องพักและบริการที่เกี่ยวข้อง ได้แก่:")}
          </Typography>
          <Box component="ul" sx={{ pl: 2, my: 0 }}>
            <li>
              <Typography variant="body2">{t("pdpa.sec1Item1", "ชื่อ-นามสกุล")}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t("pdpa.sec1Item2", "หมายเลขโทรศัพท์")}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t("pdpa.sec1Item3", "อีเมล")}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t("pdpa.sec1Item4", "ข้อมูลการจองและการชำระเงิน")}</Typography>
            </li>
          </Box>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {t("pdpa.sec2Title", "2. วัตถุประสงค์ในการใช้ข้อมูล")}
          </Typography>
          <Typography variant="body2">{t("pdpa.sec2Content", "เราใช้ข้อมูลของท่านเพื่อ:")}</Typography>
          <Box component="ul" sx={{ pl: 2, my: 0 }}>
            <li>
              <Typography variant="body2">{t("pdpa.sec2Item1", "ดำเนินการจองห้องพักและให้บริการที่เกี่ยวข้อง")}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t("pdpa.sec2Item2", "ติดต่อสื่อสารเกี่ยวกับการจองของท่าน")}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t("pdpa.sec2Item3", "ปรับปรุงคุณภาพการบริการ")}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t("pdpa.sec2Item4", "ปฏิบัติตามกฎหมายและข้อบังคับที่เกี่ยวข้อง")}</Typography>
            </li>
          </Box>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {t("pdpa.sec3Title", "3. การเปิดเผยข้อมูล")}
          </Typography>
          <Typography variant="body2">
            {t("pdpa.sec3Content", "เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอก ยกเว้นกรณีที่จำเป็นสำหรับการให้บริการหรือตามที่กฎหมายกำหนด")}
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {t("pdpa.sec4Title", "4. การรักษาความปลอดภัยของข้อมูล")}
          </Typography>
          <Typography variant="body2">
            {t("pdpa.sec4Content", "เรามีมาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อป้องกันการเข้าถึง การใช้ การเปิดเผย การเปลี่ยนแปลง หรือการทำลายข้อมูลส่วนบุคคลของท่านโดยไม่ได้รับอนุญาต")}
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {t("pdpa.sec5Title", "5. สิทธิของเจ้าของข้อมูล")}
          </Typography>
          <Typography variant="body2">{t("pdpa.sec5Content", "ท่านมีสิทธิ:")}</Typography>
          <Box component="ul" sx={{ pl: 2, my: 0 }}>
            <li>
              <Typography variant="body2">{t("pdpa.sec5Item1", "เข้าถึงและขอสำเนาข้อมูลส่วนบุคคลของท่าน")}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t("pdpa.sec5Item2", "ขอแก้ไขข้อมูลส่วนบุคคลที่ไม่ถูกต้อง")}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t("pdpa.sec5Item3", "ขอลบข้อมูลส่วนบุคคลของท่าน")}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t("pdpa.sec5Item4", "คัดค้านการประมวลผลข้อมูลส่วนบุคคล")}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t("pdpa.sec5Item5", "ถอนความยินยอมที่ได้ให้ไว้")}</Typography>
            </li>
          </Box>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {t("pdpa.sec6Title", "6. ระยะเวลาการเก็บรักษาข้อมูล")}
          </Typography>
          <Typography variant="body2">
            {t("pdpa.sec6Content", "เราจะเก็บรักษาข้อมูลส่วนบุคคลของท่านตลอดระยะเวลาที่จำเป็นสำหรับวัตถุประสงค์ที่ระบุไว้ หรือตามที่กฎหมายกำหนด")}
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {t("pdpa.sec7Title", "7. การติดต่อ")}
          </Typography>
          <Typography variant="body2">
            {t("pdpa.sec7Content", "หากท่านมีคำถามหรือต้องการใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคล สามารถติดต่อเราได้ผ่านช่องทางที่ระบุไว้ในเว็บไซต์")}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" onClick={onClose} sx={{ borderRadius: 2 }}>
          {t("pdpa.closeBtn", "ปิด")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PDPADialog;
