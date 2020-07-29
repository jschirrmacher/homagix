FROM node:12 as builder
WORKDIR /app
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production


FROM node:12-alpine
ENV NODE_ENV production
RUN mkdir /app && \
    addgroup -S nodejs && \
    adduser -S nodejs -G nodejs && \
    chown -R nodejs.nodejs /app
USER nodejs
WORKDIR /app

COPY --from=builder /app/server server/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/package.json .

EXPOSE 8080
CMD node server
