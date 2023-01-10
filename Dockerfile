FROM node:14-alpine@sha256:2c6a909495ef3761328c10945cbe84c06d079f7ca49dc24271e73be8cab85ad7 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:2c6a909495ef3761328c10945cbe84c06d079f7ca49dc24271e73be8cab85ad7
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
