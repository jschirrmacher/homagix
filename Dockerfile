FROM node:12 as frontend_builder
WORKDIR /app
ADD . .
RUN npm ci && npm run build


FROM node:12 as backend_builder
WORKDIR /app
ADD package-lock.json package.json ./
RUN npm ci --production


FROM node:12-alpine

RUN mkdir /app && \
    addgroup -S nodejs && adduser -S nodejs -G nodejs && \
    chown nodejs.nodejs /app
USER nodejs
WORKDIR /app

COPY --from=frontend_builder /app/build/ build/
COPY --from=backend_builder /app/node_modules/ node_modules/
ADD public public
ADD server server
ADD package.json ./

EXPOSE 8080
ENV NODE_ENV production

CMD node server
