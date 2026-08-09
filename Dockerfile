# ---------- Builder ----------
FROM node:22-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN pnpm exec prisma generate

COPY . .

RUN pnpm build

# ---------- Production ----------
FROM node:22-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm dlx prisma generate

COPY --from=builder /app/dist ./dist
COPY .infisical.json .

RUN apk add --no-cache bash wget

# Install Infisical
RUN wget -qO- 'https://artifacts-cli.infisical.com/setup.apk.sh' | sh

RUN apk update && apk add --no-cache infisical

# Give ownership of the app directory
RUN chown -R node:node /app

# Switch to the non-root user
USER node

EXPOSE 3000

HEALTHCHECK \
  --interval=30s \
  --timeout=3s \
  --start-period=10s \
  --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["infisical", "run", "--", "node", "dist/src/server.js"]