# apps/email-worker/Dockerfile

# Builder stage: install deps and build
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable

# Workspace manifests first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/email-worker/package.json apps/email-worker/
COPY packages/queue/package.json packages/queue/
COPY packages/mail/package.json packages/mail/

# Install all deps
RUN pnpm install --frozen-lockfile

# Copy source and build in dependency order
COPY . .
RUN pnpm -r --filter ./packages/queue --filter ./packages/mail build \
  && pnpm --filter ./apps/email-worker build

# Create a minimal production bundle
RUN pnpm --filter ./apps/email-worker deploy --prod /opt/run

# Runner stage: only production runtime
FROM node:22-alpine AS runner
WORKDIR /opt/run
ENV NODE_ENV=production
USER node

# No ports exposed; worker runs headless
CMD ["node", "dist/main.js"]
