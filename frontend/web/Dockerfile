FROM node:20-alpine AS base

WORKDIR /web

RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm

COPY package.json ./

RUN pnpm install

EXPOSE 8081

FROM base AS builder

COPY . .

RUN pnpm run build

FROM base AS prod

RUN pnpm install --prod

COPY --from=builder /web/.next ./.next
COPY --from=builder /web/package.json ./package.json
COPY --from=builder /web/public ./public

CMD ["pnpm", "start"]

FROM base AS dev

RUN pnpm install

COPY . .

CMD ["pnpm", "dev"]
