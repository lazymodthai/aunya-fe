import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import Slide1 from '../../assets/slide/slide1.jpg'
import Slide2 from '../../assets/slide/slide2.jpg'
import Slide3 from '../../assets/slide/slide3.jpg'
import Slide4 from '../../assets/slide/slide4.jpg'
import Slide5 from '../../assets/slide/slide5.jpg'


//@ts-ignore
import 'swiper/css';

const items = [
  {id: 1, src: Slide1},
  {id: 2, src: Slide2},
  {id: 3, src: Slide3},
  {id: 4, src: Slide4},
  {id: 5, src: Slide5},
]

import './styles.css';
import { Box, useMediaQuery } from "@mui/material";
function SwiperPreview() {
  const isMobile = useMediaQuery("(max-width:800px)")
  
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
      {items.map((i) => (
        <SwiperSlide key={i.id} style={{ height: '50vh', backgroundColor: '#fff'}}>
          <Box component={"img"} src={i.src} onClick={()=>alert(1)} sx={{borderRadius: 2, bgcolor: '#fff'}}/>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default SwiperPreview