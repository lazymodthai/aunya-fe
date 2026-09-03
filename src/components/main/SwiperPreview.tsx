import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

//@ts-ignore
import 'swiper/css';

import './styles.css';
import { Box, CircularProgress, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import GalleryAPI, { GalleryImage } from "@apis/gallery";

function SwiperPreview() {
  const isMobile = useMediaQuery("(max-width:800px)")
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GalleryAPI.getAll()
      .then(({ data }) => {
        const sorted = [...data].sort((a, b) => a.sortOrder - b.sortOrder);
        setImages(sorted);
      })
      .catch((err) => {
        console.error("Failed to load gallery:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (images.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography color="text.secondary">ไม่มีรูปภาพ</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: 260, sm: 380, md: 460 },
        borderRadius: { xs: 3, sm: 4 },
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        position: 'relative',
        bgcolor: '#0f172a',
      }}
    >
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        modules={[Autoplay, Pagination]}
        style={{ width: '100%', height: '100%' }}
      >
        {images.map((img) => (
          <SwiperSlide key={img.id} style={{ width: '100%', height: '100%' }}>
            <Box
              component="img"
              src={img.fileUrl}
              alt={img.alt || 'Aunya Pool Villa'}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}

export default SwiperPreview;
