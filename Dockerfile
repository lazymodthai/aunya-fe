FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn install

COPY . .

ARG VITE_BASE_URL
ARG VITE_ROOM_ID
ARG VITE_JWT_SECRET

ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_ROOM_ID=$VITE_ROOM_ID
ENV VITE_JWT_SECRET=$VITE_JWT_SECRET

RUN yarn build

FROM node:22-alpine
WORKDIR /app
RUN corepack enable && corepack prepare yarn@4.8.1 --activate
ENV NODE_ENV=production

RUN chown -R node:node /app
USER node

COPY --chown=node:node --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --chown=node:node --from=builder /app/.yarn ./.yarn

RUN yarn workspaces focus --all --production

COPY --chown=node:node --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["yarn", "start"]
