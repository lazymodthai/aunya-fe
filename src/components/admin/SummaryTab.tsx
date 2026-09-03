import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Bed as BedIcon,
  ExpandMore as ExpandMoreIcon,
  Hotel as HotelIcon,
  Percent as DiscountIcon,
  Assessment as BarChartIcon,
  TableChart as TableChartIcon,
  ViewStream as CardViewIcon,
} from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import BookingAPI, { SummaryResponse } from '@apis/booking';

function SummaryTab() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  const fetchSummary = async (year: number) => {
    setLoading(true);
    try {
      const { data } = await BookingAPI.getSummary(year);
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedYear);
  }, [selectedYear]);

  // Max monthly revenue for progress bar calculation
  const maxMonthlyRevenue = useMemo(() => {
    if (!summaryData || !summaryData.monthly) return 1;
    const max = Math.max(...summaryData.monthly.map(m => m.revenue));
    return max > 0 ? max : 1;
  }, [summaryData]);

  if (loading && !summaryData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header & Year Selector */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          สรุปยอดรายได้
        </Typography>
        <FormControl size="small" sx={{ width: 115 }}>
          <InputLabel id="summary-year-label">ปี</InputLabel>
          <Select
            labelId="summary-year-label"
            value={selectedYear}
            label="ปี"
            onChange={(e) => setSelectedYear(e.target.value as number)}
            sx={{ borderRadius: 2 }}
          >
            {yearOptions.map((year) => (
              <MenuItem key={year} value={year}>
                {year + 543}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {summaryData && (
        <Stack spacing={2.5}>
          {/* 1. Hero Annual Card (Modern Dark Card) */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, letterSpacing: 0.5 }}>
                  รายได้ตลอดปี {selectedYear + 543} (ไม่รวมมัดจำ)
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    color: '#f8fafc',
                    fontSize: { xs: '1.75rem', sm: '2.25rem' },
                    my: 0.5,
                    letterSpacing: -0.5,
                  }}
                >
                  ฿{summaryData.yearly.revenue.toLocaleString()}
                </Typography>
              </Box>
              <Chip
                label={`ปี ${selectedYear + 543}`}
                size="small"
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', fontWeight: 600, fontSize: '0.75rem' }}
              />
            </Stack>

            {/* Quick Metrics Bar inside Hero Card */}
            <Grid container spacing={1} sx={{ mt: 1, pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Grid size={{ xs: 4 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
                  ค่าห้องพัก
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.95rem' }, color: '#e2e8f0' }}>
                  ฿{summaryData.yearly.rentRevenue.toLocaleString()}
                </Typography>
              </Grid>

              <Grid size={{ xs: 4 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
                  บริการเสริม
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.95rem' }, color: '#38bdf8' }}>
                  ฿{(summaryData.yearly.extraBedRevenue + summaryData.yearly.extraTowelRevenue).toLocaleString()}
                </Typography>
              </Grid>

              <Grid size={{ xs: 4 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
                  ส่วนลดที่ใช้
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.95rem' }, color: '#f87171' }}>
                  -฿{summaryData.yearly.discountUsed.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>

            {/* Sub-pills: Bookings & Guests */}
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.8 }}>
              <Chip
                icon={<CalendarIcon sx={{ fontSize: '14px !important', color: '#cbd5e1 !important' }} />}
                label={`${summaryData.yearly.bookingCount} การจอง (${summaryData.yearly.nightCount} คืน)`}
                size="small"
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', fontSize: '0.75rem', height: 24 }}
              />
              <Chip
                icon={<PeopleIcon sx={{ fontSize: '14px !important', color: '#cbd5e1 !important' }} />}
                label={`${summaryData.yearly.guestCount} ผู้เข้าพัก (เด็ก ${summaryData.yearly.childrenCount})`}
                size="small"
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', fontSize: '0.75rem', height: 24 }}
              />
            </Stack>
          </Paper>

          {/* 2. Current Month Card (เดือนปัจจุบัน) */}
          {summaryData.currentMonth && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2.5,
                bgcolor: '#f0fdf4',
                border: '1px solid #bbf7d0',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#166534', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon fontSize="small" /> เดือนปัจจุบัน ({thaiMonths[summaryData.currentMonth.month - 1]})
                </Typography>
                <Chip
                  label={`${summaryData.currentMonth.bookingCount} จอง (${summaryData.currentMonth.nightCount} คืน)`}
                  size="small"
                  color="success"
                  sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                />
              </Stack>

              <Grid container spacing={1.5} alignItems="center">
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#15803d', display: 'block' }}>
                    รายได้ที่รับจริง (ไม่รวมมัดจำ)
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="success.main" sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
                    ฿{summaryData.currentMonth.revenue.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    รายได้ที่คาดหวัง (รวมค้างชำระ)
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="warning.main">
                    ฿{summaryData.currentMonth.potentialRevenue.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              {/* Breakdown metrics for Current Month */}
              <Grid container spacing={1} sx={{ mt: 1, pt: 1.2, borderTop: '1px dashed #bbf7d0' }}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" sx={{ color: '#166534', display: 'block', fontSize: '0.7rem' }}>
                    ค่าห้องพัก
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.9rem' }, color: '#15803d' }}>
                    ฿{summaryData.currentMonth.rentRevenue.toLocaleString()}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" sx={{ color: '#166534', display: 'block', fontSize: '0.7rem' }}>
                    บริการเสริม
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.9rem' }, color: '#0284c7' }}>
                    ฿{(summaryData.currentMonth.extraBedRevenue + summaryData.currentMonth.extraTowelRevenue).toLocaleString()}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" sx={{ color: '#166534', display: 'block', fontSize: '0.7rem' }}>
                    ส่วนลดที่ใช้
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.9rem' }, color: '#dc2626' }}>
                    -฿{summaryData.currentMonth.discountUsed.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* 3. Monthly Breakdown (12 Months Visual Cards & Progress List / Table View) */}
          <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1.5}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChartIcon color="primary" fontSize="small" /> สรุปรายได้รายเดือน (12 เดือน)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {viewMode === 'card'
                      ? 'แตะที่แต่ละเดือนเพื่อดูรายละเอียดค่าห้อง, เตียงเสริม, ผ้าเช็ดตัว และส่วนลด'
                      : 'แสดงรายงานรายละเอียดรายได้และยอดจองแบบตาราง'}
                  </Typography>
                </Box>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, newView) => {
                    if (newView) setViewMode(newView);
                  }}
                  size="small"
                  sx={{
                    bgcolor: '#f1f5f9',
                    p: 0.4,
                    borderRadius: 2.5,
                    alignSelf: { xs: 'flex-end', sm: 'center' },
                    '& .MuiToggleButton-root': {
                      border: 'none',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      color: '#64748b',
                      '&.Mui-selected': {
                        bgcolor: '#ffffff',
                        color: '#b03052',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      },
                    },
                  }}
                >
                  <ToggleButton value="card" aria-label="card view">
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <CardViewIcon sx={{ fontSize: 16 }} />
                      <span>มุมมองการ์ด</span>
                    </Stack>
                  </ToggleButton>
                  <ToggleButton value="table" aria-label="table view">
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <TableChartIcon sx={{ fontSize: 16 }} />
                      <span>มุมมองตาราง</span>
                    </Stack>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {viewMode === 'card' ? (
                <Stack spacing={1}>
                  {summaryData.monthly.map((m) => {
                    const isExpanded = expandedMonth === m.month;
                    const percent = Math.round((m.revenue / maxMonthlyRevenue) * 100);
                    const isCurrentMonth = summaryData.currentMonth?.month === m.month && selectedYear === new Date().getFullYear();

                    return (
                      <Paper
                        key={m.month}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderColor: isCurrentMonth ? 'success.main' : isExpanded ? '#b03052' : '#eee',
                          bgcolor: isCurrentMonth ? '#f9fdfa' : isExpanded ? '#fffafb' : '#ffffff',
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Month Row Bar */}
                        <Box
                          onClick={() => setExpandedMonth(isExpanded ? null : m.month)}
                          sx={{
                            p: { xs: 1.2, sm: 1.5 },
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1.5,
                          }}
                        >
                          {/* Left: Month Name & Tag */}
                          <Box sx={{ minWidth: { xs: 75, sm: 95 } }}>
                            <Typography variant="body2" fontWeight={700} sx={{ color: isCurrentMonth ? 'success.main' : '#222' }}>
                              {thaiMonthsShort[m.month - 1]} {isCurrentMonth ? '(ปัจจุบัน)' : ''}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#888', fontSize: '0.7rem' }}>
                              {m.bookingCount > 0 ? `${m.bookingCount} จอง (${m.nightCount} คืน)` : 'ไม่มีจอง'}
                            </Typography>
                          </Box>

                          {/* Center: Visual Progress Bar */}
                          <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }}>
                            <LinearProgress
                              variant="determinate"
                              value={percent}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: isCurrentMonth ? '#22c55e' : '#b03052',
                                  borderRadius: 4,
                                },
                              }}
                            />
                          </Box>

                          {/* Right: Revenue & Arrow */}
                          <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{
                                color: m.revenue > 0 ? (isCurrentMonth ? 'success.main' : '#b03052') : '#aaa',
                                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                              }}
                            >
                              ฿{m.revenue.toLocaleString()}
                            </Typography>
                            <ExpandMoreIcon
                              sx={{
                                fontSize: 18,
                                color: '#888',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Mobile Linear Bar under the row */}
                        <Box sx={{ px: 1.2, pb: 0.5, display: { xs: 'block', sm: 'none' } }}>
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              bgcolor: '#f1f5f9',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: isCurrentMonth ? '#22c55e' : '#b03052',
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>

                        {/* Expanded Sub-details */}
                        {isExpanded && (
                          <Box sx={{ p: 1.5, pt: 1, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                            <Grid container spacing={1}>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  ค่าห้องพัก
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  ฿{m.rentRevenue.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  เตียงเสริม
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="primary.main">
                                  ฿{m.extraBedRevenue.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  ผ้าเช็ดตัวเพิ่ม
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="primary.main">
                                  ฿{m.extraTowelRevenue.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  ส่วนลดที่ใช้
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="error.main">
                                  -฿{m.discountUsed.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">
                                  👥 ผู้เข้าพัก: {m.guestCount} คน (เด็ก {m.childrenCount} คน) • รายได้คาดหวัง: ฿{m.potentialRevenue.toLocaleString()}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        )}
                      </Paper>
                    );
                  })}
                </Stack>
              ) : (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    borderColor: '#e2e8f0',
                    overflowX: 'auto',
                  }}
                >
                  <Table size="small" sx={{ minWidth: 680 }}>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>เดือน</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>จอง / คืน</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>ค่าห้องพัก</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>เตียงเสริม</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>ผ้าเช็ดตัว</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>ส่วนลด</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 1.5 }}>รายได้สุทธิ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {summaryData.monthly.map((m) => {
                        const isCurrentMonth = summaryData.currentMonth?.month === m.month && selectedYear === new Date().getFullYear();
                        return (
                          <TableRow
                            key={m.month}
                            sx={{
                              bgcolor: isCurrentMonth ? 'rgba(34, 197, 94, 0.05)' : 'inherit',
                              '&:hover': { bgcolor: isCurrentMonth ? 'rgba(34, 197, 94, 0.09)' : '#f8fafc' },
                              transition: 'background-color 0.15s',
                            }}
                          >
                            <TableCell sx={{ fontWeight: isCurrentMonth ? 700 : 600, color: isCurrentMonth ? 'success.main' : '#1e293b' }}>
                              {thaiMonths[m.month - 1]} {isCurrentMonth ? ' (ปัจจุบัน)' : ''}
                            </TableCell>
                            <TableCell align="center" sx={{ color: m.bookingCount > 0 ? '#1e293b' : '#94a3b8' }}>
                              {m.bookingCount > 0 ? `${m.bookingCount} จอง (${m.nightCount} คืน)` : '-'}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500 }}>
                              {m.rentRevenue > 0 ? `฿${m.rentRevenue.toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell align="right" sx={{ color: m.extraBedRevenue > 0 ? '#b03052' : '#94a3b8' }}>
                              {m.extraBedRevenue > 0 ? `฿${m.extraBedRevenue.toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell align="right" sx={{ color: m.extraTowelRevenue > 0 ? '#b03052' : '#94a3b8' }}>
                              {m.extraTowelRevenue > 0 ? `฿${m.extraTowelRevenue.toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell align="right" sx={{ color: m.discountUsed > 0 ? '#dc2626' : '#94a3b8', fontWeight: m.discountUsed > 0 ? 600 : 400 }}>
                              {m.discountUsed > 0 ? `-฿${m.discountUsed.toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontWeight: 700,
                                color: m.revenue > 0 ? (isCurrentMonth ? 'success.main' : '#b03052') : '#94a3b8',
                              }}
                            >
                              {m.revenue > 0 ? `฿${m.revenue.toLocaleString()}` : '฿0'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    {summaryData.yearly && (
                      <TableFooter sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, color: '#1e293b', py: 1.5 }}>
                            รวมทั้งปี ({selectedYear + 543})
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {summaryData.yearly.bookingCount} จอง ({summaryData.yearly.nightCount} คืน)
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            ฿{summaryData.yearly.rentRevenue.toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#b03052' }}>
                            ฿{summaryData.yearly.extraBedRevenue.toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#b03052' }}>
                            ฿{summaryData.yearly.extraTowelRevenue.toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#dc2626' }}>
                            {summaryData.yearly.discountUsed > 0 ? `-฿${summaryData.yearly.discountUsed.toLocaleString()}` : '฿0'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: '#15803d', fontSize: '1rem' }}>
                            ฿{summaryData.yearly.revenue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    )}
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
}

export default SummaryTab;

