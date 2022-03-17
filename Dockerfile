FROM node:14-alpine@sha256:ee873e5d41bc7b34d1d6ae5c4b48e7201b47e3ca723a23271108441390c66e24 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:ee873e5d41bc7b34d1d6ae5c4b48e7201b47e3ca723a23271108441390c66e24
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
