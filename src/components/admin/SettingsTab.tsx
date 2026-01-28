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
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import SettingsAPI, { Setting } from '@apis/settings';
import { useEffect, useState } from 'react';

interface SettingsTabProps {
  showNoti: (type: 'success' | 'error', message: string) => void;
}

function SettingsTab({ showNoti }: SettingsTabProps) {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ key: '', value: '', description: '' });

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
      await SettingsAPI.create(createForm);
      showNoti('success', 'สร้างการตั้งค่าสำเร็จ');
      setCreateDialog(false);
      setCreateForm({ key: '', value: '', description: '' });
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
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
            disabled={isLoading}
          >
            รีเฟรช
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            เพิ่มการตั้งค่า
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">กำลังโหลด...</Typography>
        </Box>
      ) : settings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">ยังไม่มีการตั้งค่า</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {settings.map((setting) => (
            <Card key={setting.key} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={600} fontFamily="monospace">
                      {setting.key}
                    </Typography>
                  </Stack>
                  {setting.description && (
                    <Typography variant="body2" color="text.secondary">
                      {setting.description}
                    </Typography>
                  )}
                  <TextField
                    label="ค่า (value)"
                    size="small"
                    value={editValues[setting.key] ?? ''}
                    onChange={(e) => setEditValues({ ...editValues, [setting.key]: e.target.value })}
                    onBlur={() => handleValueBlur(setting.key)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleValueBlur(setting.key))}
                    fullWidth
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
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
              label="Value"
              value={createForm.value}
              onChange={(e) => setCreateForm({ ...createForm, value: e.target.value })}
              fullWidth
              placeholder="ค่าของการตั้งค่า"
            />
            <TextField
              label="คำอธิบาย"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              fullWidth
              placeholder="คำอธิบายการตั้งค่า"
              multiline
              rows={2}
            />
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
