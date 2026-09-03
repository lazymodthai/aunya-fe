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
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  AutoAwesome as RandomIcon,
} from '@mui/icons-material';
import PricesAPI, { DiscountCode } from '@apis/prices';
import { parseLocalDate } from '@utils/date';
import PriceField from '@components/common/PriceField';
import CustomDatePicker from '@components/booking/CustomDatePicker';
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
    expiresAt: null as Date | null,
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
    if (!createForm.code.trim()) {
      showNoti('error', 'กรุณากรอกโค้ดส่วนลด');
      return;
    }
    if (createForm.count < 1) {
      showNoti('error', 'จำนวนโค้ดต้องมากกว่า 0');
      return;
    }
    if (discountType === 'amount' && (!createForm.discount || createForm.discount <= 0)) {
      showNoti('error', 'กรุณาระบุจำนวนเงินส่วนลด');
      return;
    }
    if (discountType === 'percentage' && (!createForm.discountPercentage || createForm.discountPercentage <= 0)) {
      showNoti('error', 'กรุณาระบุเปอร์เซ็นต์ส่วนลด');
      return;
    }

    let expiresAtISO: string | undefined = undefined;
    if (createForm.expiresAt) {
      const expDate = new Date(createForm.expiresAt);
      expDate.setHours(23, 59, 59, 999);
      expiresAtISO = expDate.toISOString();
    }

    try {
      await PricesAPI.generateDiscountCode({
        code: createForm.code.trim().toUpperCase(),
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
        expiresAt: null,
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
    setCreateForm((prev) => ({ ...prev, code }));
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          โค้ดส่วนลด ({discountCodes.length})
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchDiscountCodes}
            disabled={isLoading}
            sx={{ borderRadius: 2 }}
          >
            รีเฟรช
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
            sx={{ borderRadius: 2 }}
          >
            สร้างโค้ด
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="text.secondary">กำลังโหลด...</Typography>
          </CardContent>
        </Card>
      ) : discountCodes.length === 0 ? (
        <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="text.secondary">ยังไม่มีโค้ดส่วนลด</Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile View: Clean, readable cards */}
          <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {discountCodes.map((code) => {
              const expired = isCodeExpired(code);
              const depleted = code.count <= 0;
              return (
                <Paper
                  key={code.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    borderColor: expired ? '#fecaca' : depleted ? '#e2e8f0' : '#e2e8f0',
                    bgcolor: expired ? '#fef2f2' : depleted ? '#f8fafc' : '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Row 1: Code Badge & Status */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Box
                      onClick={() => handleCopyCode(code.code)}
                      sx={{
                        bgcolor: expired ? '#fee2e2' : '#f1f5f9',
                        px: 1.2,
                        py: 0.5,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8,
                        cursor: 'pointer',
                        border: '1px dashed',
                        borderColor: expired ? '#fca5a5' : '#cbd5e1',
                        '&:active': { bgcolor: '#e2e8f0' },
                      }}
                    >
                      <Typography fontWeight={700} fontFamily="monospace" sx={{ fontSize: '1rem', letterSpacing: 0.5, color: '#1e293b' }}>
                        {code.code}
                      </Typography>
                      <CopyIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    </Box>

                    <Box>
                      {expired ? (
                        <Chip label="หมดอายุ" color="error" size="small" sx={{ fontWeight: 700, height: 24 }} />
                      ) : depleted ? (
                        <Chip label="หมดสิทธิ์" color="default" size="small" sx={{ height: 24 }} />
                      ) : (
                        <Chip label={`เหลือ ${code.count} สิทธิ์`} color="success" size="small" sx={{ fontWeight: 700, height: 24 }} />
                      )}
                    </Box>
                  </Stack>

                  {/* Row 2: Discount Value & Expiration Date */}
                  <Grid container spacing={1.5} sx={{ mb: 1 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        ส่วนลด
                      </Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ color: '#b03052', fontSize: '1.25rem', lineHeight: 1.2 }}>
                        {getDiscountDisplay(code)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        วันหมดอายุ
                      </Typography>
                      {code.expiresAt ? (
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: expired ? '#dc2626' : '#1e293b', fontSize: '0.85rem' }}
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
                            fontSize: '0.72rem',
                            height: 22,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Grid>
                  </Grid>

                  {/* Row 3: Timestamps */}
                  <Divider sx={{ my: 1, borderColor: expired ? '#fee2e2' : '#f1f5f9' }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                      สร้างเมื่อ: {formatDate(code.createdAt)}
                    </Typography>
                    {code.usedAt && (
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                        ใช้ล่าสุด: {formatDate(code.usedAt)}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>

          {/* Desktop View: Full Table */}
          <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', boxShadow: 'none', display: { xs: 'none', md: 'block' } }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>โค้ด</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>ส่วนลด</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>จำนวน</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>วันหมดอายุ</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>สถานะ</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>สร้างเมื่อ</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>ใช้เมื่อ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {discountCodes.map((code) => {
                      const expired = isCodeExpired(code);
                      const depleted = code.count <= 0;
                      return (
                        <TableRow
                          key={code.id}
                          sx={{
                            opacity: expired ? 0.75 : 1,
                            bgcolor: expired ? '#fffafa' : 'inherit',
                            '&:hover': { bgcolor: '#f8fafc' },
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography fontWeight={700} fontFamily="monospace">
                                {code.code}
                              </Typography>
                              <IconButton size="small" onClick={() => handleCopyCode(code.code)}>
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography color="primary" fontWeight={700}>
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
                            ) : depleted ? (
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
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Discount Code Dialog - Sleek, Compact & Modern */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: { xs: 'calc(100% - 32px)', sm: 520 },
            mx: 'auto',
            borderRadius: 3.5,
            p: { xs: 1, sm: 1.5 },
            boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, pt: 1, px: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b', fontSize: '1.2rem' }}>
            สร้างโค้ดส่วนลด
          </Typography>
          <IconButton onClick={() => setCreateDialog(false)} size="small" sx={{ color: '#94a3b8' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2, py: 1.5 }}>
          <Stack spacing={2.5}>
            {/* 1. Code Input with inline Random Generator */}
            <TextField
              label="รหัสโค้ดส่วนลด"
              size="small"
              value={createForm.code}
              onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
              fullWidth
              placeholder="เช่น SAVE100"
              slotProps={{
                input: {
                  sx: {
                    borderRadius: 2,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: 1,
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        size="small"
                        onClick={generateRandomCode}
                        startIcon={<RandomIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          color: '#b03052',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          minWidth: 'auto',
                          px: 1.2,
                          py: 0.4,
                          borderRadius: 1.5,
                          bgcolor: '#fff0f3',
                          border: '1px solid #fecdd3',
                          '&:hover': { bgcolor: '#ffe0e6' },
                        }}
                      >
                        สุ่มรหัส
                      </Button>
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  style: { textTransform: 'uppercase' },
                },
              }}
            />

            {/* 2. Discount Type & Value in a Harmonized Row */}
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.2 }}>
                ประเภทและมูลค่าส่วนลด
              </Typography>
              <Grid container spacing={1.5} alignItems="center">
                <Grid size={{ xs: 12, sm: 5.5 }}>
                  <ToggleButtonGroup
                    value={discountType}
                    exclusive
                    onChange={(_, val) => val && setDiscountType(val)}
                    fullWidth
                    size="small"
                    sx={{
                      bgcolor: '#ffffff',
                      p: 0.3,
                      borderRadius: 2,
                      border: '1px solid #cbd5e1',
                      height: 40,
                      '& .MuiToggleButton-root': {
                        border: 'none',
                        borderRadius: 1.5,
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        textTransform: 'none',
                        color: '#64748b',
                        px: 1,
                        '&.Mui-selected': {
                          bgcolor: '#b03052',
                          color: '#ffffff',
                          boxShadow: '0 2px 6px rgba(176, 48, 82, 0.25)',
                          '&:hover': { bgcolor: '#9c2444' },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="amount">฿ บาท</ToggleButton>
                    <ToggleButton value="percentage">% เปอร์เซ็นต์</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid size={{ xs: 12, sm: 6.5 }}>
                  {discountType === 'amount' ? (
                    <PriceField
                      label="จำนวนเงินที่ลด (บาท)"
                      value={createForm.discount}
                      onChange={(val) => setCreateForm({ ...createForm, discount: val })}
                      fullWidth
                      size="small"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#ffffff' } }}
                    />
                  ) : (
                    <TextField
                      label="เปอร์เซ็นต์ที่ลด"
                      type="number"
                      size="small"
                      value={createForm.discountPercentage || ''}
                      onChange={(e) => setCreateForm({ ...createForm, discountPercentage: Number(e.target.value) })}
                      fullWidth
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography variant="body2" fontWeight={700} color="#b03052">
                                %
                              </Typography>
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2, bgcolor: '#ffffff' },
                        },
                        htmlInput: { min: 1, max: 100 },
                      }}
                    />
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* 3. Quota & Expiration in a Compact 2-column Layout */}
            <Grid container spacing={1.5} alignItems="flex-start">
              <Grid size={{ xs: 12, sm: 5.5 }}>
                <TextField
                  label="จำนวนสิทธิ์ (ครั้ง)"
                  type="number"
                  size="small"
                  value={createForm.count || ''}
                  onChange={(e) => setCreateForm({ ...createForm, count: parseInt(e.target.value) || 1 })}
                  fullWidth
                  slotProps={{
                    input: { sx: { borderRadius: 2 } },
                    htmlInput: { min: 1 },
                  }}
                  helperText="จำนวนครั้งที่ใช้ได้"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6.5 }}>
                <CustomDatePicker
                  label="วันหมดอายุ (ถ้ามี)"
                  value={createForm.expiresAt}
                  onChange={(newDate: Date | null) => setCreateForm({ ...createForm, expiresAt: newDate })}
                  minDate={new Date()}
                  size="small"
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  }}
                />
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, px: 0.5, fontSize: '0.75rem', lineHeight: 1.3 }}>
                  {createForm.expiresAt ? 'หมดอายุ 23:59 น. ของวันที่เลือก' : '💡 ไม่เลือก = ไม่มีวันหมดอายุ'}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ pt: 1, pb: 1.5, px: 2 }}>
          <Button
            onClick={() => setCreateDialog(false)}
            color="inherit"
            sx={{ borderRadius: 2, fontWeight: 600, color: '#64748b' }}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateDiscountCode}
            sx={{
              borderRadius: 2.5,
              fontWeight: 700,
              px: 3,
              py: 0.9,
              bgcolor: '#b03052',
              boxShadow: '0 4px 12px rgba(176, 48, 82, 0.25)',
              '&:hover': { bgcolor: '#8e2340' },
            }}
          >
            สร้างโค้ดส่วนลด
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DiscountCodeTab;
