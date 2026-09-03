import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBackIosNew as PrevIcon,
  ArrowForwardIos as NextIcon,
  PhotoLibrary as PhotoLibraryIcon,
  GridView as GridViewIcon,
  ViewCarousel as CarouselViewIcon,
  Place as PlaceIcon,
  Pool as PoolIcon,
  KingBed as BedIcon,
  Mic as KaraokeIcon,
} from '@mui/icons-material';
import { useCallback, useEffect, useRef, useState } from 'react';
import GalleryAPI, { GalleryImage } from '@apis/gallery';
import { PROPERTY } from '@configs/app-settings';
import { useTranslation } from 'react-i18next';

// Swiper for mobile carousel
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/pagination';

function Room() {
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSwiper, setLightboxSwiper] = useState<SwiperType | null>(null);

  // Mobile slider active index
  const [activeSlide, setActiveSlide] = useState(0);

  // Thumbnail container ref for auto-scrolling active thumb into view
  const thumbnailRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    GalleryAPI.getAll()
      .then(({ data }) => {
        const sorted = [...data].sort((a, b) => a.sortOrder - b.sortOrder);
        setImages(sorted);
      })
      .catch((err) => console.error('Failed to load gallery:', err))
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    // If swiper already initialized, slide to index
    if (lightboxSwiper) {
      lightboxSwiper.slideTo(index, 0);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const handleThumbnailClick = (index: number) => {
    setLightboxIndex(index);
    lightboxSwiper?.slideTo(index);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') lightboxSwiper?.slideNext();
      if (e.key === 'ArrowLeft') lightboxSwiper?.slidePrev();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxSwiper]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (lightboxOpen && thumbnailRefs.current[lightboxIndex]) {
      thumbnailRefs.current[lightboxIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [lightboxIndex, lightboxOpen]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 0, sm: 2 } }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 3.5 }, px: 2 }}>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            fontSize: { xs: '1.4rem', sm: '1.85rem' },
            color: '#1e293b',
            letterSpacing: -0.5,
          }}
        >
          {i18n.language === 'en' ? PROPERTY.nameEn : PROPERTY.nameThFull}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, fontWeight: 500, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}
        >
          {i18n.language === 'en' ? PROPERTY.nameThFull : PROPERTY.nameEn}
        </Typography>

        {/* Feature Pills */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.8 }}
        >
          <Chip
            icon={<PlaceIcon sx={{ fontSize: '14px !important', color: '#b03052 !important' }} />}
            label="นครศรีธรรมราช"
            size="small"
            sx={{ bgcolor: '#fdf2f4', color: '#b03052', fontWeight: 600, fontSize: '0.75rem' }}
          />
          <Chip
            icon={<PoolIcon sx={{ fontSize: '14px !important', color: '#0284c7 !important' }} />}
            label="สระว่ายน้ำส่วนตัว & สไลเดอร์"
            size="small"
            sx={{ bgcolor: '#f0f9ff', color: '#0284c7', fontWeight: 600, fontSize: '0.75rem' }}
          />
          <Chip
            icon={<KaraokeIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
            label="คาราโอเกะ & ปิ้งย่าง"
            size="small"
            sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 600, fontSize: '0.75rem' }}
          />
        </Stack>
      </Box>

      {images.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <Typography color="text.secondary">{t('room.noImages', 'ยังไม่มีรูปภาพ')}</Typography>
        </Box>
      ) : (
        <>
          {/* ========================================================= */}
          {/* 1. DESKTOP / TABLET: AIRBNB LUXE 5-PHOTO BENTO GRID       */}
          {/* ========================================================= */}
          {!isMobile && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(2, 220px)',
                gap: 1.5,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                mb: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              {/* Main Large Hero Image (Left 2 columns, spans 2 rows) */}
              <Box
                onClick={() => openLightbox(0)}
                sx={{
                  gridColumn: 'span 2',
                  gridRow: 'span 2',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover img': { transform: 'scale(1.03)' },
                }}
              >
                <Box
                  component="img"
                  src={images[0].fileUrl}
                  alt={images[0].alt || 'Villa Main'}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                />
              </Box>

              {/* 4 Secondary Images (Right 2 columns, 2x2 grid) */}
              {images.slice(1, 5).map((img, idx) => {
                const actualIndex = idx + 1;
                const isLastInBento = idx === 3 || actualIndex === images.length - 1;

                return (
                  <Box
                    key={img.id}
                    onClick={() => openLightbox(actualIndex)}
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover img': { transform: 'scale(1.05)' },
                    }}
                  >
                    <Box
                      component="img"
                      src={img.fileUrl}
                      alt={img.alt || `Villa Photo ${actualIndex + 1}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                    />

                    {/* Button on 5th photo to open full gallery */}
                    {isLastInBento && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          right: 12,
                          bgcolor: 'rgba(255, 255, 255, 0.92)',
                          backdropFilter: 'blur(8px)',
                          px: 1.8,
                          py: 0.8,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.8,
                          boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: '#ffffff', transform: 'scale(1.02)' },
                        }}
                      >
                        <PhotoLibraryIcon sx={{ fontSize: 18, color: '#222' }} />
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#222', fontSize: '0.85rem' }}>
                          ดูรูปทั้งหมด ({images.length})
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}

          {/* ========================================================= */}
          {/* 2. MOBILE: LUXURY SWIPEABLE HERO CAROUSEL                 */}
          {/* ========================================================= */}
          {isMobile && (
            <Box sx={{ px: 1.5, mb: 3 }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3.5,
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  bgcolor: '#000',
                  height: 280,
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
                  onSlideChange={(swiper: SwiperType) => setActiveSlide(swiper.realIndex)}
                  style={{ width: '100%', height: '100%' }}
                >
                  {images.map((img, idx) => (
                    <SwiperSlide key={img.id} onClick={() => openLightbox(idx)}>
                      <Box
                        component="img"
                        src={img.fileUrl}
                        alt={img.alt || `Photo ${idx + 1}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Counter Badge Top-Right */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    color: '#ffffff',
                    px: 1.2,
                    py: 0.4,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <PhotoLibraryIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption" fontWeight={700}>
                    {activeSlide + 1} / {images.length}
                  </Typography>
                </Box>

                {/* Quick View All Button Bottom-Right */}
                <Box
                  onClick={() => openLightbox(activeSlide)}
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    bgcolor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    color: '#1e293b',
                    px: 1.2,
                    py: 0.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    zIndex: 10,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <Typography variant="caption" fontWeight={700}>
                    ดูรูปเต็มจอ
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* ========================================================= */}
          {/* 3. DYNAMIC MASONRY / PHOTO FEED                           */}
          {/* ========================================================= */}
          <Box sx={{ px: { xs: 1.5, sm: 0 }, mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.05rem', sm: '1.2rem' } }}>
                รูปภาพทั้งหมด ({images.length} รูป)
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PhotoLibraryIcon />}
                onClick={() => openLightbox(0)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                เปิดสไลด์โชว์
              </Button>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 1.5,
              }}
            >
              {images.map((img, index) => {
                // Feature span on larger screens for visual rhythm
                const isFeatured = !isMobile && (index % 7 === 0);

                return (
                  <Paper
                    key={img.id}
                    elevation={0}
                    onClick={() => openLightbox(index)}
                    sx={{
                      gridColumn: isFeatured ? 'span 2' : 'span 1',
                      height: isFeatured ? { sm: 300, md: 340 } : { xs: 160, sm: 200, md: 220 },
                      borderRadius: 2.5,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                        '& img': { transform: 'scale(1.06)' },
                        '& .caption-overlay': { opacity: 1 },
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={img.fileUrl}
                      alt={img.alt || `Villa Gallery ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />

                    {/* Gradient Caption Overlay */}
                    <Box
                      className="caption-overlay"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%)',
                        opacity: img.alt ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        p: 1.2,
                      }}
                    >
                      {img.alt && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#ffffff',
                            fontWeight: 600,
                            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {img.alt}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        </>
      )}

      {/* ========================================================= */}
      {/* 4. FULLSCREEN MODERN LUXURY LIGHTBOX MODAL (WITH SWIPER)  */}
      {/* ========================================================= */}
      <Dialog
        open={lightboxOpen}
        onClose={closeLightbox}
        fullScreen
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'rgba(10, 15, 29, 0.96)',
              backdropFilter: 'blur(16px)',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            },
          },
        }}
      >
        {images.length > 0 && (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              userSelect: 'none',
            }}
          >
            {/* Top Lightbox Bar */}
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 20,
              }}
            >
              <Chip
                label={`${lightboxIndex + 1} / ${images.length}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              />

              {images[lightboxIndex]?.alt && (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#e2e8f0',
                    fontWeight: 500,
                    maxWidth: { xs: '55%', sm: '70%' },
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {images[lightboxIndex].alt}
                </Typography>
              )}

              <IconButton
                onClick={closeLightbox}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Main Stage Image & Navigation with Swiper (100% Native Gesture Swipe) */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {/* Previous Arrow Button */}
              <IconButton
                onClick={() => lightboxSwiper?.slidePrev()}
                sx={{
                  position: 'absolute',
                  left: { xs: 8, sm: 24 },
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  p: { xs: 1, sm: 1.5 },
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                  zIndex: 20,
                }}
              >
                <PrevIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>

              {/* Swiper Gesture Stage */}
              <Swiper
                initialSlide={lightboxIndex}
                onSwiper={(swiper: SwiperType) => {
                  setLightboxSwiper(swiper);
                  swiper.slideTo(lightboxIndex, 0);
                }}
                onSlideChange={(swiper: SwiperType) => {
                  setLightboxIndex(swiper.activeIndex);
                }}
                spaceBetween={20}
                style={{ width: '100%', height: '100%' }}
              >
                {images.map((img, idx) => (
                  <SwiperSlide
                    key={`lb-${img.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Box
                      component="img"
                      src={img.fileUrl}
                      alt={img.alt || `Fullscreen Photo ${idx + 1}`}
                      sx={{
                        maxWidth: { xs: '94vw', sm: '88vw' },
                        maxHeight: { xs: '65vh', sm: '74vh' },
                        objectFit: 'contain',
                        borderRadius: 2,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                        userSelect: 'none',
                        pointerEvents: 'none',
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Next Arrow Button */}
              <IconButton
                onClick={() => lightboxSwiper?.slideNext()}
                sx={{
                  position: 'absolute',
                  right: { xs: 8, sm: 24 },
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  p: { xs: 1, sm: 1.5 },
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                  zIndex: 20,
                }}
              >
                <NextIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Box>

            {/* Bottom Filmstrip Thumbnails */}
            <Box
              sx={{
                p: { xs: 1, sm: 1.5 },
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                overflowX: 'auto',
                display: 'flex',
                gap: 1,
                justifyContent: { xs: 'flex-start', sm: 'center' },
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
              }}
            >
              {images.map((img, idx) => (
                <Box
                  key={`thumb-${img.id}`}
                  ref={(el: HTMLDivElement | null) => {
                    thumbnailRefs.current[idx] = el;
                  }}
                  onClick={() => handleThumbnailClick(idx)}
                  component="img"
                  src={img.fileUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  sx={{
                    width: { xs: 48, sm: 60 },
                    height: { xs: 48, sm: 60 },
                    objectFit: 'cover',
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    opacity: lightboxIndex === idx ? 1 : 0.4,
                    border: lightboxIndex === idx ? '2.5px solid #ffffff' : '1px solid transparent',
                    transform: lightboxIndex === idx ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}

export default Room;

