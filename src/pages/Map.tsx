import { Box, useMediaQuery } from "@mui/material";

function Map() {
  const isMobile = useMediaQuery("(max-width:800px)");

  return (
    <Box sx={{width: isMobile ? '95vw' : '100vw', display: 'flex', justifyContent: 'center'}}>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.7953414102712!2d99.86375253928468!3d8.421749891652277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3053ab2b3652a0f9%3A0x7fc9d09c826b3bd7!2z4Lit4Lix4LiZ4Lir4Lii4Liy4Lie4Li54Lil4Lin4Li04Lil4Lil4LmI4LiyIEF1bnlhIFBvb2wgVmlsbGE!5e0!3m2!1sth!2sth!4v1753346964289!5m2!1sth!2sth"
        width={isMobile ? "100%" : 600}
        height="450"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </Box>
  );
}

export default Map;