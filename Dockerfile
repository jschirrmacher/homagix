FROM node:14-alpine@sha256:1e7481a9a977d8e4160a73ed6a0e726724570bf7d941adbec63a82cf7c07ae19 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:1e7481a9a977d8e4160a73ed6a0e726724570bf7d941adbec63a82cf7c07ae19
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
