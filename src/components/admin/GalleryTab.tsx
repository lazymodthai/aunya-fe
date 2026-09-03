import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
  InsertPhoto as ImageIcon,
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
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);

  // Upload form
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadSortOrder, setUploadSortOrder] = useState('1');
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

      // Auto calculate next sort order
      const nextOrder = sorted.length > 0 ? Math.max(...sorted.map((i) => i.sortOrder)) + 1 : 1;
      setUploadSortOrder(String(nextOrder));

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
      if (!uploadAlt) {
        // Default alt to file name without extension
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setUploadAlt(nameWithoutExt);
      }
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadAlt('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showNoti('error', 'กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('alt', uploadAlt);
      formData.append('sortOrder', uploadSortOrder);
      await GalleryAPI.upload(formData);
      showNoti('success', 'อัปโหลดรูปภาพสำเร็จ');
      clearSelectedFile();
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
      showNoti('success', 'อัปเดตคำอธิบายรูปภาพสำเร็จ');
      fetchImages();
    } catch (error) {
      console.error('Error updating alt:', error);
      showNoti('error', 'ไม่สามารถอัปเดตคำอธิบายรูปภาพได้');
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
          รูปภาพแกลเลอรี ({images.length})
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={fetchImages}
          disabled={isLoading}
        >
          รีเฟรช
        </Button>
      </Stack>

      {/* Compact Upload Bar */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', boxShadow: 'none', mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <UploadIcon fontSize="small" color="primary" /> อัปโหลดรูปภาพใหม่
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
            {/* File Selector / Preview */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
              {filePreviewUrl ? (
                <Box sx={{ position: 'relative', width: 44, height: 44, borderRadius: 1.5, overflow: 'hidden', border: '1px solid #ccc', flexShrink: 0 }}>
                  <img src={filePreviewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <IconButton
                    size="small"
                    onClick={clearSelectedFile}
                    sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', p: 0.2, '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                  >
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              ) : null}

              <Button
                variant={selectedFile ? 'outlined' : 'contained'}
                size="small"
                startIcon={<ImageIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ whiteSpace: 'nowrap', textTransform: 'none' }}
              >
                {selectedFile ? 'เปลี่ยนรูป' : 'เลือกรูปภาพ'}
              </Button>

              {selectedFile && (
                <Typography variant="caption" noWrap sx={{ maxWidth: 140, color: 'text.secondary' }}>
                  {selectedFile.name}
                </Typography>
              )}
            </Box>

            {/* Alt Text */}
            <TextField
              label="Alt text (คำอธิบาย)"
              size="small"
              value={uploadAlt}
              onChange={(e) => setUploadAlt(e.target.value)}
              placeholder="เช่น บรรยากาศสระว่ายน้ำ"
              sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}
            />

            {/* Sort Order */}
            <TextField
              label="ลำดับ"
              size="small"
              type="number"
              value={uploadSortOrder}
              onChange={(e) => setUploadSortOrder(e.target.value)}
              sx={{ width: { xs: '100%', sm: 90 } }}
            />

            {/* Upload Button */}
            <Button
              variant="contained"
              size="small"
              startIcon={<UploadIcon />}
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              sx={{ px: 3, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}
            >
              {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Image Grid with Compact Thumbnails */}
      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={32} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">กำลังโหลดรูปภาพ...</Typography>
        </Box>
      ) : images.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, bgcolor: '#fafafa', borderRadius: 3, border: '1px dashed #ccc' }}>
          <ImageIcon sx={{ fontSize: 48, color: '#aaa', mb: 1 }} />
          <Typography color="text.secondary">ยังไม่มีรูปภาพในแกลเลอรี</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 2,
          }}
        >
          {images.map((img) => (
            <Card
              key={img.id}
              sx={{
                borderRadius: 2.5,
                border: '1px solid #e0e0e0',
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#b03052',
                  boxShadow: '0 4px 12px rgba(176, 48, 82, 0.12)',
                },
              }}
            >
              {/* Clickable Thumbnail with Preview Tooltip & Zoom Overlay */}
              <Tooltip title="คลิกเพื่อดูรูปภาพขนาดใหญ่" arrow placement="top">
                <CardActionArea
                  onClick={() => setPreviewImage(img)}
                  sx={{ position: 'relative', height: 130, bgcolor: '#f0f0f0' }}
                >
                  <CardMedia
                    component="img"
                    image={img.fileUrl}
                    alt={img.alt}
                    sx={{ height: 130, width: '100%', objectFit: 'cover' }}
                  />

                  {/* Top Badge: Sort Order */}
                  <Chip
                    label={`#${img.sortOrder}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      bgcolor: 'rgba(0, 0, 0, 0.65)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      height: 22,
                    }}
                  />

                  {/* Zoom Icon on Hover */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <ZoomInIcon sx={{ color: '#fff', fontSize: 32 }} />
                  </Box>
                </CardActionArea>
              </Tooltip>

              {/* Compact Edit Controls */}
              <CardContent sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 1, '&:last-child': { pb: 1.5 } }}>
                <TextField
                  label="Alt text"
                  size="small"
                  value={editAlts[img.id] ?? ''}
                  onChange={(e) => setEditAlts({ ...editAlts, [img.id]: e.target.value })}
                  onBlur={() => handleAltBlur(img.id)}
                  onKeyDown={(e) => handleKeyDown(e, () => handleAltBlur(img.id))}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.6 },
                    '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                  }}
                />

                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <TextField
                    label="ลำดับ"
                    size="small"
                    type="number"
                    value={editSorts[img.id] ?? ''}
                    onChange={(e) => setEditSorts({ ...editSorts, [img.id]: e.target.value })}
                    onBlur={() => handleSortBlur(img.id)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleSortBlur(img.id))}
                    sx={{
                      width: 65,
                      '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.6 },
                      '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                    }}
                  />

                  <Tooltip title="ลบรูปภาพ">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, image: img })}
                      sx={{ p: 0.5 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Full-Size Image Preview Modal (Lightbox) */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {previewImage?.alt || 'รูปภาพแกลเลอรี'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ลำดับที่ #{previewImage?.sortOrder}
            </Typography>
          </Box>
          <IconButton onClick={() => setPreviewImage(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          {previewImage && (
            <img
              src={previewImage.fileUrl}
              alt={previewImage.alt}
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '60%' }}>
            {previewImage?.fileUrl}
          </Typography>
          <Button variant="outlined" size="small" onClick={() => setPreviewImage(null)}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, image: null })}>
        <DialogTitle>ยืนยันการลบรูปภาพ</DialogTitle>
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
