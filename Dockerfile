FROM node:14-alpine@sha256:9ec21a74ce60eb52af7695f9f1ff976bcf4404aff1578aad67c54f0085d24d87 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:9ec21a74ce60eb52af7695f9f1ff976bcf4404aff1578aad67c54f0085d24d87
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
