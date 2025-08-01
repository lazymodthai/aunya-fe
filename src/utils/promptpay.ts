
import generatePayload from 'promptpay-qr';


/**
 * สร้าง payload string สำหรับ PromptPay QR Code
 *
 * @param {string} promptpayId - หมายเลขโทรศัพท์มือถือ หรือ เลขประจำตัวผู้เสียภาษี/บัตรประชาชน
 * @param {number} [amount] - จำนวนเงิน (เป็นตัวเลือก)
 * @returns {string} - Payload string ที่พร้อมสำหรับนำไปสร้างเป็น QR Code
 */
export function generatePromptPayPayload(promptpayId: string, amount?: number): string {
  const formattedAmount = amount ? parseFloat(amount.toFixed(2)) : undefined;

  // เรียกใช้ฟังก์ชันที่ import มาโดยตรง
  const payload = generatePayload(promptpayId, { amount: formattedAmount });

  return payload;
}