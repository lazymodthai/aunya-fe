# ----- Stage 1: Build the application -----
FROM node:22-alpine AS builder

# รับ Build Arguments จากคำสั่ง docker build
ARG VITE_BASE_URL
ARG VITE_ROOM_ID
ARG VITE_JWT_SECRET

# ตั้งค่า Environment Variables ให้ Vite สามารถใช้งานได้ตอน build
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_ROOM_ID=$VITE_ROOM_ID
ENV VITE_JWT_SECRET=$VITE_JWT_SECRET

WORKDIR /app

# Enable corepack for Yarn 4
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# ติดตั้ง dependencies ทั้งหมดที่จำเป็นสำหรับการ build
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build

# ----- Stage 2: Create the final production image -----
FROM node:22-alpine

WORKDIR /app

# Enable corepack for Yarn 4
RUN corepack enable

# --- ส่วนที่แก้ไข ---
# ไม่ต้องรัน yarn install อีก
# แต่ให้คัดลอกไฟล์ที่จำเป็นทั้งหมดจาก Stage แรก

# 1. คัดลอกไฟล์ config ของโปรเจกต์และ Yarn
COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
# 2. คัดลอก PnP map และ Yarn binaries
COPY --from=builder /app/.pnp.cjs ./
COPY --from=builder /app/.yarn ./.yarn
# 3. คัดลอกโฟลเดอร์ build ที่เสร็จแล้ว
COPY --from=builder /app/dist ./dist

# Expose port 8080 ที่เราจะให้ serve ทำงาน
EXPOSE 8080

# User ที่ไม่มีสิทธิ์ root เพื่อความปลอดภัย
USER node

# คำสั่งสำหรับเริ่มการทำงานของ production server (ยังคงเดิม)
CMD ["yarn", "start"]