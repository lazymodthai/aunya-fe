/**
 * Centralized app settings — ค่าเริ่มต้นทั้งหมดของแอป
 * ค่าที่มี API (Settings) จะถูก override ตอน runtime ผ่าน fetchSettings()
 */
import SettingsAPI from '@apis/settings';

// ──────────────────────────────────────────────
// Booking & Pricing
// ──────────────────────────────────────────────
/** ราคาที่นอนเสริม (บาท/ชุด) — overridable by API key: extraBedPrice */
export const DEFAULT_EXTRA_BED_PRICE = 300;

/** ราคาผ้าขนหนู+ผ้าเช็ดผม (บาท/ชุด) — overridable by API key: towelPrice */
export const DEFAULT_TOWEL_PRICE = 100;

/** จำนวนผู้เข้าพักสูงสุด — overridable by API key: maxGuests */
export const DEFAULT_MAX_GUESTS = 10;

/** จำนวนที่นอนเสริมสูงสุด — overridable by API key: extraBedCount */
export const DEFAULT_EXTRA_BED_COUNT = 2;

/** จำนวนผ้าขนหนูสูงสุด — overridable by API key: towelCount */
export const DEFAULT_TOWEL_COUNT = 10;

/** จำนวนเด็กสูงสุด — overridable by API key: maxChildren */
export const DEFAULT_MAX_CHILDREN = 3;

/** จำนวนเดือนที่เปิดให้จองล่วงหน้า — overridable by API key: advanceBookingMonths */
export const DEFAULT_ADVANCE_BOOKING_MONTHS = 6;

/** เงินมัดจำปกติ (บาท/คืน) */
export const DEPOSIT_PRICE = 2000;

/** ราคาห้องที่ถือว่าเป็น High Price (บาท) */
export const HIGH_PRICE_THRESHOLD = 7900;

/** เงินมัดจำสำหรับวัน High Price (บาท/คืน) */
export const HIGH_PRICE_DEPOSIT = 3000;

// ──────────────────────────────────────────────
// Payment / PromptPay
// ──────────────────────────────────────────────
export const PROMPTPAY_QR_CODE = '1100400100824';
export const PROMPTPAY_NAME = 'นางสุจิตรา อ่อนคำ';
export const BANK_NAME = 'กรุงไทย';
export const BANK_ACCOUNT = '7790516787';

// ──────────────────────────────────────────────
// Contact
// ──────────────────────────────────────────────
export const CONTACTS = [
  { name: 'คุณธนิก', nameEn: 'Thanik', phone: '0880844455', phoneDisplay: '088-084-4455' },
  { name: 'คุณสุ', nameEn: 'Su', phone: '0831818502', phoneDisplay: '083-181-8502' },
] as const;

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/muangkhon399',
  line: 'https://line.me/ti/p/~jent11',
  lineId: 'jent11',
} as const;

// ──────────────────────────────────────────────
// Location
// ──────────────────────────────────────────────
export const LOCATION = {
  lat: 8.421749308902015,
  lng: 99.86632397235644,
  googleMapsEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.7953414102712!2d99.86375253928468!3d8.421749891652277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3053ab2b3652a0f9%3A0x7fc9d09c826b3bd7!2z4Lit4Lix4LiZ4Lir4Lii4Liy4Lie4Li54Lil4Liu4Li04Lil4Lil4LmI4LiyIEF1bnlhIFBvb2wgVmlsbGE!5e0!3m2!1sth!2sth!4v1753346964289!5m2!1sth!2sth',
} as const;

// ──────────────────────────────────────────────
// Property Info
// ──────────────────────────────────────────────
export const PROPERTY = {
  nameThFull: 'อันหยาพูลวิลล่า นครศรีธรรมราช',
  nameEn: 'Aunya Pool Villa Nakhon Si Thammarat',
  bedrooms: 3,
  bathrooms: 3,
  parkingSlots: 4,
} as const;

// ──────────────────────────────────────────────
// SEO Configuration
// ──────────────────────────────────────────────
export const SEO = {
  siteUrl: 'https://www.aunyapoolvilla.com',
  siteName: 'Aunya Pool Villa',
  defaultTitle: 'อันหยา พูลวิลล่า นครศรีธรรมราช | Aunya Pool Villa | จองห้องพัก 088-084-4455',
  defaultDescription: 'พูลวิลล่าสุดหรู นครศรีธรรมราช 3 ห้องนอน 3 ห้องน้ำ สระว่ายน้ำส่วนตัว รองรับ 10+ คน เหมาะสำหรับครอบครัว ปาร์ตี้ สังสรรค์ จองเลย โทร 088-084-4455',
  keywords: 'พูลวิลล่า, pool villa, นครศรีธรรมราช, ที่พัก, บ้านพักมีสระว่ายน้ำ, อันหยา, Aunya, วิลล่า, ห้องพัก, จองที่พัก, สระว่ายน้ำส่วนตัว, ที่พักครอบครัว',
  ogImage: '/og-image.jpg',
  themeColor: '#1976d2',
} as const;

// ──────────────────────────────────────────────
// Room ID (from env)
// ──────────────────────────────────────────────
export const ROOM_ID: string = import.meta.env.VITE_ROOM_ID;

// ──────────────────────────────────────────────
// Helper: fetch settings from API and return merged values
// ──────────────────────────────────────────────
export interface AppSettings {
  extraBedPrice: number;
  towelPrice: number;
  maxGuests: number;
  maxChildren: number;
  extraBedCount: number;
  towelCount: number;
  advanceBookingMonths: number;
}

export async function fetchAppSettings(): Promise<AppSettings> {
  const defaults: AppSettings = {
    extraBedPrice: DEFAULT_EXTRA_BED_PRICE,
    towelPrice: DEFAULT_TOWEL_PRICE,
    maxGuests: DEFAULT_MAX_GUESTS,
    maxChildren: DEFAULT_MAX_CHILDREN,
    extraBedCount: DEFAULT_EXTRA_BED_COUNT,
    towelCount: DEFAULT_TOWEL_COUNT,
    advanceBookingMonths: DEFAULT_ADVANCE_BOOKING_MONTHS,
  };

  try {
    const { data } = await SettingsAPI.getAll();
    const map = new Map(data.settings.map((s) => [s.key, s.value]));

    return {
      extraBedPrice: Number(map.get('extraBedPrice')) || defaults.extraBedPrice,
      towelPrice: Number(map.get('towelPrice')) || defaults.towelPrice,
      maxGuests: Number(map.get('maxGuests')) || defaults.maxGuests,
      maxChildren: Number(map.get('maxChildren')) || defaults.maxChildren,
      extraBedCount: Number(map.get('extraBedCount')) || defaults.extraBedCount,
      towelCount: Number(map.get('towelCount')) || defaults.towelCount,
      advanceBookingMonths: Number(map.get('advanceBookingMonths')) || defaults.advanceBookingMonths,
    };
  } catch (err) {
    console.error('Failed to load app settings, using defaults:', err);
    return defaults;
  }
}
