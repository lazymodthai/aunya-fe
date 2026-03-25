import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
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
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import BookingAPI, { SummaryResponse } from '@apis/booking';

function SummaryTab() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
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

  if (loading && !summaryData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const StatCard = ({ title, value, subtitle, color }: { title: string; value: string | number; subtitle?: string; color?: string }) => (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} color={color || 'primary.main'}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          สรุปยอดการจอง
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>ปี</InputLabel>
          <Select
            value={selectedYear}
            label="ปี"
            onChange={(e) => setSelectedYear(e.target.value as number)}
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
        <Stack spacing={4}>
          {/* Yearly Overview */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              ภาพรวมปี {selectedYear + 543}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  title="รายได้ทั้งหมด"
                  value={`฿${summaryData.yearly.revenue.toLocaleString()}`}
                  subtitle={`จากรายได้ห้องพัก ฿${summaryData.yearly.rentRevenue.toLocaleString()}`}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <StatCard
                  title="จำนวนการจอง"
                  value={`${summaryData.yearly.bookingCount} ครั้ง`}
                  subtitle={`รวมทั้งหมด ${summaryData.yearly.nightCount} คืน`}
                  color="secondary.main"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <StatCard
                  title="จำนวนผู้เข้าพัก"
                  value={summaryData.yearly.guestCount}
                  subtitle={`ผู้ใหญ่ ${summaryData.yearly.guestCount} เด็ก ${summaryData.yearly.childrenCount}`}
                  color="success.main"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Current Month Overview */}
          {summaryData.currentMonth && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                เดือนปัจจุบัน ({thaiMonths[summaryData.currentMonth.month - 1]})
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StatCard
                    title="รายได้เดือนนี้"
                    value={`฿${summaryData.currentMonth.revenue.toLocaleString()}`}
                    color="primary.dark"
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <StatCard
                    title="การจองเดือนนี้"
                    value={`${summaryData.currentMonth.bookingCount} ครั้ง`}
                    subtitle={`รวมทั้งหมด ${summaryData.currentMonth.nightCount} คืน`}
                    color="secondary.dark"
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <StatCard
                    title="รายได้ที่คาดหวัง"
                    value={`฿${summaryData.currentMonth.potentialRevenue.toLocaleString()}`}
                    subtitle="รวมที่ยังไม่ชำระ"
                    color="warning.main"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Monthly Table */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              สรุปรายเดือน
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>เดือน</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>รายได้รวม</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>ค่าห้อง</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>เตียงเสริม</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>ผ้าเช็ดตัว</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>ส่วนลด</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>จำนวนจอง</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>จำนวนคืน</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summaryData.monthly.map((m) => (
                    <TableRow key={m.month} hover>
                      <TableCell>{thaiMonths[m.month - 1]}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ฿{m.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">฿{m.rentRevenue.toLocaleString()}</TableCell>
                      <TableCell align="right">฿{m.extraBedRevenue.toLocaleString()}</TableCell>
                      <TableCell align="right">฿{m.extraTowelRevenue.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>-฿{m.discountUsed.toLocaleString()}</TableCell>
                      <TableCell align="right">{m.bookingCount}</TableCell>
                      <TableCell align="right">{m.nightCount}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'rgba(176, 48, 82, 0.05)' }}>
                    <TableCell sx={{ fontWeight: 700 }}>รวมทั้งปี</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ฿{summaryData.yearly.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>฿{summaryData.yearly.rentRevenue.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>฿{summaryData.yearly.extraBedRevenue.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>฿{summaryData.yearly.extraTowelRevenue.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>-฿{summaryData.yearly.discountUsed.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{summaryData.yearly.bookingCount}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{summaryData.yearly.nightCount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
      )}
    </Box>
  );
}

export default SummaryTab;
