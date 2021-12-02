FROM node:14-alpine@sha256:7bcf853eeb97a25465cb385b015606c22e926f548cbd117f85b7196df8aa0d29 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:7bcf853eeb97a25465cb385b015606c22e926f548cbd117f85b7196df8aa0d29
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
