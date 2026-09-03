import { Box, Stack, Typography } from '@mui/material';
import MultiImageUpload from '@components/MultiImageUpload';
import { useTranslation } from 'react-i18next';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

interface SlipUploadStepProps {
  onSlipChange: (files: File[]) => void;
}

function SlipUploadStep({ onSlipChange }: SlipUploadStepProps) {
  const { t, i18n } = useTranslation();

  return (
    <Stack spacing={2.5}>
      <Box sx={{ textAlign: 'center', mb: 0.5 }}>
        <Typography variant="subtitle1" fontWeight={700} color="#1e293b" sx={{ mb: 0.5 }}>
          {t("slipUpload.uploadTitle", "แนบสลิปชำระเงิน")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {i18n.language === 'en'
            ? 'Please upload your transfer slip to complete and confirm your booking'
            : 'กรุณาแนบภาพสลิปการโอนเงินเพื่อยืนยันการจองห้องพัก'}
        </Typography>
      </Box>

      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          p: 1.5,
          bgcolor: '#f8fafc',
        }}
      >
        <MultiImageUpload
          maxImages={1}
          minHeight="320px"
          onImagesChange={(files) => {
            onSlipChange(files);
          }}
        />
      </Box>
    </Stack>
  );
}

export default SlipUploadStep;
