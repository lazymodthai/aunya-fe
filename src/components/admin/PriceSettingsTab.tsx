import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PricesAPI from '@apis/prices';
import PriceField from '@components/common/PriceField';
import { useState } from 'react';
import { ROOM_ID } from '@configs/app-settings';

interface PriceSettingsTabProps {
  currentYear: number;
  currentMonth: number;
  onRefreshCalendar: (month: number) => void;
  showNoti: (type: 'success' | 'error', message: string) => void;
}

const roomId = ROOM_ID;

function PriceSettingsTab({ currentYear, currentMonth, onRefreshCalendar, showNoti }: PriceSettingsTabProps) {
  const [generateDialog, setGenerateDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    year: new Date().getFullYear(),
    weekdayPrice: 2000,
    weekendPrice: 3000,
    holidayPrice: 3500,
    description: '',
  });

  const handleGeneratePrices = async () => {
    try {
      await PricesAPI.generatePrices({
        year: generateForm.year,
        weekdayPrice: generateForm.weekdayPrice,
        weekendPrice: generateForm.weekendPrice,
        holidayPrice: generateForm.holidayPrice,
        description: generateForm.description,
        roomId: roomId,
      });
      showNoti('success', 'สร้างราคาสำเร็จ');
      setGenerateDialog(false);
      onRefreshCalendar(currentMonth);
    } catch (error) {
      console.error('Error generating prices:', error);
      showNoti('error', 'ไม่สามารถสร้างราคาได้');
    }
  };

  const handleResetPrices = async () => {
    try {
      await PricesAPI.resetPrices({
        year: currentYear,
        roomId: roomId,
      });
      showNoti('success', 'รีเซ็ตราคาสำเร็จ');
      setResetDialog(false);
      onRefreshCalendar(currentMonth);
    } catch (error) {
      console.error('Error resetting prices:', error);
      showNoti('error', 'ไม่สามารถรีเซ็ตราคาได้');
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        ตั้งค่าราคา
      </Typography>

      <Stack spacing={2}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              สร้างราคาทั้งปี
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              สร้างราคาสำหรับทุกวันในปีที่เลือก โดยแยกตามประเภทวัน
            </Typography>
            <Button variant="contained" onClick={() => setGenerateDialog(true)}>
              สร้างราคา
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              รีเซ็ตราคา
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ลบราคาทั้งหมดของปี {currentYear} และเริ่มต้นใหม่
            </Typography>
            <Button variant="outlined" color="error" onClick={() => setResetDialog(true)}>
              รีเซ็ตราคาปี {currentYear}
            </Button>
          </CardContent>
        </Card>
      </Stack>

      {/* Generate Prices Dialog */}
      <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>สร้างราคาทั้งปี</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="ปี"
              type="number"
              value={generateForm.year}
              onChange={(e) => setGenerateForm({ ...generateForm, year: Number(e.target.value) })}
              fullWidth
            />
            <PriceField
              label="ราคาวันธรรมดา (จันทร์-พฤหัส)"
              value={generateForm.weekdayPrice}
              onChange={(val) => setGenerateForm({ ...generateForm, weekdayPrice: val })}
              fullWidth
            />
            <PriceField
              label="ราคาวันหยุด (ศุกร์-อาทิตย์)"
              value={generateForm.weekendPrice}
              onChange={(val) => setGenerateForm({ ...generateForm, weekendPrice: val })}
              fullWidth
            />
            <PriceField
              label="ราคาวันหยุดนักขัตฤกษ์"
              value={generateForm.holidayPrice}
              onChange={(val) => setGenerateForm({ ...generateForm, holidayPrice: val })}
              fullWidth
            />
            <TextField
              label="รายละเอียด (ไม่บังคับ)"
              value={generateForm.description}
              onChange={(e) => setGenerateForm({ ...generateForm, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleGeneratePrices}>
            สร้างราคา
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Prices Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>ยืนยันการรีเซ็ตราคา</DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการรีเซ็ตราคาทั้งหมดของปี <strong>{currentYear}</strong> ใช่หรือไม่?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={handleResetPrices}>
            รีเซ็ตราคา
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PriceSettingsTab;
