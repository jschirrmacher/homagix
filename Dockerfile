FROM node:14-alpine@sha256:6c706ef37a30d424cecf307fd4326d56ea9d8c992b7ff49725765d48dea3db36 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:6c706ef37a30d424cecf307fd4326d56ea9d8c992b7ff49725765d48dea3db36
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
