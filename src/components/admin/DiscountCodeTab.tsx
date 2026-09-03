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
  Switch,
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
import { parseLocalDate } from '@utils/date';
import PriceField from '@components/common/PriceField';
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
    hasExpiry: false,
    expiresAt: '',
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

  const isCodeExpired = (code: DiscountCode) => {
    if (!code.expiresAt) return false;
    return new Date() > new Date(code.expiresAt);
  };

  const handleCreateDiscountCode = async () => {
    if (!createForm.code) {
      showNoti('error', 'กรุณากรอกโค้ดส่วนลด');
      return;
    }
    if (createForm.count < 1) {
      showNoti('error', 'จำนวนโค้ดต้องมากกว่า 0');
      return;
    }
    if (createForm.hasExpiry && !createForm.expiresAt) {
      showNoti('error', 'กรุณาเลือกวันหมดอายุ หรือปิดตัวเลือกกำหนดวันหมดอายุ');
      return;
    }

    let expiresAtISO: string | undefined = undefined;
    if (createForm.hasExpiry && createForm.expiresAt) {
      const expDate = new Date(`${createForm.expiresAt}T23:59:59.999`);
      expiresAtISO = expDate.toISOString();
    }

    try {
      await PricesAPI.generateDiscountCode({
        code: createForm.code,
        discount: discountType === 'amount' ? createForm.discount : undefined,
        discountPercentage: discountType === 'percentage' ? createForm.discountPercentage : undefined,
        count: createForm.count,
        expiresAt: expiresAtISO,
      });
      showNoti('success', 'สร้างโค้ดส่วนลดสำเร็จ');
      setCreateDialog(false);
      setCreateForm({
        code: '',
        discount: 0,
        discountPercentage: 0,
        count: 1,
        hasExpiry: false,
        expiresAt: '',
      });
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
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ? parseLocalDate(dateString)
      : new Date(dateString);
    return date.toLocaleDateString('th-TH', {
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
                    <TableCell><strong>วันหมดอายุ</strong></TableCell>
                    <TableCell><strong>สถานะ</strong></TableCell>
                    <TableCell><strong>สร้างเมื่อ</strong></TableCell>
                    <TableCell><strong>ใช้เมื่อ</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {discountCodes.map((code) => {
                    const expired = isCodeExpired(code);
                    return (
                      <TableRow key={code.id} sx={{ opacity: expired ? 0.7 : 1 }}>
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
                          {code.expiresAt ? (
                            <Typography
                              variant="body2"
                              sx={{
                                color: expired ? '#ef4444' : '#1e293b',
                                fontWeight: expired ? 600 : 400,
                              }}
                            >
                              {formatDate(code.expiresAt)}
                            </Typography>
                          ) : (
                            <Chip
                              label="ไม่มีวันหมดอายุ"
                              size="small"
                              variant="outlined"
                              sx={{
                                color: '#059669',
                                borderColor: '#a7f3d0',
                                bgcolor: '#ecfdf5',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {expired ? (
                            <Chip label="หมดอายุ" color="error" size="small" sx={{ fontWeight: 600 }} />
                          ) : code.count <= 0 ? (
                            <Chip label="หมด" color="default" size="small" />
                          ) : (
                            <Chip label={`เหลือ ${code.count}`} color="success" size="small" sx={{ fontWeight: 600 }} />
                          )}
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
                    );
                  })}
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
              <PriceField
                label="จำนวนเงินที่ลด (บาท)"
                value={createForm.discount}
                onChange={(val) => setCreateForm({ ...createForm, discount: val })}
                fullWidth
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

            {/* Expiration Date Section */}
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={createForm.hasExpiry}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        hasExpiry: e.target.checked,
                        expiresAt: e.target.checked ? createForm.expiresAt : '',
                      })
                    }
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      กำหนดวันหมดอายุ
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {createForm.hasExpiry
                        ? 'ระบุวันที่ที่ต้องการให้โค้ดหมดอายุ'
                        : 'หากไม่เลือกจะเป็น "ไม่มีวันหมดอายุ" (ใช้ได้ตลอดไป)'}
                    </Typography>
                  </Box>
                }
              />

              {createForm.hasExpiry && (
                <Box sx={{ mt: 1.5 }}>
                  <TextField
                    label="วันหมดอายุ"
                    type="date"
                    value={createForm.expiresAt}
                    onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    helperText="โค้ดจะหมดอายุเวลา 23:59 น. ของวันที่เลือก"
                  />
                </Box>
              )}
            </Box>
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
