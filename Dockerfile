# Build the React frontend first.
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

# The frontend and API are served from the same origin, so a relative URL is correct.
ARG VITE_API_URL=/
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Build the NestJS backend.
FROM node:20-bookworm-slim AS backend-build

WORKDIR /app

COPY server/package*.json ./
COPY server/prisma ./prisma
COPY server/prisma.config.ts ./
RUN npm ci
RUN npx prisma generate

COPY server/nest-cli.json server/tsconfig*.json ./
COPY server/src ./src
RUN npm run build

# Runtime image: NestJS serves both the API and the compiled frontend.
FROM node:20-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=backend-build /app/package*.json ./
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/prisma ./prisma
COPY --from=backend-build /app/prisma.config.ts ./
COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /frontend/dist ./public

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
