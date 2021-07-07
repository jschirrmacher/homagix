FROM node:14-alpine@sha256:c3126f821c9df618d0f734ad1babd9b45c73c1fa2b2e18ea709dff00a3283cea as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:c3126f821c9df618d0f734ad1babd9b45c73c1fa2b2e18ea709dff00a3283cea
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
