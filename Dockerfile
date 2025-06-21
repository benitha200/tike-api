# Stage 1: Build the app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Stage 2: Run the app
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

CMD ["yarn", "start:prod"]
