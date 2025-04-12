import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

//@ts-ignore
import 'swiper/css';

const items = [
  {id: 1, src: 'https://scontent.fbkk22-3.fna.fbcdn.net/v/t39.30808-6/487114479_1052977056860306_243089905790870981_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHpw3hBj3Pyg1PjpIk2fvabdiWlmRBPNgd2JaWZEE82B7F9fvGapUoQ-6gWmxAmskmrXQPxrMDob1yh5jZYlzuu&_nc_ohc=oWwRh_u-wsEQ7kNvwG89M7Y&_nc_oc=Adk7oTPcyGkizGmi7NxpAGwFjHG8N3q2HKdJ63N3fSgoi04Hz7ZvDy1spktNZ_aBWaw&_nc_zt=23&_nc_ht=scontent.fbkk22-3.fna&_nc_gid=Ry7lgJbcF-ZW0ShIlKZeSQ&oh=00_AfFr-6oicfD6v8H8s4WSVdE-azcIhbpR5bkgIHWZ03HSZA&oe=67F89109'},
  {id: 2, src: 'https://scontent.fbkk22-7.fna.fbcdn.net/v/t39.30808-6/487826273_1052977283526950_8348880076888692185_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHD6wcW6QGwaoGKGmJ65WdAEpHkwau7nBYSkeTBq7ucFloYXzQguIMm7JLWXgBp_8O49hUb9OhZd2Ff-ey3vRlF&_nc_ohc=QOBo043jXF4Q7kNvwEEs6sP&_nc_oc=Adk2KJQLNPiwGpsI_q6nJrjAJJVCu8XIFJGm9rGjEq9vUk8Mr7h12KEn7743p4tM5q8&_nc_zt=23&_nc_ht=scontent.fbkk22-7.fna&_nc_gid=IwQLlqKnmLzldZ6fopel8w&oh=00_AfHfpW15SQ3Lt86GecBJgJ5fa9JBy7xtJ-wTE22HsGDQdQ&oe=67F87D1D'},
  {id: 3, src: 'https://scontent.fbkk22-2.fna.fbcdn.net/v/t39.30808-6/486978624_1052977210193624_1830628792450836196_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHv9YzGqLc8ycuNNou9wHn-6GZIXNv6CKboZkhc2_oIpn7E5DgW7A3r6aTN4xYJW_Ma7YQVggYCwl2B7GYYWPRK&_nc_ohc=VPHV5weodGIQ7kNvwGOrqLb&_nc_oc=Adl28PMOKEmmX1xbQ4cHvonSI6jRg6SVSw9sTQtUk_z4vEdCq4yj_-lpuPpipCXwQLM&_nc_zt=23&_nc_ht=scontent.fbkk22-2.fna&_nc_gid=ovmiA7rt1y-yp9ozFgjiVQ&oh=00_AfF1Yux6sAt3MYZvcZMVArE_TqVn0wHacqYTeiYqPC9Mkg&oe=67F87758'},
  {id: 4, src: 'https://scontent.fbkk22-6.fna.fbcdn.net/v/t39.30808-6/487509209_1052977043526974_1286847850473393440_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHlqJCW5kC4najaqUiYnXHFtR_AlG3gqOC1H8CUbeCo4AZn9CoAkSdkW1n8hEIC6Q-_OZ-eT7HRegtESNvg0bxO&_nc_ohc=S3ZvW-K-1gYQ7kNvwGz3qJ1&_nc_oc=Adk3wCwo9HGhD_lgPbjQ52LyMI05dfhr2X0wbqR4aocBgn39avZH94aSBqJQgBz76AQ&_nc_zt=23&_nc_ht=scontent.fbkk22-6.fna&_nc_gid=nltIX0tGNz-F5vvEQ9deww&oh=00_AfH-ykhJw6Tt3L2bSWMN1zPmGRcYBdcGRLoodPcv-qMlCg&oe=67F870DF'},
]

import './styles.css';
import { Box } from "@mui/material";
function SwiperPreview() {
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
        <SwiperSlide key={i.id} style={{ height: 600 }}>
          <Box component={"img"} src={i.src} onClick={()=>alert(1)} sx={{borderRadius: 2}}/>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default SwiperPreview