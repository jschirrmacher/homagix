FROM node:14-alpine@sha256:ce7f5c604dba6cb15a86c8bea1d35b657798bb2e65e33b6619d610189a74b936 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:ce7f5c604dba6cb15a86c8bea1d35b657798bb2e65e33b6619d610189a74b936
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
