FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/package.json
RUN bun install --frozen-lockfile --production

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend
EXPOSE 8000
CMD ["bun", "run", "src/index.ts"]
