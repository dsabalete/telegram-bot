FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY bot.js ./

ENV NODE_ENV=production

CMD ["node", "bot.js"]
