import { Box, Typography } from '@mui/material';
import MultiImageUpload from '@components/MultiImageUpload';
import { useTranslation } from 'react-i18next';

interface SlipUploadStepProps {
  onSlipChange: (files: File[]) => void;
}

function SlipUploadStep({ onSlipChange }: SlipUploadStepProps) {
  const { t } = useTranslation();

  return (
    <>
      <Typography sx={{ fontSize: 18, fontWeight: 600 }}>{t("slipUpload.uploadTitle", "แนบสลิปชำระเงิน")}</Typography>
      <Box sx={{ height: 400 }}>
        <MultiImageUpload
          maxImages={1}
          minHeight="370px"
          onImagesChange={(files) => {
            onSlipChange(files);
          }}
        />
      </Box>
    </>
  );
}

export default SlipUploadStep;
