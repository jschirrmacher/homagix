FROM node:14-alpine@sha256:1fdf68e175b39915e740da73269970b0a0a881c497865bc7b5accb9bd83a7811 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:1fdf68e175b39915e740da73269970b0a0a881c497865bc7b5accb9bd83a7811
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
