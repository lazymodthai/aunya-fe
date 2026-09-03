import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { formatAccountNumber } from '@utils/input';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import QRPayment from '@components/booking/QRPayment';
import { useClipboard } from 'use-clipboard-copy';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';

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
  const [activeTab, setActiveTab] = useState<'qr' | 'bank'>('qr');
  const [copying, setCopying] = useState(false);
  const [savingQr, setSavingQr] = useState(false);
  const clipboard = useClipboard();
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    clipboard.copy(bankAccount);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleSaveQR = async () => {
    try {
      setSavingQr(true);
      if (qrContainerRef.current) {
        const canvas = await html2canvas(qrContainerRef.current, {
          scale: 3,
          backgroundColor: '#ffffff',
          useCORS: true,
        });
        const link = document.createElement('a');
        link.download = `Aunya-QR-PromptPay-${paidAmount}THB.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        const directCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;
        if (directCanvas) {
          const link = document.createElement('a');
          link.download = `Aunya-QR-PromptPay-${paidAmount}THB.png`;
          link.href = directCanvas.toDataURL('image/png');
          link.click();
        }
      }
      setTimeout(() => setSavingQr(false), 2000);
    } catch (err) {
      console.error('Error saving QR:', err);
      const directCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      if (directCanvas) {
        const link = document.createElement('a');
        link.download = `Aunya-QR-PromptPay-${paidAmount}THB.png`;
        link.href = directCanvas.toDataURL('image/png');
        link.click();
      }
      setTimeout(() => setSavingQr(false), 2000);
    }
  };

  return (
    <Stack spacing={2.5}>
      {/* 1. Amount Due Card */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          bgcolor: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(21, 128, 61, 0.06)',
        }}
      >
        <Typography variant="caption" fontWeight={700} color="#166534" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {isOnlyDeposit ? t("payment.paymentDueDeposit", "ยอดชำระครั้งนี้ (มัดจำ)") : t("payment.paymentDueTotal", "รวมยอดชำระทั้งสิ้น")}
        </Typography>

        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            color: '#15803d',
            my: 0.5,
            fontSize: { xs: '1.85rem', sm: '2.3rem' },
          }}
        >
          {paidAmount.toLocaleString(i18n.language === 'en' ? 'en-US' : 'th-TH', {
            style: 'currency',
            currency: 'THB',
          })}
        </Typography>

        {isOnlyDeposit && remainingAmount > 0 && (
          <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600, display: 'block', mt: 0.5, fontSize: '0.82rem' }}>
            {t("confirmation.remainingAmount", "ยอดค้างชำระ (จ่ายตอน Check-in)")}: <strong>{remainingAmount.toLocaleString()} {t("success.thb")}</strong>
          </Typography>
        )}
      </Box>

      {/* 2. Payment Channel Tab Menu */}
      <Box>
        <Paper
          variant="outlined"
          sx={{
            p: 0.5,
            bgcolor: '#f1f5f9',
            borderRadius: 3,
            borderColor: '#e2e8f0',
            mb: 2,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="fullWidth"
            sx={{
              minHeight: 44,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                borderRadius: 2.5,
                minHeight: 40,
                py: 1,
                fontWeight: 700,
                fontSize: { xs: '0.88rem', sm: '0.95rem' },
                color: '#64748b',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  bgcolor: '#ffffff',
                  color: '#b03052',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
              },
            }}
          >
            <Tab
              value="qr"
              label={t('payment.tabQr', 'QR Code')}
              icon={<QrCode2Icon sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab
              value="bank"
              label={t('payment.tabBank', 'โอนผ่านเลขบัญชี')}
              icon={<AccountBalanceIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Panel 1: QR Code Payment (Default) */}
        {activeTab === 'qr' && (
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              bgcolor: '#fff',
              borderRadius: 3,
              borderColor: '#e2e8f0',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontWeight: 500 }}>
              {t("payment.scanQrInstruction", "เปิดแอปธนาคารใดก็ได้เพื่อสแกน QR Code")}
            </Typography>

            {/* QR Code Container to Save */}
            <Box
              ref={qrContainerRef}
              sx={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: { xs: 2, sm: 2.5 },
                bgcolor: '#ffffff',
                borderRadius: 3,
                border: '2px dashed #fecdd3',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                mb: 2,
                maxWidth: 280,
                mx: 'auto',
              }}
            >
              <QRPayment qrId={QRcode} value={paidAmount} size={210} />
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#b03052', mt: 1.5, fontSize: '1.1rem' }}>
                ฿{paidAmount.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>
                {QRcode.replace(/(\d{3})(\d{3})(\d{4})/, '$1-xxx-$3')} • {QRname}
              </Typography>
            </Box>

            {/* Save QR Code Button */}
            <Box sx={{ mt: 1 }}>
              <Button
                variant="contained"
                onClick={handleSaveQR}
                startIcon={savingQr ? <CheckCircleIcon /> : <DownloadIcon />}
                sx={{
                  py: 1.2,
                  px: 3,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  bgcolor: savingQr ? '#15803d' : '#b03052',
                  boxShadow: '0 4px 14px rgba(176, 48, 82, 0.25)',
                  '&:hover': {
                    bgcolor: savingQr ? '#166534' : '#8e2340',
                  },
                }}
              >
                {savingQr ? t('payment.savedQr', 'บันทึกภาพสำเร็จ!') : t('payment.saveQr', 'บันทึก QR Code')}
              </Button>
            </Box>
          </Paper>
        )}

        {/* Tab Panel 2: Bank Account Transfer */}
        {activeTab === 'bank' && (
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              bgcolor: '#f8fafc',
              borderRadius: 3,
              borderColor: '#e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">{t("payment.bank", "ธนาคาร")}</Typography>
                <Typography variant="subtitle2" fontWeight={700} color="#00A3E3">
                  {bankName}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">{t("payment.accountName", "ชื่อบัญชี")}</Typography>
                <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
                  {QRname}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: '#fff',
                  borderRadius: 2.5,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {t("payment.accountNumber", "หมายเลขบัญชี")}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#00A3E3" letterSpacing={0.5} sx={{ fontSize: { xs: '1.15rem', sm: '1.3rem' } }}>
                    {formatAccountNumber(bankAccount)}
                  </Typography>
                </Box>

                <Button
                  onClick={handleCopy}
                  size="small"
                  variant="outlined"
                  startIcon={copying ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textTransform: 'none',
                    bgcolor: copying ? '#f0fdf4' : '#f8fafc',
                    borderColor: copying ? '#86efac' : '#cbd5e1',
                    color: copying ? '#16a34a' : '#475569',
                    '&:hover': {
                      bgcolor: '#f1f5f9',
                      borderColor: '#94a3b8',
                    },
                  }}
                >
                  {copying ? t("payment.copied", "คัดลอกแล้ว") : t("payment.copy", "คัดลอก")}
                </Button>
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>
    </Stack>
  );
}

export default PaymentStep;
