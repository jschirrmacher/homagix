FROM node:14-alpine@sha256:53e7663707462f04d85e6c73e19517a55213bd9fcc16192526fd55e01031925f as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:53e7663707462f04d85e6c73e19517a55213bd9fcc16192526fd55e01031925f
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
