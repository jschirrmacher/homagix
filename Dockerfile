FROM node:14-alpine@sha256:a84db769574db0e2a59f194ff9597cf50d05a79a9f7aac0e15a7e6c6f16943ca as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:a84db769574db0e2a59f194ff9597cf50d05a79a9f7aac0e15a7e6c6f16943ca
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
