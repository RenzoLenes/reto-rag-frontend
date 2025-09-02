# Etapa 1: Dependencias
FROM node:18 AS deps
WORKDIR /app

COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies)
RUN npm install

# Etapa 2: Build
FROM node:18 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Etapa 3: Producción
FROM node:18-alpine AS runner
WORKDIR /app

# Copiar solo lo necesario para ejecutar Next.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
