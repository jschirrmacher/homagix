FROM node:14-alpine@sha256:fc6cc60ea4801619543bd11b7db798626e32ab921f2ff319e620b806637dea6d as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:fc6cc60ea4801619543bd11b7db798626e32ab921f2ff319e620b806637dea6d
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
