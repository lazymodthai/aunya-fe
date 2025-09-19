# ----- Stage 1: Build the application -----
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# Install all dependencies (dev + prod) to build the app
RUN yarn install

COPY . .

# Securely build the application using secrets
RUN --mount=type=secret,id=vite_env_secret \
    source /run/secrets/vite_env_secret && \
    yarn build

# ----- Stage 2: Create the final production image -----
FROM node:22-alpine

WORKDIR /app

RUN corepack enable && \
    corepack prepare yarn@4.8.1 --activate

# Setting NODE_ENV to production is a standard practice
ENV NODE_ENV=production

# Change to a non-root user for security
USER node

# Copy only the necessary files to install production dependencies
COPY --chown=node:node --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --chown=node:node --from=builder /app/.yarn ./.yarn

# Install ONLY production dependencies. Yarn respects NODE_ENV=production.
RUN yarn install

# Copy the built application from the builder stage
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 8080

# The "start" script from package.json will run serve, which is now in the lean node_modules
CMD ["yarn", "start"]