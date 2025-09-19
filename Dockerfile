FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

RUN yarn install

COPY . .

RUN --mount=type=secret,id=vite_env_secret \
    source /run/secrets/vite_env_secret && \
    yarn build

FROM node:22-alpine

WORKDIR /app

USER node

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json

EXPOSE 8080

CMD ["yarn", "start"]