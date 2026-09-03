# Aunya Pool Villa — Project Context

## Overview
ระบบจองบ้านพักตากอากาศ Aunya Pool Villa แบ่งเป็น 2 repo:
- **Frontend**: `/Users/anuchakaewnil/lazymodthai/aunya-fe` (React + Vite + MUI)
- **Backend**: `/Users/anuchakaewnil/lazymodthai/aunya-be` (NestJS + TypeORM + PostgreSQL)

---

## Tech Stack

### Frontend (aunya-fe)
| เรื่อง | เทคโนโลยี |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| UI Library | Material UI (MUI) v7 |
| Routing | React Router v7 |
| State | Redux Toolkit |
| HTTP | Axios (หลายๆ instances แยกตาม module) |
| Font | Kanit (Google Fonts) |
| Breakpoint mobile | `max-width: 800px` ผ่าน `useMediaQuery` |

### Backend (aunya-be)
| เรื่อง | เทคโนโลยี |
|---|---|
| Framework | NestJS + TypeScript |
| Database | PostgreSQL via TypeORM (synchronize: true) |
| File Storage | NIPA Cloud S3-compatible |
| Auth | JWT + Cookie (session) |
| Dev port | 3200 |

---

## Path Aliases

### Frontend (vite.config.ts)
```
@apis       → src/apis/
@components → src/components/
@pages      → src/pages/
@store      → src/store/
@configs    → src/configs/
@constants  → src/constants/
@utils      → src/utils/
@assets     → src/assets/
```

### Backend (tsconfig.json)
```
@src/*      → src/*
@/entities/*→ entities/*
```

---

## Key Architecture Decisions

### Mobile-First Layout (refactored)
- Default layout เป็น mobile (`width: 100%`)
- Desktop ใช้ `maxWidth: 1366` หรือ `maxWidth: 1200` ตาม page
- Bottom navigation bar บน mobile แทน top tabs
- Breakpoint เดียว: `800px` ผ่าน `useMediaQuery("(max-width:800px)")`
- Calendar ใช้ CSS Grid `repeat(7, 1fr)` แทน MUI Grid เพื่อให้ 7 columns align ตรง

### API Instance Pattern
แต่ละ domain มี Axios instance แยก ใน `src/apis/instance.ts`:
```
InstanceAuthAPI        → auth (has Authorization header)
InstanceBookingAPI     → booking
InstancePricesAPI      → prices
InstanceUploadAPI      → file upload
InstanceGalleryAPI     → gallery
InstancePropertyInfoAPI → property-info
```
Admin API calls ใช้ cookie-based session (`withCredentials: true`) ไม่ต้องส่ง token แยก

### Backend Module Pattern
ทุก module ใน `src/<name>/` ประกอบด้วย:
- `*.entity.ts` — TypeORM entity
- `*.service.ts` — business logic + `onModuleInit` สำหรับ seed data
- `*.controller.ts` — HTTP handlers พร้อม Swagger decorators
- `*.module.ts` — NestJS module registration
Admin endpoints ใช้ `@AdminOnly()` decorator จาก `@src/auth/decorators`

### File Upload to NIPA Cloud S3
```typescript
// S3 client อยู่ที่ src/files/nipa.ts
import { nipaS3 } from '../files/nipa';
// Key format: <folder>/<timestamp>-<random>.<ext>
// ACL: 'public-read'
// CacheControl: 'public, max-age=31536000, immutable'  ← ตั้งไว้เสมอเพื่อลด egress
```

### Caching Strategy (ลด S3 egress)
1. **S3 objects**: ตั้ง `CacheControl: 'public, max-age=31536000, immutable'` ตอน upload → browser cache 1 ปี
2. **API GET responses**: ตั้ง `Cache-Control: public, max-age=300, stale-while-revalidate=3600` header
3. **Frontend localStorage**: `src/utils/cache.ts` — TTL-based localStorage cache
   - `cacheGet<T>(key)` / `cacheSet(key, data, ttlMs)` / `cacheDelete(key)`
   - ต้อง `cacheDelete` หลัง mutation เสมอ

---

## Modules / Pages

### Frontend Pages
| Route | Page | หน้าที่ |
|---|---|---|
| `/` | Main.tsx | หน้าแรก: swiper, property info, calendar |
| `/room` | Room.tsx | รูปภาพ gallery |
| `/map` | Map.tsx | แผนที่ |
| `/booking` | Booking.tsx | จองห้องพัก (multi-step stepper) |
| `/member/login` | Login.tsx | เข้าสู่ระบบ |
| `/member/register` | Register.tsx | สมัครสมาชิก |
| `/member/admin` | AdminPage.tsx | Admin dashboard (tabs) |
| `/member/user` | UserPage.tsx | ประวัติการจองของ user |

### Admin Dashboard Tabs (AdminPage.tsx)
0. SummaryTab — สรุปยอด
1. CalendarTab — ปฏิทิน (AdminBookingCalendar)
2. BookingsTab — การจองทั้งหมด
3. PriceSettingsTab — ตั้งราคา
4. DiscountCodeTab — โค้ดส่วนลด
5. GalleryTab — รูปภาพ slider
6. SettingsTab — ตั้งค่าทั่วไป

### Backend Modules
| Module | Endpoint prefix | หน้าที่ |
|---|---|---|
| auth | `/auth` | login, register, verify, profile, logout |
| booking | `/booking` | จอง, ดูการจอง, อัปเดตสถานะ |
| prices | `/prices` | ดึงราคา, อัปเดตราคา, discount codes |
| gallery | `/gallery` | รูป slider (upload/list/delete) |
| property-info | `/property-info` | ข้อมูลทั่วไป/สิ่งอำนวย/ข้อกำหนด |
| settings | `/settings` | config ต่างๆ (maxGuests, extraBed, etc.) |
| files | `/files` | upload slip, รูปอื่นๆ |
| check-slip | `/check-slip` | ตรวจสลิปอัตโนมัติ |

---

## Property Info Feature (ข้อมูลทั่วไป / สิ่งอำนวย / ข้อกำหนด)

### Entity: `property_info` table
```
id         UUID PK
category   varchar(50)  → 'general' | 'facilities' | 'policies'
label      varchar(500)
iconUrl    varchar(1000) nullable
iconS3Key  varchar(1000) nullable
sortOrder  int default 0
createdAt, updatedAt
```

### API Endpoints
```
GET    /property-info?category=facilities   → public, cached 5min
POST   /property-info                       → admin, create item
PATCH  /property-info/:id/label             → admin, update text
POST   /property-info/:id/icon              → admin, upload icon (png/svg/webp)
DELETE /property-info/:id                   → admin, delete + remove S3 icon
```

### Frontend Component: EditablePropertySection
`src/components/main/EditablePropertySection.tsx`
- Props: `title`, `category`, `items`, `isAdmin`, `onItemsChange`
- View mode: แสดง icon + label
- Edit mode (admin only): icon คลิกเพื่ออัปโหลด, text field แก้ไขได้, ปุ่มลบ, เพิ่มรายการใหม่
- Icon: คลิก → file picker → POST `/property-info/:id/icon` → update state + invalidate cache

---

## Booking Flow (5 steps)
1. DateSelectionStep — เลือกวันเข้า-ออก, จำนวนคน, ข้อมูลผู้จอง, PDPA
2. ConfirmationStep — ยืนยันรายการ, กรอก discount code, เลือกจ่ายเต็ม/มัดจำ
3. PaymentStep — แสดง QR PromptPay / บัญชีธนาคาร
4. SlipUploadStep — อัปโหลดสลิปการชำระ
5. SuccessStep — สำเร็จ + สรุปข้อมูล

---

## Environment Variables

### Frontend (.env)
```
VITE_BASE_URL=https://api.aunyapoolvilla.com/
```

### Backend (.env.development)
```
DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
NIPA_CLOUD_ENDPOINT, NIPA_CLOUD_BUCKET_NAME
NIPA_CLOUD_ACCESS_KEY_ID, NIPA_CLOUD_SECRET_ACCESS_KEY
CORS_ORIGIN
```

---

## Important Notes
- TypeORM `synchronize: true` ใน development — table สร้างอัตโนมัติ ไม่ต้อง migrate
- Seed data ทำผ่าน `onModuleInit` ใน service — check `count() === 0` ก่อน insert
- Mobile bottom nav height = 70px → content ต้องมี `pb: 10` (80px) เพื่อไม่ให้ถูกบัง
- Calendar ใช้ CSS Grid (ไม่ใช้ MUI Grid) เพื่อ 7-column alignment ที่แม่นยำ
- `strictNullChecks: false` และ `noImplicitAny: false` ในทั้ง 2 projects
