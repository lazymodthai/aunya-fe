import { Box, CircularProgress, Dialog, IconButton, Typography, useMediaQuery } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import GalleryAPI, { GalleryImage } from '@apis/gallery';
import { PROPERTY } from '@configs/app-settings';

function Room() {
  const isMobile = useMediaQuery('(max-width:800px)');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    GalleryAPI.getAll()
      .then(({ data }) => {
        const sorted = [...data].sort((a, b) => a.sortOrder - b.sortOrder);
        setImages(sorted);
      })
      .catch((err) => console.error('Failed to load gallery:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: isMobile ? '95vw' : '100vw', maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#2D336B' }}>
          {PROPERTY.nameThFull}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {PROPERTY.nameEn}
        </Typography>
      </Box>

      {images.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <Typography color="text.secondary">ยังไม่มีรูปภาพ</Typography>
        </Box>
      ) : (
        <>
          {/* Hero — first image large */}
          <Box
            onClick={() => setSelectedImage(images[0])}
            sx={{
              width: '100%',
              height: isMobile ? 250 : 450,
              borderRadius: 3,
              overflow: 'hidden',
              cursor: 'pointer',
              mb: 2,
              '&:hover img': { transform: 'scale(1.03)' },
            }}
          >
            <Box
              component="img"
              src={images[0].fileUrl}
              alt={images[0].alt}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
              }}
            />
          </Box>

          {/* Masonry-style grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: 1.5,
            }}
          >
            {images.slice(1).map((img, index) => {
              // Every 4th image in the grid spans 2 columns for visual variety
              const isWide = !isMobile && (index % 4 === 0);
              return (
                <Box
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  sx={{
                    gridColumn: isWide ? 'span 2' : 'span 1',
                    height: isWide ? 320 : isMobile ? 180 : 240,
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover img': { transform: 'scale(1.05)' },
                    '&:hover .overlay': { opacity: 1 },
                  }}
                >
                  <Box
                    component="img"
                    src={img.fileUrl}
                    alt={img.alt}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                  {img.alt && (
                    <Box
                      className="overlay"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        py: 1,
                        px: 1.5,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                        {img.alt}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </>
      )}

      {/* Lightbox Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              maxWidth: '90vw',
              maxHeight: '90vh',
            },
          },
        }}
      >
        {selectedImage && (
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => setSelectedImage(null)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                zIndex: 1,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              component="img"
              src={selectedImage.fileUrl}
              alt={selectedImage.alt}
              sx={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: 2,
                display: 'block',
              }}
            />
            {selectedImage.alt && (
              <Typography
                sx={{
                  textAlign: 'center',
                  color: '#fff',
                  mt: 1,
                  fontWeight: 500,
                  textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                }}
              >
                {selectedImage.alt}
              </Typography>
            )}
          </Box>
        )}
      </Dialog>
    </Box>
  );
}

export default Room;
