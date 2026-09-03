export const numberOnly = (value: string) => {
  return value.replace(/\D/g, '');
}

export const decimalOnly = (value: string) => {
  return value.replace(/[^\d.]/g, '');
}

export const formatPriceValue = (value: number | string): string => {
  const num = typeof value === 'string' ? parsePriceValue(value) : value;
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('th-TH');
};

export const parsePriceValue = (value: string): number => {
  return Number(value.replace(/[^0-9]/g, '')) || 0;
};

export const alphanumericOnly = (value: string) => {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export const formatPhoneNumber = (phoneNumber:string) => {
  if (typeof phoneNumber !== 'string' || phoneNumber.length !== 10) {
    throw new Error("Invalid phone number format. Please provide a 10-digit phone number.");
  }

  return phoneNumber.slice(0, 2) + '*-***' + phoneNumber.slice(6);
}

export interface CountryCodeItem {
  code: string;
  country: string;
  nameTh: string;
  nameEn: string;
  flag: string;
  example: string;
}

export const COUNTRY_CODES: CountryCodeItem[] = [
  { code: '+66', country: 'TH', nameTh: 'ไทย (+66)', nameEn: 'Thailand (+66)', flag: '🇹🇭', example: '088 084 4455' },
  { code: '+60', country: 'MY', nameTh: 'มาเลเซีย (+60)', nameEn: 'Malaysia (+60)', flag: '🇲🇾', example: '12 345 6789' },
  { code: '+65', country: 'SG', nameTh: 'สิงคโปร์ (+65)', nameEn: 'Singapore (+65)', flag: '🇸🇬', example: '9123 4567' },
  { code: '+86', country: 'CN', nameTh: 'จีน (+86)', nameEn: 'China (+86)', flag: '🇨🇳', example: '138 0000 0000' },
  { code: '+1', country: 'US', nameTh: 'สหรัฐฯ / แคนาดา (+1)', nameEn: 'USA / Canada (+1)', flag: '🇺🇸', example: '202 555 0123' },
  { code: '+44', country: 'GB', nameTh: 'สหราชอาณาจักร (+44)', nameEn: 'UK (+44)', flag: '🇬🇧', example: '7911 123456' },
  { code: '+81', country: 'JP', nameTh: 'ญี่ปุ่น (+81)', nameEn: 'Japan (+81)', flag: '🇯🇵', example: '90 1234 5678' },
  { code: '+82', country: 'KR', nameTh: 'เกาหลีใต้ (+82)', nameEn: 'South Korea (+82)', flag: '🇰🇷', example: '10 1234 5678' },
  { code: '+61', country: 'AU', nameTh: 'ออสเตรเลีย (+61)', nameEn: 'Australia (+61)', flag: '🇦🇺', example: '412 345 678' },
  { code: '+49', country: 'DE', nameTh: 'เยอรมนี (+49)', nameEn: 'Germany (+49)', flag: '🇩🇪', example: '151 23456789' },
  { code: '+33', country: 'FR', nameTh: 'ฝรั่งเศส (+33)', nameEn: 'France (+33)', flag: '🇫🇷', example: '6 12 34 56 78' },
  { code: '+7', country: 'RU', nameTh: 'รัสเซีย (+7)', nameEn: 'Russia (+7)', flag: '🇷🇺', example: '912 345-67-89' },
  { code: '+91', country: 'IN', nameTh: 'อินเดีย (+91)', nameEn: 'India (+91)', flag: '🇮🇳', example: '98765 43210' },
  { code: '+852', country: 'HK', nameTh: 'ฮ่องกง (+852)', nameEn: 'Hong Kong (+852)', flag: '🇭🇰', example: '9123 4567' },
  { code: '+886', country: 'TW', nameTh: 'ไต้หวัน (+886)', nameEn: 'Taiwan (+886)', flag: '🇹🇼', example: '912 345 678' },
  { code: '+84', country: 'VN', nameTh: 'เวียดนาม (+84)', nameEn: 'Vietnam (+84)', flag: '🇻🇳', example: '91 234 5678' },
  { code: '+62', country: 'ID', nameTh: 'อินโดนีเซีย (+62)', nameEn: 'Indonesia (+62)', flag: '🇮🇩', example: '812 3456 7890' },
  { code: '+63', country: 'PH', nameTh: 'ฟิลิปปินส์ (+63)', nameEn: 'Philippines (+63)', flag: '🇵🇭', example: '917 123 4567' },
  { code: '+95', country: 'MM', nameTh: 'เมียนมา (+95)', nameEn: 'Myanmar (+95)', flag: '🇲🇲', example: '9 123 456789' },
  { code: '+856', country: 'LA', nameTh: 'ลาว (+856)', nameEn: 'Laos (+856)', flag: '🇱🇦', example: '20 1234 5678' },
  { code: '+855', country: 'KH', nameTh: 'กัมพูชา (+855)', nameEn: 'Cambodia (+855)', flag: '🇰🇭', example: '12 345 678' },
  { code: '+', country: 'OTHER', nameTh: 'อื่นๆ (+...)', nameEn: 'Other (+...)', flag: '🌍', example: 'Country code + number' },
];

export const isValidPhoneNumber = (countryCode: string, rawLocalNumber: string): boolean => {
  const digits = rawLocalNumber.replace(/\D/g, '');
  if (!digits) return false;

  if (countryCode === '+66') {
    // If starting with 0, must be 9-10 digits starting with valid Thai mobile/landline prefix
    if (digits.startsWith('0')) {
      return /^(06|08|09|02|03|04|05|07)\d{7,8}$/.test(digits);
    }
    // If entered without leading 0 (e.g. 880844455), must be 9 digits
    return /^(6|8|9|2|3|4|5|7)\d{7,8}$/.test(digits);
  }

  // International phone numbers (E.164 standard: 6 to 15 digits)
  return digits.length >= 6 && digits.length <= 15;
};

export const isValidThaiPhoneNumber = (phoneNumber:string) =>  {
  const regex = /^(08|09|06)\d{8}$/;
  return regex.test(phoneNumber);
}

export const formatCid = (value: string) => {

  if (value.length === 0) {
    return '';
  }

  if (value.length <= 1) {
    return value;
  } else if (value.length <= 5) {
    value = value.replace(/^(\d{1})(\d{0,4})$/, '$1-$2');
  } else if (value.length <= 10) {
    value = value.replace(/^(\d{1})(\d{0,4})(\d{0,5})$/, '$1-$2-$3');
  } else if (value.length <= 12) {
    value = value.replace(/^(\d{1})(\d{0,4})(\d{0,5})(\d{0,2})$/, '$1-$2-$3-$4');
  } else {
    value = value.replace(/^(\d{1})(\d{0,4})(\d{0,5})(\d{0,2})(\d{0,1})$/, '$1-$2-$3-$4-$5');
  }

  return value;
}

export const formatLaserId= (value: string) => {
  if (value.length === 0) {
    return '';
  }

  if (value.length <= 3) {
    return value;
  } else if (value.length <= 10) {
    // เพิ่มเครื่องหมาย "-" หลังจากตัวที่ 3
    return value.replace(/^([A-Z0-9]{3})([A-Z0-9]{0,7})$/, '$1-$2');
  } else {
    // เพิ่มเครื่องหมาย "-" หลังจากตัวที่ 3 และ 10
    return value.replace(/^([A-Z0-9]{3})([A-Z0-9]{0,7})([A-Z0-9]{0,2})$/, '$1-$2-$3');
  }
}


/**
 * เปลี่ยนฟอร์แมตเลขบัญชีให้เป็นรูปแบบที่กำหนด
 * - ถ้ามีตั้งแต่ 10 หลักขึ้นไป: ###-#-#####-########
 * - ถ้ามี 5-9 หลัก: ###-#-##### (ตามจำนวนหลักที่เหลือ)
 * - ถ้ามีน้อยกว่า 5 หลัก: ###-# (ตามจำนวนหลักที่มี)
 * @param accountNumber เลขบัญชีที่ต้องการเปลี่ยนฟอร์แมต
 * @returns เลขบัญชีในรูปแบบที่กำหนด
 */
export function formatAccountNumber(accountNumber: string): string {
  // ลบช่องว่างและอักขระที่ไม่ใช่ตัวเลข
  const digits = accountNumber.replace(/\D/g, '');
  
  // ถ้าไม่มีตัวเลข ให้คืนค่าว่าง
  if (digits.length === 0) {
    return '';
  }
  
  // จัดการกรณีที่มีน้อยกว่า 5 หลัก
  if (digits.length < 5) {
    // ถ้ามีน้อยกว่า 4 หลัก
    if (digits.length <= 3) {
      return digits;
    }
    // ถ้ามี 4 หลัก
    return `${digits.substring(0, 3)}-${digits.substring(3)}`;
  }
  
  // จัดการกรณีที่มี 5-9 หลัก
  if (digits.length < 10) {
    const part1 = digits.substring(0, 3);
    const part2 = digits.substring(3, 4);
    const part3 = digits.substring(4);
    return `${part1}-${part2}-${part3}`;
  }
  
  // จัดการกรณีที่มีตั้งแต่ 10 หลักขึ้นไป
  const part1 = digits.substring(0, 3);
  const part2 = digits.substring(3, 4);
  const part3 = digits.substring(4, 9);
  const part4 = digits.substring(9);
  
  return `${part1}-${part2}-${part3}-${part4}`;
}