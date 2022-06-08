FROM node:14-alpine@sha256:6b87d16e4ce20cacd6f1f662f66c821e4c3c41c2903daeace52d818ec3f4bbdd as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:6b87d16e4ce20cacd6f1f662f66c821e4c3c41c2903daeace52d818ec3f4bbdd
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
