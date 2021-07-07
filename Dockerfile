FROM node:14-alpine@sha256:85c91d10fe7c8b9fd52df88bd6a80e43b98c07f7f6640437a19fe55438f58ece as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:85c91d10fe7c8b9fd52df88bd6a80e43b98c07f7f6640437a19fe55438f58ece
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
