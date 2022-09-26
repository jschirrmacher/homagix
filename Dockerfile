FROM node:14-alpine@sha256:52d9b78e8bb09a7b227eb7a199230951cc8eaf33d9c0f4d8fd7be0457937f3ba as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:52d9b78e8bb09a7b227eb7a199230951cc8eaf33d9c0f4d8fd7be0457937f3ba
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
