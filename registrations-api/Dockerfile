FROM node:20-slim AS base
WORKDIR /usr/src/app
COPY package*.json ./

FROM base AS test
RUN npm install
COPY . .
CMD ["npm", "test"]

FROM base AS production
RUN npm install --omit=dev
COPY . .
USER node
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3002/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

EXPOSE 3002
CMD ["node", "server.js"]