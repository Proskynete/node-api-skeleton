FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
RUN npm prune --production
COPY . .
RUN npm run build
CMD ["npm", "start"]