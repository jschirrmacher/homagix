FROM node:14-alpine@sha256:179b0166fc11382a46637022bd7ee330021ff97fe90ae014174761cf5f88a269 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:179b0166fc11382a46637022bd7ee330021ff97fe90ae014174761cf5f88a269
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
