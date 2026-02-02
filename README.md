# Aunya Poolvillla - ระบบจองที่พัก

<div align="center">

![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)
![MUI](https://img.shields.io/badge/MUI-7.2-007FFF?logo=mui)

**ระบบจองห้องพักออนไลน์สำหรับ Pool Villa พร้อมระบบจัดการสำหรับผู้ดูแล**

</div>

---

## ✨ ฟีเจอร์หลัก

### 🏠 **สำหรับผู้ใช้งานทั่วไป (Guest)**

| ฟีเจอร์                       | รายละเอียด                                                                  |
| ----------------------------- | --------------------------------------------------------------------------- |
| **หน้าแรก (Main)**            | แสดงข้อมูลที่พัก, สิ่งอำนวยความสะดวก, กฎระเบียบ, ปฏิทินราคา และข้อมูลติดต่อ |
| **แกลเลอรี (Room)**           | แสดงรูปภาพห้องพักแบบ Masonry Grid พร้อม Lightbox                            |
| **ปฏิทินราคา**                | แสดงราคาตามวัน, สถานะห้องว่าง/ไม่ว่าง/ปิดปรับปรุง                           |
| **ระบบจอง Multi-Step**        | ขั้นตอนจองครบวงจร (เลือกวัน → กรอกข้อมูล → ชำระเงิน → อัปโหลดสลิป → สำเร็จ) |
| **ชำระเงินผ่าน PromptPay QR** | แสดง QR Code สำหรับชำระเงิน                                                 |
| **รองรับส่วนลด**              | ใช้โค้ดส่วนลดได้                                                            |
| **แผนที่**                    | แสดงตำแหน่งที่พัก                                                           |

### 👤 **สำหรับลูกค้าที่ลงทะเบียน (Member)**

| ฟีเจอร์                 | รายละเอียด                                                   |
| ----------------------- | ------------------------------------------------------------ |
| **ระบบ Login/Register** | สมัครสมาชิกและเข้าสู่ระบบ                                    |
| **ดูประวัติการจอง**     | ตรวจสอบรายการจองของตัวเอง                                    |
| **ติดตามสถานะ**         | ดูสถานะการจอง (รอชำระ, ชำระแล้ว, เช็คอิน, เช็คเอาท์, ยกเลิก) |

### 🔧 **สำหรับผู้ดูแลระบบ (Admin)**

| แท็บ                  | ฟีเจอร์                                                 |
| --------------------- | ------------------------------------------------------- |
| **📅 Bookings**       | ดู/จัดการการจองทั้งหมด, อัปเดตสถานะ, ดูรายละเอียด, สลิป |
| **🗓️ Calendar**       | ปฏิทินแสดงการจองตามวัน, เปลี่ยนราคา/สถานะบำรุงรักษา     |
| **🎫 Discount Code**  | สร้าง/แก้ไข/ลบโค้ดส่วนลด (แบบเปอร์เซ็นต์หรือจำนวนเงิน)  |
| **🖼️ Gallery**        | เพิ่ม/ลบ/จัดเรียงลำดับรูปภาพ                            |
| **💰 Price Settings** | ตั้งราคาห้องพักตามช่วงวันที่                            |
| **⚙️ Settings**       | ตั้งค่าข้อมูลที่พัก, ช่องทางติดต่อ, บัญชีธนาคาร         |

---

## 🛠️ Technology Stack

```
Frontend:       React 19 + TypeScript
Build Tool:     Vite 6
UI Framework:   Material-UI (MUI) 7
State:          Redux Toolkit
Routing:        React Router 7
HTTP Client:    Axios
Date Handling:  date-fns + MUI X Date Pickers
Image Upload:   browser-image-resizer
QR Code:        promptpay-qr + qrcode.react
Carousel:       Swiper
```

---

## 📂 โครงสร้างโปรเจกต์

```
src/
├── apis/                 # API services
│   ├── auth.ts           # Authentication API
│   ├── booking.ts        # Booking CRUD
│   ├── gallery.ts        # Gallery images
│   ├── prices.ts         # Price calendar
│   ├── settings.ts       # App settings
│   └── upload.ts         # File upload
│
├── components/
│   ├── admin/            # Admin panel tabs
│   │   ├── BookingsTab.tsx
│   │   ├── CalendarTab.tsx
│   │   ├── DiscountCodeTab.tsx
│   │   ├── GalleryTab.tsx
│   │   ├── PriceSettingsTab.tsx
│   │   └── SettingsTab.tsx
│   │
│   ├── booking/          # Booking flow components
│   │   ├── steps/        # Multi-step form
│   │   ├── CustomDatePicker.tsx
│   │   └── QRPayment.tsx
│   │
│   └── main/             # Main page components
│       ├── BookingCalendar.tsx
│       ├── AdminBookingCalendar.tsx
│       ├── Navbar.tsx
│       └── SwiperPreview.tsx
│
├── pages/
│   ├── Main.tsx          # Landing page
│   ├── Room.tsx          # Gallery page
│   ├── Booking.tsx       # Booking flow
│   ├── Map.tsx           # Location map
│   └── member/
│       ├── Login.tsx
│       ├── Register.tsx
│       ├── AdminPage.tsx
│       └── UserPage.tsx
│
├── store/                # Redux store
├── configs/              # App configuration
├── constants/            # Enums & constants
├── utils/                # Utility functions
└── assets/               # Icons & images
```

---

## 🚀 การติดตั้งและรัน

### Prerequisites

- Node.js 18+
- Yarn 4.x

### Development

```bash
# ติดตั้ง dependencies
yarn install

# รัน development server
yarn dev
```

### Production Build

```bash
# Build สำหรับ production
yarn build

# Preview production build
yarn preview

# Run production server
yarn start
```

### Docker

```bash
docker compose up -d --build
```

---

## 🔧 Environment Variables

สร้างไฟล์ `.env` ใน root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📋 แนวทางการพัฒนาต่อ (Future Development)

### 🔴 Priority: High

| หัวข้อ                  | รายละเอียด                                                      |
| ----------------------- | --------------------------------------------------------------- |
| **Notification System** | แจ้งเตือนเมื่อมีการจองใหม่, ชำระเงิน, เปลี่ยนสถานะ (Line/Email) |
| **Multi-room Support**  | รองรับหลายห้องพัก/หลาย Property                                 |
| **Review & Rating**     | ระบบรีวิวและให้คะแนนจากลูกค้า                                   |
| **Reporting Dashboard** | สถิติรายได้, อัตราการเข้าพัก, รายงานสรุป                        |

### 🟡 Priority: Medium

| หัวข้อ                         | รายละเอียด                                   |
| ------------------------------ | -------------------------------------------- |
| **Payment Gateway**            | เชื่อมต่อ Omise/2C2P สำหรับชำระเงินอัตโนมัติ |
| **Booking Confirmation Email** | ส่งอีเมลยืนยันการจองอัตโนมัติ                |
| **Calendar Sync**              | Sync กับ Google Calendar / iCal              |
| **Multi-language**             | รองรับภาษาอังกฤษ                             |
| **PWA Support**                | รองรับ Progressive Web App                   |

### 🟢 Priority: Low

| หัวข้อ                     | รายละเอียด                        |
| -------------------------- | --------------------------------- |
| **Dark Mode**              | รองรับธีมมืด                      |
| **Booking Modification**   | ให้ลูกค้าแก้ไขวันจองได้เอง        |
| **Waitlist**               | ระบบจองคิวเมื่อห้องเต็ม           |
| **Seasonal Pricing Rules** | กฎราคาตามฤดูกาล/วันหยุด อัตโนมัติ |
| **OTA Integration**        | เชื่อมต่อ Agoda/Booking.com       |

---

## 🔗 API Endpoints

โปรเจกต์นี้ต้องใช้คู่กับ Backend API (แยก repo):

- `POST /auth/login` - เข้าสู่ระบบ
- `POST /auth/register` - สมัครสมาชิก
- `POST /booking/book` - สร้างการจอง
- `GET /booking/dates` - วันที่มีการจอง
- `GET /booking/disabled-dates` - วันที่ปิด
- `GET /prices/calendar/:roomId` - ปฏิทินราคา
- `GET /gallery` - รูปภาพแกลเลอรี
- `GET /settings` - ข้อมูลตั้งค่า

---

## 📝 License

Private - © 2026 Aunya Poolvillla

---

## 🤝 Contributors

- Development by LazyModThai Team
