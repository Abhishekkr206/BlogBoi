# Stage 1: Build dependencies
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Stage 2: Run the app
FROM node:22-alpine

WORKDIR /app
COPY --from=build /app .

# Optional security user (only if permissions are fine)
# RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
# USER nodejs

EXPOSE 5500

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5500/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "script.js"]
