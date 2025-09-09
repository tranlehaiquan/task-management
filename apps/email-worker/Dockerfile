FROM node:22-alpine

WORKDIR /app

# Enable Corepack-managed package managers
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/email-worker/package.json ./apps/email-worker/
COPY packages/queue/package.json ./packages/queue/
COPY packages/mail/package.json ./packages/mail/

# Install dependencies (frozen)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the queue and mail packages first
RUN cd packages/queue && pnpm build
RUN cd packages/mail && pnpm build

# Build the email worker
RUN cd apps/email-worker && pnpm build

# No ports exposed; worker runs headless

# Start the email worker
CMD ["node", "apps/email-worker/dist/main.js"]
