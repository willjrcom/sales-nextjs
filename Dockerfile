# =========================
# 1️⃣ STAGE: dependencies
# =========================
FROM node:18-alpine AS deps
WORKDIR /app

# Dependências do sistema (necessárias para algumas libs)
RUN apk add --no-cache libc6-compat

# Copiar arquivos de dependência
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Instalar dependências
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
  else echo "Nenhum lockfile encontrado" && exit 1; \
  fi

# =========================
# 2️⃣ STAGE: builder
# =========================
FROM node:18-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

# Copiar dependências
COPY --from=deps /app/node_modules ./node_modules

# Copiar código
COPY . .

# Build do Next
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_RABBITMQ_URL
ARG NEXT_PUBLIC_WHITE_LIST
ARG NEXT_PUBLIC_GCP_KEY

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_RABBITMQ_URL=$NEXT_PUBLIC_RABBITMQ_URL
ENV NEXT_PUBLIC_WHITE_LIST=$NEXT_PUBLIC_WHITE_LIST
ENV NEXT_PUBLIC_GCP_KEY=$NEXT_PUBLIC_GCP_KEY

RUN npm run build

# =========================
# 3️⃣ STAGE: runner
# =========================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_RABBITMQ_URL

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_RABBITMQ_URL=$NEXT_PUBLIC_RABBITMQ_URL

RUN apk add --no-cache libc6-compat

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001

# Copiar servidor standalone
COPY --from=builder /app/build/standalone ./
# 👉 ESSENCIAL: copiar assets estáticos
COPY --from=builder /app/build/static ./build/static
COPY --from=builder /app/public ./public

# Permissões
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Start do Next standalone
CMD ["node", "server.js"]
