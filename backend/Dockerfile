# Stage 1: Install dependencies
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Run the app
FROM node:20-alpine

WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .

EXPOSE 5500

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5500/blog/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "script.js"]