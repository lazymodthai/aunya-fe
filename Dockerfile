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

# Enable corepack for Yarn 4
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# Install ALL dependencies (including devDependencies like vite) to build
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

# คัดลอกเฉพาะไฟล์ที่จำเป็นสำหรับการรัน production server
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# ติดตั้งเฉพาะ production dependencies (เช่น serve) จะไม่ติดตั้ง devDependencies
RUN yarn install --production

# คัดลอกโฟลเดอร์ build จาก Stage 1
COPY --from=builder /app/dist ./dist

# Expose port 8080 ที่เราจะให้ serve ทำงาน
EXPOSE 8080

# User ที่ไม่มีสิทธิ์ root เพื่อความปลอดภัย
USER node

# คำสั่งสำหรับเริ่มการทำงานของ production server
CMD ["yarn", "start"]