# Stage 1: Install dependencies
FROM oven/bun:1 AS build

WORKDIR /app
COPY package*.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 2: Run the app
FROM oven/bun:1

WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .

EXPOSE 5500

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5500/blog/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
  
CMD ["bun", "script.js"]