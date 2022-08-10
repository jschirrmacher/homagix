FROM node:14-alpine@sha256:4aff4ba0da347e51561587eba037a38db4eaa70e1a6c8334d66779fe963d5be7 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:4aff4ba0da347e51561587eba037a38db4eaa70e1a6c8334d66779fe963d5be7
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
