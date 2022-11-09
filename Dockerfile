FROM node:14-alpine@sha256:8b9e788c165ea96a09ebd2edbfefe7eaefd6db1addd021bc0097833c3e203f28 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:8b9e788c165ea96a09ebd2edbfefe7eaefd6db1addd021bc0097833c3e203f28
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
