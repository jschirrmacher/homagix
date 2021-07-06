FROM node:14-alpine@sha256:d5208361b8346796c6b9c5bebaa5894c7551b76057d581ba57f9bcdecb4c4d4f as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:d5208361b8346796c6b9c5bebaa5894c7551b76057d581ba57f9bcdecb4c4d4f
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
