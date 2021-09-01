FROM node:14-alpine@sha256:6979934341b07788c44ebc1869cc07db06632e32d61ab1c8824d51d680e8fb35 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:6979934341b07788c44ebc1869cc07db06632e32d61ab1c8824d51d680e8fb35
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
