FROM node:14-alpine@sha256:1ef3426a3de44924d76f884741164ec8f5f5e2d5f10ce878fab242540458d12a as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:1ef3426a3de44924d76f884741164ec8f5f5e2d5f10ce878fab242540458d12a
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
