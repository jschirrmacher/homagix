FROM node:12 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules frontend && \
    npm ci --production && \
    mkdir /app && \
    cp -r build node_modules package.json public server /app


FROM node:12-alpine
ENV NODE_ENV production
RUN mkdir /app && \
    addgroup -S nodejs && \
    adduser -S nodejs -G nodejs && \
    chown -R nodejs.nodejs /app
USER nodejs
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 8080
CMD node server
