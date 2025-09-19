# ----- Stage 1: Build the application -----
FROM node:22-alpine AS builder

# รับ Build Arguments จากคำสั่ง docker build (จะถูกส่งมาจาก GitHub Actions)
ARG VITE_BASE_URL
ARG VITE_ROOM_ID
ARG VITE_JWT_SECRET

# ตั้งค่า Environment Variables ให้ Vite สามารถใช้งานได้ตอน build
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_ROOM_ID=$VITE_ROOM_ID
ENV VITE_JWT_SECRET=$VITE_JWT_SECRET

WORKDIR /app

# CHANGED: คัดลอก package.json และ package-lock.json
COPY package.json package-lock.json* ./

# CHANGED: ใช้ npm ci เพื่อติดตั้ง dependencies ทั้งหมดจาก package-lock.json
# `npm ci` เร็วกว่าและปลอดภัยกว่า `npm install` ใน CI/CD
RUN npm ci

# Copy source code
COPY . .

# CHANGED: ใช้ npm run build
RUN npm run build

# ----- Stage 2: Create the final production image -----
FROM node:22-alpine

WORKDIR /app

# CHANGED: คัดลอก package.json และ package-lock.json
COPY package.json package-lock.json* ./

# CHANGED: ติดตั้งเฉพาะ production dependencies โดยใช้ --omit=dev
RUN npm ci --omit=dev

# คัดลอกโฟลเดอร์ build จาก Stage 1
COPY --from=builder /app/dist ./dist

# Expose port 8080 ที่เราจะให้ serve ทำงาน
EXPOSE 8080

# User ที่ไม่มีสิทธิ์ root เพื่อความปลอดภัย
USER node

# CHANGED: คำสั่งสำหรับเริ่มการทำงานของ production server ด้วย npm
CMD ["npm", "start"]