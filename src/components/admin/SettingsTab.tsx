import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import SettingsAPI, { Setting } from '@apis/settings';
import { useEffect, useState } from 'react';

interface SettingsTabProps {
  showNoti: (type: 'success' | 'error', message: string) => void;
}

const getUnit = (key: string): string => {
  const k = key.toLowerCase();
  if (k.includes('price')) return 'บาท';
  if (k.includes('month')) return 'เดือน';
  if (k.includes('guest') || k.includes('children')) return 'คน';
  if (k.includes('count') || k.includes('bed') || k.includes('towel')) return 'ชุด';
  return '';
};

function SettingsTab({ showNoti }: SettingsTabProps) {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ key: '', value: '', description: '', type: 'text' });

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data } = await SettingsAPI.getAll();
      const list = data.settings || [];
      setSettings(list);
      const values: Record<string, string> = {};
      list.forEach((s) => {
        values[s.key] = s.value;
      });
      setEditValues(values);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNoti('error', 'ไม่สามารถโหลดการตั้งค่าได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleValueBlur = async (key: string) => {
    const original = settings.find((s) => s.key === key);
    if (!original || editValues[key] === original.value) return;
    try {
      await SettingsAPI.update(key, editValues[key]);
      showNoti('success', `อัปเดต "${key}" สำเร็จ`);
      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      showNoti('error', `ไม่สามารถอัปเดต "${key}" ได้`);
    }
  };

  const handleToggle = async (key: string, newValue: 'true' | 'false') => {
    const original = settings.find((s) => s.key === key);
    if (original && original.value === newValue) return;

    setEditValues((prev) => ({ ...prev, [key]: newValue }));
    try {
      await SettingsAPI.update(key, newValue);
      showNoti('success', `อัปเดต "${key}" เป็น ${newValue === 'true' ? 'เปิด' : 'ปิด'} สำเร็จ`);
      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      showNoti('error', `ไม่สามารถอัปเดต "${key}" ได้`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      (e.target as HTMLElement).blur();
      handler();
    }
  };

  const handleCreate = async () => {
    if (!createForm.key.trim()) {
      showNoti('error', 'กรุณากรอก key');
      return;
    }
    try {
      await SettingsAPI.create({
        key: createForm.key.trim(),
        value: createForm.value,
        description: createForm.description,
      });
      showNoti('success', 'สร้างการตั้งค่าสำเร็จ');
      setCreateDialog(false);
      setCreateForm({ key: '', value: '', description: '', type: 'text' });
      fetchSettings();
    } catch (error) {
      console.error('Error creating setting:', error);
      showNoti('error', 'ไม่สามารถสร้างการตั้งค่าได้');
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          ตั้งค่า ({settings.length})
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
            disabled={isLoading}
          >
            รีเฟรช
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            เพิ่มการตั้งค่า
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={28} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">กำลังโหลด...</Typography>
        </Box>
      ) : settings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">ยังไม่มีการตั้งค่า</Typography>
        </Box>
      ) : (
        <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', boxShadow: 'none', overflow: 'hidden' }}>
          {settings.map((setting, index) => {
            const isBool = setting.value === 'true' || setting.value === 'false';
            const isTrue = (editValues[setting.key] ?? setting.value) === 'true';
            const unit = getUnit(setting.key);

            return (
              <Box key={setting.key}>
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1.5,
                    bgcolor: '#fff',
                    '&:hover': { bgcolor: '#fcfcfc' },
                  }}
                >
                  {/* Left: Description & Key */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#222' }}>
                      {setting.description || setting.key}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888', fontFamily: 'monospace' }}>
                      {setting.key}
                    </Typography>
                  </Box>

                  {/* Right: Controls */}
                  <Box sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                    {isBool ? (
                      <ButtonGroup
                        size="small"
                        disableElevation
                        sx={{
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '1px solid #d0d0d0',
                        }}
                      >
                        {/* ปิด อยู่ซ้าย */}
                        <Button
                          variant={!isTrue ? 'contained' : 'text'}
                          onClick={() => handleToggle(setting.key, 'false')}
                          sx={{
                            fontWeight: 700,
                            px: 2,
                            py: 0.5,
                            minWidth: 56,
                            borderRadius: 0,
                            bgcolor: !isTrue ? '#d32f2f' : '#f5f5f5',
                            color: !isTrue ? '#fff' : '#757575',
                            '&:hover': {
                              bgcolor: !isTrue ? '#b71c1c' : '#e0e0e0',
                            },
                          }}
                        >
                          ปิด
                        </Button>

                        {/* เปิด อยู่ขวา */}
                        <Button
                          variant={isTrue ? 'contained' : 'text'}
                          onClick={() => handleToggle(setting.key, 'true')}
                          sx={{
                            fontWeight: 700,
                            px: 2,
                            py: 0.5,
                            minWidth: 56,
                            borderRadius: 0,
                            bgcolor: isTrue ? '#2e7d32' : '#f5f5f5',
                            color: isTrue ? '#fff' : '#757575',
                            borderLeft: '1px solid #d0d0d0 !important',
                            '&:hover': {
                              bgcolor: isTrue ? '#1b5e20' : '#e0e0e0',
                            },
                          }}
                        >
                          เปิด
                        </Button>
                      </ButtonGroup>
                    ) : (
                      <TextField
                        size="small"
                        type={!isNaN(Number(setting.value)) ? 'number' : 'text'}
                        value={editValues[setting.key] ?? ''}
                        onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                        onBlur={() => handleValueBlur(setting.key)}
                        onKeyDown={(e) => handleKeyDown(e, () => handleValueBlur(setting.key))}
                        slotProps={{
                          input: {
                            endAdornment: unit ? (
                              <InputAdornment position="end">
                                <Typography variant="caption" sx={{ color: '#777', fontWeight: 500 }}>
                                  {unit}
                                </Typography>
                              </InputAdornment>
                            ) : undefined,
                          },
                        }}
                        sx={{
                          width: { xs: 130, sm: 150 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    )}
                  </Box>
                </Box>
                {index < settings.length - 1 && <Divider />}
              </Box>
            );
          })}
        </Card>
      )}

      {/* Create Setting Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>เพิ่มการตั้งค่าใหม่</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Key"
              value={createForm.key}
              onChange={(e) => setCreateForm({ ...createForm, key: e.target.value })}
              fullWidth
              placeholder="เช่น maxGuests"
            />
            <TextField
              label="คำอธิบาย"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              fullWidth
              placeholder="คำอธิบายการตั้งค่า"
            />
            <Select
              value={createForm.type}
              onChange={(e) => {
                const newType = e.target.value;
                setCreateForm({
                  ...createForm,
                  type: newType,
                  value: newType === 'boolean' ? 'true' : '',
                });
              }}
              size="small"
              fullWidth
            >
              <MenuItem value="text">ข้อความทั่วไป (Text)</MenuItem>
              <MenuItem value="number">ตัวเลข (Number)</MenuItem>
              <MenuItem value="boolean">เปิด / ปิด (Boolean)</MenuItem>
            </Select>

            {createForm.type === 'boolean' ? (
              <ButtonGroup
                size="small"
                disableElevation
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #d0d0d0',
                }}
              >
                <Button
                  variant={createForm.value === 'false' ? 'contained' : 'text'}
                  onClick={() => setCreateForm({ ...createForm, value: 'false' })}
                  sx={{
                    fontWeight: 700,
                    px: 2,
                    py: 0.5,
                    minWidth: 56,
                    borderRadius: 0,
                    bgcolor: createForm.value === 'false' ? '#d32f2f' : '#f5f5f5',
                    color: createForm.value === 'false' ? '#fff' : '#757575',
                    '&:hover': {
                      bgcolor: createForm.value === 'false' ? '#b71c1c' : '#e0e0e0',
                    },
                  }}
                >
                  ปิด
                </Button>
                <Button
                  variant={createForm.value === 'true' ? 'contained' : 'text'}
                  onClick={() => setCreateForm({ ...createForm, value: 'true' })}
                  sx={{
                    fontWeight: 700,
                    px: 2,
                    py: 0.5,
                    minWidth: 56,
                    borderRadius: 0,
                    bgcolor: createForm.value === 'true' ? '#2e7d32' : '#f5f5f5',
                    color: createForm.value === 'true' ? '#fff' : '#757575',
                    borderLeft: '1px solid #d0d0d0 !important',
                    '&:hover': {
                      bgcolor: createForm.value === 'true' ? '#1b5e20' : '#e0e0e0',
                    },
                  }}
                >
                  เปิด
                </Button>
              </ButtonGroup>
            ) : (
              <TextField
                label="Value"
                type={createForm.type === 'number' ? 'number' : 'text'}
                value={createForm.value}
                onChange={(e) => setCreateForm({ ...createForm, value: e.target.value })}
                fullWidth
                placeholder="ค่าของการตั้งค่า"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleCreate}>
            สร้าง
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SettingsTab;
