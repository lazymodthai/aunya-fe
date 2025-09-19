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
RUN corepack enable && \
    corepack prepare yarn@4.8.1 --activate
ENV NODE_ENV=production

RUN chown -R node:node /app
USER node

COPY --chown=node:node --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --chown=node:node --from=builder /app/.yarn ./.yarn

RUN yarn install

COPY --chown=node:node --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["yarn", "start"]