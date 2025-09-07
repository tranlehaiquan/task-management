FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/email-worker/package.json ./apps/email-worker/
COPY packages/queue/package.json ./packages/queue/
COPY packages/mail/package.json ./packages/mail/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the queue and mail packages first
RUN cd packages/queue && pnpm build
RUN cd packages/mail && pnpm build

# Build the email worker
RUN cd apps/email-worker && pnpm build

# Expose port (though worker doesn't serve HTTP)
EXPOSE 3000

# Start the email worker
CMD ["node", "apps/email-worker/dist/main.js"]
