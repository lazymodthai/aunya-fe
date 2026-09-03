import { Box, Divider, Stack, Typography } from '@mui/material';
import { formatAccountNumber } from '@utils/input';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QRPayment from '@components/booking/QRPayment';
import { useClipboard } from 'use-clipboard-copy';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PaymentStepProps {
  totalRoomPrice: number;
  additionGuestNumber: number | null;
  additionTowel: number | null;
  additionGuestNumberPrice: number;
  additionTowelPrice: number;
  depositPrice: number;
  discountAmount: number;
  totalPrice: number;
  QRcode: string;
  QRname: string;
  bankName: string;
  bankAccount: string;
  isOnlyDeposit: boolean;
  paidAmount: number;
  remainingAmount: number;
}

function PaymentStep({
  totalRoomPrice,
  additionGuestNumber,
  additionTowel,
  additionGuestNumberPrice,
  additionTowelPrice,
  depositPrice,
  discountAmount,
  totalPrice,
  QRcode,
  QRname,
  bankName,
  bankAccount,
  isOnlyDeposit,
  paidAmount,
  remainingAmount,
}: PaymentStepProps) {
  const { t, i18n } = useTranslation();
  const [copying, setCopying] = useState(false);
  const clipboard = useClipboard();

  const handleCopy = async () => {
    clipboard.copy(bankAccount);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  return (
    <Stack spacing={2.5}>
      {/* 1. Amount Due Card */}
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" fontWeight={600} color="#166534" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          {isOnlyDeposit ? t("payment.paymentDueDeposit", "ยอดชำระครั้งนี้ (มัดจำ)") : t("payment.paymentDueTotal", "รวมยอดชำระทั้งสิ้น")}
        </Typography>

        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            color: '#15803d',
            my: 0.5,
            fontSize: { xs: '1.8rem', sm: '2.2rem' },
          }}
        >
          {paidAmount.toLocaleString(i18n.language === 'en' ? 'en-US' : 'th-TH', {
            style: 'currency',
            currency: 'THB',
          })}
        </Typography>

        {isOnlyDeposit && remainingAmount > 0 && (
          <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600, display: 'block', mt: 0.5 }}>
            {t("payment.remainingAmountDisplay", { price: remainingAmount.toLocaleString() })}
          </Typography>
        )}
      </Box>

      {/* 2. Bank Transfer Card */}
      <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>🏦</span> {t("payment.bank", "โอนเงินผ่านบัญชีธนาคาร")}
        </Typography>

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">{t("payment.bank", "ธนาคาร")}</Typography>
            <Typography variant="body2" fontWeight={600} color="#00A3E3">
              {bankName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">{t("payment.accountName", "ชื่อบัญชี")}</Typography>
            <Typography variant="body2" fontWeight={600} color="#1e293b">
              {QRname}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              bgcolor: '#fff',
              borderRadius: 2.5,
              border: '1px solid #e2e8f0',
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("payment.accountNumber", "หมายเลขบัญชี")}
              </Typography>
              <Typography variant="body1" fontWeight={700} color="#00A3E3" letterSpacing={0.5}>
                {formatAccountNumber(bankAccount)}
              </Typography>
            </Box>

            <Box
              onClick={handleCopy}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.5,
                py: 0.8,
                borderRadius: 2,
                bgcolor: copying ? '#f0fdf4' : '#f1f5f9',
                border: `1px solid ${copying ? '#86efac' : '#cbd5e1'}`,
                color: copying ? '#16a34a' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#e2e8f0' },
              }}
            >
              {copying ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
              {copying ? t("payment.copied", "คัดลอกแล้ว") : t("payment.copy", "คัดลอก")}
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* 3. PromptPay QR Code Card */}
      <Box sx={{ p: 2.5, bgcolor: '#fff', borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 0.5 }}>
          {t("payment.qrPayment", "หรือสแกนจ่ายผ่าน QR PromptPay")}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {i18n.language === 'en' ? 'Scan with any mobile banking app' : 'เปิดแอปธนาคารใดก็ได้เพื่อสแกน QR Code'}
        </Typography>

        <Box
          sx={{
            display: 'inline-flex',
            p: 2,
            bgcolor: '#fff',
            borderRadius: 3,
            border: '2px dashed #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            mb: 1.5,
          }}
        >
          <QRPayment qrId={QRcode} value={paidAmount} size={210} />
        </Box>

        <Typography variant="caption" color="text.secondary" display="block">
          {QRcode.replace(/(\d{3})(\d{3})(\d{4})/, '$1-xxx-$3')} • {QRname}
        </Typography>
      </Box>
    </Stack>
  );
}

export default PaymentStep;
