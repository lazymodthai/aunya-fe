import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  EventNote as EventNoteIcon,
  Refresh as RefreshIcon,
  Sync as SyncIcon,
  Visibility as VisibilityIcon,
  DeleteOutline as DeleteIcon,
  Add as AddIcon,
  CheckCircleOutline as CheckIcon,
  WarningAmber as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import PricesAPI, { YearPriceSummary } from '@apis/prices';
import PriceField from '@components/common/PriceField';
import { useEffect, useState } from 'react';
import { ROOM_ID } from '@configs/app-settings';

interface PriceSettingsTabProps {
  currentYear: number;
  currentMonth: number;
  onRefreshCalendar: (month: number) => void;
  showNoti: (type: 'success' | 'error', message: string) => void;
}

const roomId = ROOM_ID;

const formatPriceRange = (min: number, max: number): string => {
  if (!min && !max) return '-';
  if (min === max || !max) return `฿${min.toLocaleString()}`;
  if (!min) return `฿${max.toLocaleString()}`;
  return `฿${min.toLocaleString()} - ${max.toLocaleString()}`;
};

function PriceSettingsTab({ currentYear, currentMonth, onRefreshCalendar, showNoti }: PriceSettingsTabProps) {
  const [generateDialog, setGenerateDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [selectedYearToReset, setSelectedYearToReset] = useState<number>(currentYear);
  const [yearSummaries, setYearSummaries] = useState<YearPriceSummary[]>([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);

  // Generate form
  const [generateForm, setGenerateForm] = useState({
    year: new Date().getFullYear(),
    weekdayPrice: 2000,
    weekendPrice: 3000,
    holidayPrice: 3500,
    description: '',
  });

  // BOT Holiday Checker state
  const [botCheckYear, setBotCheckYear] = useState<number>(new Date().getFullYear());
  const [botHolidaysDialog, setBotHolidaysDialog] = useState(false);
  const [botHolidaysLoading, setBotHolidaysLoading] = useState(false);
  const [botHolidaysResult, setBotHolidaysResult] = useState<{
    year: number;
    success: boolean;
    message: string;
    holidays: { date: string; description: string }[];
  } | null>(null);

  // DB Holidays Viewer modal state
  const [dbHolidaysDialog, setDbHolidaysDialog] = useState(false);
  const [dbHolidaysLoading, setDbHolidaysLoading] = useState(false);
  const [dbHolidaysData, setDbHolidaysData] = useState<{
    year: number;
    holidays: { date: string; price: number; description: string }[];
  } | null>(null);

  // Sync Holidays state & dialog
  const [syncDialog, setSyncDialog] = useState(false);
  const [syncForm, setSyncForm] = useState<{ year: number; holidayPrice: number }>({
    year: new Date().getFullYear(),
    holidayPrice: 3500,
  });
  const [syncingYear, setSyncingYear] = useState<number | null>(null);

  const fetchYearSummaries = async () => {
    setIsLoadingSummaries(true);
    try {
      const { data } = await PricesAPI.getYearPriceSummaries(roomId);
      if (data && data.summaries) {
        setYearSummaries(data.summaries);
      }
    } catch (error) {
      console.error('Error fetching year price summaries:', error);
    } finally {
      setIsLoadingSummaries(false);
    }
  };

  useEffect(() => {
    fetchYearSummaries();
  }, []);

  const handleGeneratePrices = async () => {
    try {
      const { data } = await PricesAPI.generatePrices({
        year: generateForm.year,
        weekdayPrice: generateForm.weekdayPrice,
        weekendPrice: generateForm.weekendPrice,
        holidayPrice: generateForm.holidayPrice,
        description: generateForm.description,
        roomId: roomId,
      });
      showNoti('success', data.message || `สร้างราคาปี ${generateForm.year} สำเร็จ`);
      setGenerateDialog(false);
      onRefreshCalendar(currentMonth);
      fetchYearSummaries();
    } catch (error: any) {
      console.error('Error generating prices:', error);
      const msg = error?.response?.data?.message || 'ไม่สามารถสร้างราคาได้';
      showNoti('error', msg);
    }
  };

  const handleOpenResetDialog = (year: number) => {
    setSelectedYearToReset(year);
    setResetDialog(true);
  };

  const handleResetPrices = async () => {
    try {
      await PricesAPI.resetPrices({
        year: selectedYearToReset,
        roomId: roomId,
      });
      showNoti('success', `รีเซ็ตราคาปี ${selectedYearToReset} สำเร็จ`);
      setResetDialog(false);
      onRefreshCalendar(currentMonth);
      fetchYearSummaries();
    } catch (error) {
      console.error('Error resetting prices:', error);
      showNoti('error', 'ไม่สามารถรีเซ็ตราคาได้');
    }
  };

  // Check BOT holidays directly
  const handleCheckBotHolidays = async (year: number) => {
    setBotHolidaysLoading(true);
    setBotHolidaysDialog(true);
    try {
      const { data } = await PricesAPI.fetchBotHolidays(year);
      setBotHolidaysResult({
        year,
        success: data.success,
        message: data.message,
        holidays: data.holidays || [],
      });
    } catch (error: any) {
      setBotHolidaysResult({
        year,
        success: false,
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ BOT API',
        holidays: [],
      });
    } finally {
      setBotHolidaysLoading(false);
    }
  };

  // View Holidays from DB for a generated year
  const handleViewDbHolidays = async (year: number) => {
    setDbHolidaysLoading(true);
    setDbHolidaysDialog(true);
    try {
      const { data } = await PricesAPI.getYearHolidaysFromDB(roomId, year);
      setDbHolidaysData({
        year,
        holidays: data.holidays || [],
      });
    } catch (error) {
      console.error('Error fetching DB holidays:', error);
      showNoti('error', `ไม่สามารถดึงข้อมูลวันหยุดปี ${year} ได้`);
    } finally {
      setDbHolidaysLoading(false);
    }
  };

  // Open sync dialog with default price
  const handleOpenSyncDialog = (year: number, defaultHolidayPrice?: number) => {
    setSyncForm({
      year,
      holidayPrice: defaultHolidayPrice && defaultHolidayPrice > 0 ? defaultHolidayPrice : 3500,
    });
    setSyncDialog(true);
  };

  // Sync BOT holidays into an existing year
  const handleConfirmSyncHolidays = async () => {
    const { year, holidayPrice } = syncForm;
    setSyncingYear(year);
    try {
      const { data } = await PricesAPI.syncHolidays({
        roomId,
        year,
        holidayPrice,
      });
      if (data.success) {
        showNoti('success', data.message);
        setSyncDialog(false);
        fetchYearSummaries();
        onRefreshCalendar(currentMonth);
      } else {
        showNoti('error', data.message);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || `ไม่สามารถซิงค์วันหยุดปี ${year} ได้`;
      showNoti('error', msg);
    } finally {
      setSyncingYear(null);
    }
  };

  const handleOpenGenerateDialog = () => {
    const generatedYearSet = new Set(yearSummaries.map(s => s.year));
    const baseYear = new Date().getFullYear();
    let nextAvailableYear = baseYear;
    for (let y = baseYear; y <= baseYear + 3; y++) {
      if (!generatedYearSet.has(y)) {
        nextAvailableYear = y;
        break;
      }
    }
    setGenerateForm(prev => ({ ...prev, year: nextAvailableYear }));
    setGenerateDialog(true);
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={1.5}
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          ตั้งค่าราคา & วันหยุด
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenGenerateDialog}
          sx={{ height: 38 }}
        >
          สร้างราคาทั้งปี
        </Button>
      </Stack>

      <Stack spacing={2.5}>
        {/* 1. Price Breakdown per Year (ดูราคาที่ตั้งของปีก่อนๆ ได้) */}
        <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                  ราคาที่ตั้งไว้ในแต่ละปี ({yearSummaries.length} ปี)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  ดูโครงสร้างราคา วันธรรมดา วันหยุด และวันหยุดนักขัตฤกษ์ที่ตั้งไว้ในแต่ละปี
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchYearSummaries}
                disabled={isLoadingSummaries}
                sx={{ minWidth: { xs: 'auto', sm: 80 } }}
              >
                รีเฟรช
              </Button>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            {isLoadingSummaries ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">กำลังโหลดข้อมูลราคา...</Typography>
              </Box>
            ) : yearSummaries.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                ยังไม่มีข้อมูลราคาที่ถูกสร้างในระบบ กดปุ่ม "สร้างราคาทั้งปี" เพื่อเริ่มต้น
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {yearSummaries.map((summary) => (
                  <Paper
                    key={summary.year}
                    variant="outlined"
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2.5,
                      bgcolor: '#fafafa',
                      borderColor: '#e4e4e4',
                    }}
                  >
                    {/* Header: Year + Days */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#222', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        ปี {summary.year} <span style={{ color: '#666', fontSize: '0.8rem', fontWeight: 400 }}>(พ.ศ. {summary.year + 543})</span>
                      </Typography>
                      <Chip
                        label={`${summary.totalDays} วัน`}
                        size="small"
                        color="default"
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                      />
                    </Box>

                    {/* 3 Price Stat Boxes */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: { xs: 1, sm: 1.5 },
                        my: 1.5,
                      }}
                    >
                      {/* Weekday */}
                      <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, border: '1px solid #eee', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#777', fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', lineHeight: 1.2 }}>
                          วันธรรมดา
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '0.8rem', sm: '1rem' }, mt: 0.3 }}>
                          {formatPriceRange(summary.minWeekdayPrice, summary.maxWeekdayPrice)}
                        </Typography>
                      </Box>

                      {/* Weekend */}
                      <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, border: '1px solid #eee', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#777', fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', lineHeight: 1.2 }}>
                          วันหยุด
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: 'secondary.main', fontSize: { xs: '0.8rem', sm: '1rem' }, mt: 0.3 }}>
                          {formatPriceRange(summary.minWeekendPrice, summary.maxWeekendPrice)}
                        </Typography>
                      </Box>

                      {/* Holiday */}
                      <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, border: '1px solid #eee', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#777', fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', lineHeight: 1.2 }}>
                          นักขัตฤกษ์ ({summary.holidayCount})
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: 'error.main', fontSize: { xs: '0.8rem', sm: '1rem' }, mt: 0.3 }}>
                          {formatPriceRange(summary.minHolidayPrice, summary.maxHolidayPrice)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Action Buttons: Equal 1 row on mobile */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        width: '100%',
                        justifyContent: { xs: 'stretch', sm: 'flex-end' },
                        pt: 0.5,
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />}
                        onClick={() => handleViewDbHolidays(summary.year)}
                        sx={{
                          flex: { xs: 1, sm: 'none' },
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          px: { xs: 0.8, sm: 1.5 },
                          py: 0.5,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        วันหยุด ({summary.holidayCount})
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        startIcon={syncingYear === summary.year ? <CircularProgress size={12} /> : <SyncIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />}
                        onClick={() => handleOpenSyncDialog(summary.year, summary.maxHolidayPrice || summary.maxWeekendPrice)}
                        disabled={syncingYear === summary.year}
                        sx={{
                          flex: { xs: 1, sm: 'none' },
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          px: { xs: 0.8, sm: 1.5 },
                          py: 0.5,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ซิงค์ ธปท.
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon sx={{ fontSize: { xs: 15, sm: 18 } }} />}
                        onClick={() => handleOpenResetDialog(summary.year)}
                        sx={{
                          flex: { xs: 1, sm: 'none' },
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          px: { xs: 0.8, sm: 1.5 },
                          py: 0.5,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        รีเซ็ต
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* 2. Independent BOT Holiday Checker */}
        <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>
              <EventNoteIcon color="primary" fontSize="small" /> ตรวจสอบวันหยุดจาก ธปท.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              ตรวจสอบรายการวันหยุดทางการจาก API ธนาคารแห่งประเทศไทยล่วงหน้า
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="stretch">
              <FormControl size="small" sx={{ width: { xs: '100%', sm: 200 } }}>
                <InputLabel id="bot-check-year-label">เลือกปีที่ต้องการตรวจสอบ</InputLabel>
                <Select
                  labelId="bot-check-year-label"
                  value={botCheckYear}
                  label="เลือกปีที่ต้องการตรวจสอบ"
                  onChange={(e) => setBotCheckYear(Number(e.target.value))}
                >
                  {Array.from({ length: 4 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                    <MenuItem key={y} value={y}>
                      ปี {y} (พ.ศ. {y + 543})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CalendarIcon />}
                onClick={() => handleCheckBotHolidays(botCheckYear)}
                sx={{ height: 40, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}
              >
                ตรวจสอบวันหยุด ธปท. ปี {botCheckYear}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Generate Prices Dialog */}
      <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>สร้างราคาทั้งปี</DialogTitle>
        <DialogContent>
          {(() => {
            const generatedYearSet = new Set(yearSummaries.map(s => s.year));
            const isYearAlreadyGenerated = generatedYearSet.has(generateForm.year);
            const baseYear = new Date().getFullYear();
            const yearOptions: number[] = [];
            for (let y = baseYear; y <= baseYear + 3; y++) {
              yearOptions.push(y);
            }
            if (!yearOptions.includes(generateForm.year) && generateForm.year) {
              yearOptions.push(generateForm.year);
              yearOptions.sort((a, b) => a - b);
            }

            return (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormControl fullWidth>
                  <InputLabel id="generate-year-label">เลือกปีที่ต้องการสร้างราคา</InputLabel>
                  <Select
                    labelId="generate-year-label"
                    value={generateForm.year}
                    label="เลือกปีที่ต้องการสร้างราคา"
                    onChange={(e) => setGenerateForm({ ...generateForm, year: Number(e.target.value) })}
                  >
                    {yearOptions.map((y) => {
                      const isGen = generatedYearSet.has(y);
                      return (
                        <MenuItem key={y} value={y} disabled={isGen}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: isGen ? 400 : 600, color: isGen ? 'text.disabled' : 'text.primary' }}>
                              ปี {y} (พ.ศ. {y + 543})
                            </Typography>
                            {isGen && (
                              <Chip
                                label="สร้างราคาแล้ว"
                                size="small"
                                color="default"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                {isYearAlreadyGenerated && (
                  <Alert severity="warning">
                    ปี <strong>{generateForm.year}</strong> (พ.ศ. {generateForm.year + 543}) มีข้อมูลราคาในระบบแล้ว หากต้องการตั้งราคาใหม่ กรุณากด "รีเซ็ตราคา" ของปีนี้ก่อน
                  </Alert>
                )}

                <PriceField
                  label="ราคาวันธรรมดา (จันทร์-พฤหัส)"
                  value={generateForm.weekdayPrice}
                  onChange={(val) => setGenerateForm({ ...generateForm, weekdayPrice: val })}
                  fullWidth
                  disabled={isYearAlreadyGenerated}
                />
                <PriceField
                  label="ราคาวันหยุด (ศุกร์-อาทิตย์)"
                  value={generateForm.weekendPrice}
                  onChange={(val) => setGenerateForm({ ...generateForm, weekendPrice: val })}
                  fullWidth
                  disabled={isYearAlreadyGenerated}
                />
                <PriceField
                  label="ราคาวันหยุดนักขัตฤกษ์"
                  value={generateForm.holidayPrice}
                  onChange={(val) => setGenerateForm({ ...generateForm, holidayPrice: val })}
                  fullWidth
                  disabled={isYearAlreadyGenerated}
                  helperText="ระบบจะเชื่อมต่อ ธปท. เพื่อดึงวันหยุดให้อัตโนมัติ (หากเชื่อมต่อไม่ได้ระบบจะสร้างราคาปกติให้โดยไม่ติดขัด)"
                />
                <TextField
                  label="รายละเอียด (ไม่บังคับ)"
                  value={generateForm.description}
                  onChange={(e) => setGenerateForm({ ...generateForm, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  disabled={isYearAlreadyGenerated}
                />
                <Button
                  variant="text"
                  size="small"
                  startIcon={<EventNoteIcon />}
                  onClick={() => handleCheckBotHolidays(generateForm.year)}
                  sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                >
                  ตรวจสอบวันหยุด ธปท. ปี {generateForm.year} ก่อนสร้าง
                </Button>
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={handleGeneratePrices}
            disabled={yearSummaries.some(s => s.year === generateForm.year) || !generateForm.year}
          >
            สร้างราคา
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Prices Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>ยืนยันการรีเซ็ตราคา</DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการรีเซ็ตราคาทั้งหมดของปี <strong>{selectedYearToReset}</strong> (พ.ศ. {selectedYearToReset + 543}) ใช่หรือไม่?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            การดำเนินการนี้จะลบข้อมูลราคาทั้งหมดของปีนี้และไม่สามารถยกเลิกได้
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={handleResetPrices}>
            รีเซ็ตราคา
          </Button>
        </DialogActions>
      </Dialog>

      {/* BOT Holidays Checker Modal */}
      <Dialog
        open={botHolidaysDialog}
        onClose={() => setBotHolidaysDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              วันหยุดนักขัตฤกษ์จาก ธปท. ปี {botHolidaysResult?.year} (พ.ศ. {(botHolidaysResult?.year || 0) + 543})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ข้อมูลทางการจาก API ธนาคารแห่งประเทศไทย (Bank of Thailand)
            </Typography>
          </Box>
          <IconButton onClick={() => setBotHolidaysDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {botHolidaysLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={32} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">กำลังเชื่อมต่อกับ ธปท. เพื่อดึงข้อมูลวันหยุด...</Typography>
            </Box>
          ) : botHolidaysResult ? (
            <Stack spacing={2}>
              {botHolidaysResult.success ? (
                <Alert severity="success" icon={<CheckIcon fontSize="inherit" />}>
                  {botHolidaysResult.message}
                </Alert>
              ) : (
                <Alert severity="warning" icon={<WarningIcon fontSize="inherit" />}>
                  {botHolidaysResult.message}
                </Alert>
              )}

              {botHolidaysResult.holidays.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: 80 }}>ลำดับ</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 140 }}>วันที่</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>ชื่อวันหยุด (ไทย)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {botHolidaysResult.holidays.map((h, idx) => (
                        <TableRow key={h.date} hover>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{h.date}</TableCell>
                          <TableCell>{h.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">ไม่พบรายการวันหยุดสำหรับปีนี้</Typography>
                </Box>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          {botHolidaysResult?.success && botHolidaysResult.holidays.length > 0 && yearSummaries.some(s => s.year === botHolidaysResult.year) ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SyncIcon />}
              onClick={() => {
                const targetSummary = yearSummaries.find(s => s.year === botHolidaysResult.year);
                setBotHolidaysDialog(false);
                handleOpenSyncDialog(botHolidaysResult.year, targetSummary?.maxHolidayPrice || targetSummary?.maxWeekendPrice);
              }}
            >
              นำวันหยุดไปอัปเดตลงปฏิทินราคาปี {botHolidaysResult.year}
            </Button>
          ) : <Box />}
          <Button variant="outlined" onClick={() => setBotHolidaysDialog(false)}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sync Holidays Confirmation & Price Dialog */}
      <Dialog open={syncDialog} onClose={() => setSyncDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>ซิงค์วันหยุด ธปท. ปี {syncForm.year}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 0.5 }}>
            ระบบจะดึงรายการวันหยุดราชการจาก ธปท. (Bank of Thailand) มาปรับประเภทวันในปฏิทินให้เป็น <strong>วันหยุดนักขัตฤกษ์</strong> และอัปเดตราคาให้โดยอัตโนมัติ
          </Typography>
          <PriceField
            label="ราคาวันหยุดนักขัตฤกษ์ที่จะนำไปใช้"
            value={syncForm.holidayPrice}
            onChange={(val) => setSyncForm({ ...syncForm, holidayPrice: val })}
            fullWidth
            helperText="ราคาที่จะถูกนำไปตั้งให้กับทุกวันหยุดนักขัตฤกษ์ของปีนี้"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSyncDialog(false)}>ยกเลิก</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={syncingYear === syncForm.year ? <CircularProgress size={16} /> : <SyncIcon />}
            onClick={handleConfirmSyncHolidays}
            disabled={syncingYear === syncForm.year}
          >
            ยืนยันการซิงค์ราคา
          </Button>
        </DialogActions>
      </Dialog>

      {/* DB Holidays Viewer Modal */}
      <Dialog
        open={dbHolidaysDialog}
        onClose={() => setDbHolidaysDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              วันหยุดนักขัตฤกษ์ในระบบ ปี {dbHolidaysData?.year} (พ.ศ. {(dbHolidaysData?.year || 0) + 543})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              รายการวันที่ถูกตั้งเป็นประเภท HOLIDAY ในปฏิทินราคา
            </Typography>
          </Box>
          <IconButton onClick={() => setDbHolidaysDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {dbHolidaysLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={32} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">กำลังโหลดรายการวันหยุด...</Typography>
            </Box>
          ) : dbHolidaysData && dbHolidaysData.holidays.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: 80 }}>ลำดับ</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 140 }}>วันที่</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>ชื่อวันหยุด</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, width: 140 }}>ราคาที่ตั้ง</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dbHolidaysData.holidays.map((h, idx) => (
                    <TableRow key={h.date} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{h.date}</TableCell>
                      <TableCell>{h.description}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>
                        ฿{h.price.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">ไม่พบรายการวันหยุดในปฏิทินราคาของปีนี้</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setDbHolidaysDialog(false)}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PriceSettingsTab;
