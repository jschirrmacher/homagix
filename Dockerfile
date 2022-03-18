FROM node:14-alpine@sha256:a7bbf324f0d8f4f78abf20a9fb2b08ff4b8b0a20e562a49baf5d649cfd3906d9 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:a7bbf324f0d8f4f78abf20a9fb2b08ff4b8b0a20e562a49baf5d649cfd3906d9
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
