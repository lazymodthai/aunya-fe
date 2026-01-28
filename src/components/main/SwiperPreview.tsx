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
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Autoplay]}
    >
      {images.map((img) => (
        <SwiperSlide key={img.id} style={{ height: '50vh', backgroundColor: '#fff'}}>
          <Box component={"img"} src={img.fileUrl} alt={img.alt} sx={{borderRadius: 2, bgcolor: '#fff'}}/>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default SwiperPreview
