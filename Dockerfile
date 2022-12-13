FROM node:14-alpine@sha256:0b8bceb7b715a6ec09302ab6172c375dbf9c8f4570de0670a5b18cd2f86c6284 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:0b8bceb7b715a6ec09302ab6172c375dbf9c8f4570de0670a5b18cd2f86c6284
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
