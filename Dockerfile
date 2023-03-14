FROM node:14-alpine@sha256:1d02d4073d7dfd58950a222a862f8b819afd774560b7b3e992b27ff4cd088285 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:1d02d4073d7dfd58950a222a862f8b819afd774560b7b3e992b27ff4cd088285
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
