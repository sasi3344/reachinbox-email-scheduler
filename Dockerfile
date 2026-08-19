FROM node:20-alpine AS builder

WORKDIR /app

# 1. Install and compile Backend
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/
RUN cd backend && npm install --include=dev

COPY backend/ ./backend/
RUN cd backend && npx prisma generate && npm run build

# 2. Production Runner Image
FROM node:20-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=5000

# Copy compiled backend & dependencies
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma

EXPOSE 5000

CMD ["node", "dist/server.js"]
