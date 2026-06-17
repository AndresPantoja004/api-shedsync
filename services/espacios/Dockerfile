FROM oven/bun:1
WORKDIR /app
COPY package*.json ./
RUN bun install --omit=dev
COPY src ./src
EXPOSE 3000
CMD ["bun", "src/server.js"]