import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import PricesAPI, { DiscountCode } from '@apis/prices';
import { useEffect, useState } from 'react';

interface DiscountCodeTabProps {
  showNoti: (type: 'success' | 'error', message: string) => void;
}

function DiscountCodeTab({ showNoti }: DiscountCodeTabProps) {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [createForm, setCreateForm] = useState({
    code: '',
    discount: 0,
    discountPercentage: 0,
    count: 1,
  });

  const fetchDiscountCodes = async () => {
    setIsLoading(true);
    try {
      const { data } = await PricesAPI.getAllDiscountCode();
      setDiscountCodes(data.discountCodes || []);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      showNoti('error', 'ไม่สามารถโหลดโค้ดส่วนลดได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  const handleCreateDiscountCode = async () => {
    if (!createForm.code) {
      showNoti('error', 'กรุณากรอกโค้ดส่วนลด');
      return;
    }
    if (createForm.count < 1) {
      showNoti('error', 'จำนวนโค้ดต้องมากกว่า 0');
      return;
    }

    try {
      await PricesAPI.generateDiscountCode({
        code: createForm.code,
        discount: discountType === 'amount' ? createForm.discount : undefined,
        discountPercentage: discountType === 'percentage' ? createForm.discountPercentage : undefined,
        count: createForm.count,
      });
      showNoti('success', 'สร้างโค้ดส่วนลดสำเร็จ');
      setCreateDialog(false);
      setCreateForm({ code: '', discount: 0, discountPercentage: 0, count: 1 });
      fetchDiscountCodes();
    } catch (error) {
      console.error('Error creating discount code:', error);
      showNoti('error', 'ไม่สามารถสร้างโค้ดส่วนลดได้');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showNoti('success', 'คัดลอกโค้ดแล้ว');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDiscountDisplay = (code: DiscountCode) => {
    if (code.discount && Number(code.discount) > 0) {
      return `฿${Number(code.discount).toLocaleString()}`;
    }
    if (code.discountPercentage && Number(code.discountPercentage) > 0) {
      return `${code.discountPercentage}%`;
    }
    return '-';
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateForm({ ...createForm, code });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          โค้ดส่วนลด ({discountCodes.length})
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDiscountCodes}
            disabled={isLoading}
          >
            รีเฟรช
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            สร้างโค้ด
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">กำลังโหลด...</Typography>
            </Box>
          ) : discountCodes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">ยังไม่มีโค้ดส่วนลด</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>โค้ด</strong></TableCell>
                    <TableCell><strong>ส่วนลด</strong></TableCell>
                    <TableCell><strong>จำนวน</strong></TableCell>
                    <TableCell><strong>สถานะ</strong></TableCell>
                    <TableCell><strong>สร้างเมื่อ</strong></TableCell>
                    <TableCell><strong>ใช้เมื่อ</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {discountCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography fontWeight={600} fontFamily="monospace">
                            {code.code}
                          </Typography>
                          <IconButton size="small" onClick={() => handleCopyCode(code.code)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography color="primary" fontWeight={500}>
                          {getDiscountDisplay(code)}
                        </Typography>
                      </TableCell>
                      <TableCell>{code.count}</TableCell>
                      <TableCell>
                        <Chip
                          label={code.usedAt ? 'ใช้แล้ว' : 'พร้อมใช้'}
                          color={code.usedAt ? 'default' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(code.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(code.usedAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create Discount Code Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>สร้างโค้ดส่วนลด</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                label="โค้ดส่วนลด"
                value={createForm.code}
                onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                fullWidth
                placeholder="เช่น SAVE100"
                inputProps={{ style: { fontFamily: 'monospace', textTransform: 'uppercase' } }}
              />
              <Button variant="outlined" onClick={generateRandomCode} sx={{ minWidth: 'auto', px: 2 }}>
                สุ่ม
              </Button>
            </Stack>

            <FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                ประเภทส่วนลด
              </Typography>
              <RadioGroup
                row
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'amount' | 'percentage')}
              >
                <FormControlLabel value="amount" control={<Radio />} label="ลดเป็นจำนวนเงิน (บาท)" />
                <FormControlLabel value="percentage" control={<Radio />} label="ลดเป็นเปอร์เซ็นต์" />
              </RadioGroup>
            </FormControl>

            {discountType === 'amount' ? (
              <TextField
                label="จำนวนเงินที่ลด (บาท)"
                type="number"
                value={createForm.discount}
                onChange={(e) => setCreateForm({ ...createForm, discount: Number(e.target.value) })}
                fullWidth
                InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>฿</Typography> }}
              />
            ) : (
              <TextField
                label="เปอร์เซ็นต์ที่ลด"
                type="number"
                value={createForm.discountPercentage}
                onChange={(e) => setCreateForm({ ...createForm, discountPercentage: Number(e.target.value) })}
                fullWidth
                InputProps={{ endAdornment: <Typography sx={{ ml: 1 }}>%</Typography> }}
                inputProps={{ min: 0, max: 100 }}
              />
            )}

            <TextField
              label="จำนวนโค้ด"
              type="number"
              value={createForm.count}
              onChange={(e) => setCreateForm({ ...createForm, count: Number(e.target.value) })}
              fullWidth
              inputProps={{ min: 1 }}
              helperText="จำนวนครั้งที่สามารถใช้โค้ดนี้ได้"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleCreateDiscountCode}>
            สร้างโค้ด
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DiscountCodeTab;
