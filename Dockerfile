FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable

# ติดตั้ง dependencies
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn install

# copy source
COPY . .

# รับค่า build args
ARG VITE_BASE_URL
ARG VITE_ROOM_ID
ARG VITE_JWT_SECRET

# ส่งเป็น ENV เพื่อให้ Vite มองเห็น
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_ROOM_ID=$VITE_ROOM_ID
ENV VITE_JWT_SECRET=$VITE_JWT_SECRET

# build frontend
RUN yarn build

# -------- runtime stage --------
FROM node:22-alpine
WORKDIR /app
RUN corepack enable && corepack prepare yarn@4.8.1 --activate
ENV NODE_ENV=production

RUN chown -R node:node /app
USER node

COPY --chown=node:node --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --chown=node:node --from=builder /app/.yarn ./.yarn

RUN yarn install --production

COPY --chown=node:node --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["yarn", "start"]
