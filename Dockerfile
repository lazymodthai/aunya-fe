# ----- Stage 1: Build the application -----
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# Install dependencies using PnP
RUN yarn install

# Copy source code
COPY . .

# Securely build the application
RUN --mount=type=secret,id=vite_env_secret \
    source /run/secrets/vite_env_secret && \
    yarn build

# ----- Stage 2: Create the final production image -----
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

# เปลี่ยนเป็น non-root user ก่อนเพื่อความปลอดภัย
USER node

# --- ส่วนที่แก้ไข: คัดลอกไฟล์ที่จำเป็นสำหรับ PnP ---
# ไม่ต้องคัดลอก node_modules แต่คัดลอกไฟล์ PnP แทน
COPY --chown=node:node --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --chown=node:node --from=builder /app/.pnp.cjs ./
COPY --chown=node:node --from=builder /app/.yarn ./.yarn

# คัดลอกโฟลเดอร์ build ที่เสร็จแล้ว
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 8080

# ใช้ "yarn start" ซึ่ง Yarn จะใช้ PnP เพื่อหาและรัน "serve" ได้อย่างถูกต้อง
CMD ["yarn", "start"]