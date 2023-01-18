FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --silent
COPY . .
RUN npm run build

FROM node:16-alpine AS server
WORKDIR /app
COPY . .
RUN npm install --production --silent
COPY --from=builder ./app/build ./build
CMD ["npm", "start"]