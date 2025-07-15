# Use Node.js official image
FROM node:18-alpine

# Enable corepack for Yarn 4
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package.json, yarn.lock, and .yarnrc.yml
COPY package.json yarn.lock .yarnrc.yml ./

# Copy .yarn directory if it exists (for Yarn 4 PnP or cache)
COPY .yarn .yarn

# Set Yarn version
RUN yarn set version 4.8.1

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Expose port 5173 (default Vite dev server port)
EXPOSE 5173

# Start development server
CMD ["yarn", "dev", "--host", "0.0.0.0"]