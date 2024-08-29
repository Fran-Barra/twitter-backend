# Install dependencies
FROM node:18-alpine AS deps

WORKDIR /app

COPY node/express-prisma-typescript/package.json ./ 
COPY node/express-prisma-typescript/yarn.lock ./

RUN yarn install --frozen-lockfile

# Build source code
FROM node:18-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY node/express-prisma-typescript ./

RUN yarn db:generate
RUN yarn build

# Production runtime
FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["yarn", "prod"]

# Development runtime
FROM node:18-alpine AS dev

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/yarn.lock ./
COPY node/express-prisma-typescript/nodemon.json ./nodemon.json
COPY node/express-prisma-typescript/tsconfig.json ./tsconfig.json
COPY node/express-prisma-typescript ./

CMD ["yarn", "dev"]