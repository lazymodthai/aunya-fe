import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import GalleryAPI, { GalleryImage } from '@apis/gallery';
import { useEffect, useRef, useState } from 'react';

interface GalleryTabProps {
  showNoti: (type: 'success' | 'error', message: string) => void;
}

function GalleryTab({ showNoti }: GalleryTabProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; image: GalleryImage | null }>({ open: false, image: null });

  // Upload form
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadSortOrder, setUploadSortOrder] = useState('0');
  const [uploading, setUploading] = useState(false);

  // Editable fields per image
  const [editAlts, setEditAlts] = useState<Record<string, string>>({});
  const [editSorts, setEditSorts] = useState<Record<string, string>>({});

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const { data } = await GalleryAPI.getAll();
      const sorted = [...data].sort((a, b) => a.sortOrder - b.sortOrder);
      setImages(sorted);
      const alts: Record<string, string> = {};
      const sorts: Record<string, string> = {};
      sorted.forEach((img) => {
        alts[img.id] = img.alt;
        sorts[img.id] = String(img.sortOrder);
      });
      setEditAlts(alts);
      setEditSorts(sorts);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      showNoti('error', 'ไม่สามารถโหลดรูปภาพได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      showNoti('error', 'กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', uploadAlt);
      formData.append('sortOrder', uploadSortOrder);
      await GalleryAPI.upload(formData);
      showNoti('success', 'อัปโหลดรูปภาพสำเร็จ');
      setUploadAlt('');
      setUploadSortOrder('0');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchImages();
    } catch (error) {
      console.error('Error uploading:', error);
      showNoti('error', 'ไม่สามารถอัปโหลดรูปภาพได้');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.image) return;
    try {
      await GalleryAPI.delete(deleteDialog.image.id);
      showNoti('success', 'ลบรูปภาพสำเร็จ');
      fetchImages();
    } catch (error) {
      console.error('Error deleting:', error);
      showNoti('error', 'ไม่สามารถลบรูปภาพได้');
    } finally {
      setDeleteDialog({ open: false, image: null });
    }
  };

  const handleAltBlur = async (id: string) => {
    const original = images.find((img) => img.id === id);
    if (!original || editAlts[id] === original.alt) return;
    try {
      await GalleryAPI.updateAlt(id, editAlts[id]);
      showNoti('success', 'อัปเดต alt สำเร็จ');
      fetchImages();
    } catch (error) {
      console.error('Error updating alt:', error);
      showNoti('error', 'ไม่สามารถอัปเดต alt ได้');
    }
  };

  const handleSortBlur = async (id: string) => {
    const original = images.find((img) => img.id === id);
    if (!original || String(original.sortOrder) === editSorts[id]) return;
    try {
      await GalleryAPI.updateSortOrder(id, Number(editSorts[id]));
      showNoti('success', 'อัปเดตลำดับสำเร็จ');
      fetchImages();
    } catch (error) {
      console.error('Error updating sort order:', error);
      showNoti('error', 'ไม่สามารถอัปเดตลำดับได้');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') {
      (e.target as HTMLElement).blur();
      handler();
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          รูปภาพ ({images.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchImages}
          disabled={isLoading}
        >
          รีเฟรช
        </Button>
      </Stack>

      {/* Upload Section */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            อัปโหลดรูปภาพใหม่
          </Typography>
          <Stack spacing={2}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
            />
            <TextField
              label="Alt text"
              size="small"
              value={uploadAlt}
              onChange={(e) => setUploadAlt(e.target.value)}
              placeholder="คำอธิบายรูปภาพ"
            />
            <TextField
              label="ลำดับ (sortOrder)"
              size="small"
              type="number"
              value={uploadSortOrder}
              onChange={(e) => setUploadSortOrder(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Image Grid */}
      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">กำลังโหลด...</Typography>
        </Box>
      ) : images.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">ยังไม่มีรูปภาพ</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {images.map((img) => (
            <Card key={img.id} sx={{ borderRadius: 3 }}>
              <CardMedia
                component="img"
                image={img.fileUrl}
                alt={img.alt}
                sx={{ height: 180, objectFit: 'cover' }}
              />
              <CardContent>
                <Stack spacing={1.5}>
                  <TextField
                    label="Alt text"
                    size="small"
                    value={editAlts[img.id] ?? ''}
                    onChange={(e) => setEditAlts({ ...editAlts, [img.id]: e.target.value })}
                    onBlur={() => handleAltBlur(img.id)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleAltBlur(img.id))}
                    fullWidth
                  />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="ลำดับ"
                      size="small"
                      type="number"
                      value={editSorts[img.id] ?? ''}
                      onChange={(e) => setEditSorts({ ...editSorts, [img.id]: e.target.value })}
                      onBlur={() => handleSortBlur(img.id)}
                      onKeyDown={(e) => handleKeyDown(e, () => handleSortBlur(img.id))}
                      sx={{ width: 100 }}
                    />
                    <Box sx={{ flex: 1 }} />
                    <IconButton
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, image: img })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, image: null })}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>คุณต้องการลบรูปภาพนี้ใช่หรือไม่?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, image: null })}>ยกเลิก</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GalleryTab;
