FROM node:14-alpine@sha256:49d052af1616dbf5f2bd8b71fca9a4b7c688955e72bbe3e0126c4b28d7675577 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:49d052af1616dbf5f2bd8b71fca9a4b7c688955e72bbe3e0126c4b28d7675577
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
