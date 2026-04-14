import { useRef, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import PropertyInfoAPI from '@apis/property-info';
import type { PropertyInfoItem } from '@apis/property-info';
import { cacheDelete } from '@utils/cache';

interface Props {
  title: string;
  category: 'general' | 'facilities' | 'policies';
  items: PropertyInfoItem[];
  isAdmin: boolean;
  onItemsChange: (updated: PropertyInfoItem[]) => void;
}

function EditablePropertySection({ title, category, items, isAdmin, onItemsChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [addingLoading, setAddingLoading] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleStartEdit = (item: PropertyInfoItem) => {
    setEditingId(item.id);
    setEditingLabel(item.label);
  };

  const handleSaveLabel = async (id: string) => {
    if (!editingLabel.trim()) return;
    setLoadingId(id);
    try {
      await PropertyInfoAPI.updateLabel(id, editingLabel.trim());
      cacheDelete('property-info-all');
      onItemsChange(items.map((i) => (i.id === id ? { ...i, label: editingLabel.trim() } : i)));
      setEditingId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancelLabel = () => {
    setEditingId(null);
    setEditingLabel('');
  };

  const handleIconClick = (id: string) => {
    fileInputRefs.current[id]?.click();
  };

  const handleIconChange = async (id: string, file: File | undefined) => {
    if (!file) return;
    setLoadingId(id);
    try {
      const { data } = await PropertyInfoAPI.uploadIcon(id, file);
      cacheDelete('property-info-all');
      onItemsChange(
        items.map((i) => (i.id === id ? { ...i, iconUrl: data.data.iconUrl } : i)),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    try {
      await PropertyInfoAPI.remove(id);
      cacheDelete('property-info-all');
      onItemsChange(items.filter((i) => i.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setAddingLoading(true);
    try {
      const { data } = await PropertyInfoAPI.create({
        category,
        label: newLabel.trim(),
        sortOrder: items.length,
      });
      cacheDelete('property-info-all');
      onItemsChange([...items, data.data]);
      setNewLabel('');
    } catch (e) {
      console.error(e);
    } finally {
      setAddingLoading(false);
    }
  };

  return (
    <Box>
      {/* Section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">{title}</Typography>
        {isAdmin && (
          <Tooltip title={isEditing ? 'เสร็จสิ้น' : 'แก้ไข'}>
            <IconButton
              size="small"
              onClick={() => {
                setIsEditing((p) => !p);
                setEditingId(null);
                setNewLabel('');
              }}
              sx={{
                bgcolor: isEditing ? 'primary.main' : 'transparent',
                color: isEditing ? '#fff' : 'primary.main',
                border: '1px solid',
                borderColor: 'primary.main',
                '&:hover': { bgcolor: isEditing ? 'primary.dark' : 'primary.50' },
              }}
            >
              {isEditing ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Items list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 1 }}>
        {items.map((item) => {
          const isThisLoading = loadingId === item.id;
          const isThisEditing = editingId === item.id;

          return (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: isEditing ? 0.5 : 0,
                borderRadius: 1,
              }}
            >
              {/* Icon area */}
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isEditing ? 'pointer' : 'default',
                  borderRadius: 1,
                  border: isEditing ? '1px dashed #aaa' : 'none',
                  '&:hover': isEditing ? { borderColor: 'primary.main', bgcolor: 'primary.50' } : {},
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => isEditing && handleIconClick(item.id)}
              >
                {isThisLoading ? (
                  <CircularProgress size={16} />
                ) : item.iconUrl ? (
                  <Box
                    component="img"
                    src={item.iconUrl}
                    sx={{ width: 24, height: 24, objectFit: 'contain' }}
                  />
                ) : (
                  <Box sx={{ color: isEditing ? '#aaa' : '#2D336B', display: 'flex' }}>
                    {isEditing ? (
                      <ImageIcon sx={{ fontSize: 18, color: '#bbb' }} />
                    ) : (
                      <Box sx={{ width: 24, height: 24, bgcolor: '#A9B5DF', borderRadius: '50%' }} />
                    )}
                  </Box>
                )}
                {/* Hidden file input */}
                {isEditing && (
                  <input
                    type="file"
                    accept=".png,.svg,.webp,image/png,image/svg+xml,image/webp"
                    style={{ display: 'none' }}
                    ref={(el) => { fileInputRefs.current[item.id] = el; }}
                    onChange={(e) => handleIconChange(item.id, e.target.files?.[0])}
                  />
                )}
              </Box>

              {/* Label */}
              {isThisEditing ? (
                <TextField
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  size="small"
                  variant="outlined"
                  autoFocus
                  sx={{ flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveLabel(item.id);
                    if (e.key === 'Escape') handleCancelLabel();
                  }}
                />
              ) : (
                <Typography
                  variant="body1"
                  fontSize={14}
                  color="#2D336B"
                  sx={{ flex: 1, lineHeight: 1.4 }}
                >
                  {item.label}
                </Typography>
              )}

              {/* Edit mode controls */}
              {isEditing && (
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  {isThisEditing ? (
                    <>
                      <Tooltip title="บันทึก">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSaveLabel(item.id)}
                          disabled={isThisLoading}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ยกเลิก">
                        <IconButton size="small" onClick={handleCancelLabel}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="แก้ไขข้อความ">
                        <IconButton
                          size="small"
                          onClick={() => handleStartEdit(item)}
                          disabled={isThisLoading}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบ">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(item.id)}
                          disabled={isThisLoading}
                        >
                          {isThisLoading ? <CircularProgress size={14} /> : <DeleteIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Add new item row */}
      {isEditing && (
        <Box sx={{ display: 'flex', gap: 1, mt: 2, pl: 1, alignItems: 'center' }}>
          <TextField
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            size="small"
            placeholder="เพิ่มรายการใหม่..."
            sx={{ flex: 1 }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            disabled={addingLoading}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={addingLoading ? <CircularProgress size={14} /> : <AddIcon />}
            onClick={handleAdd}
            disabled={!newLabel.trim() || addingLoading}
            sx={{ whiteSpace: 'nowrap' }}
          >
            เพิ่ม
          </Button>
        </Box>
      )}

      {/* Edit mode hint */}
      {isEditing && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, pl: 1, display: 'block' }}>
          คลิกที่ icon เพื่ออัปโหลดรูป (png, svg, webp)
        </Typography>
      )}
    </Box>
  );
}

export default EditablePropertySection;
