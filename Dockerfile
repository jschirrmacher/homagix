FROM node:14-alpine@sha256:c9b8829068199346e2a9ae46f870bbb82ce44de6580321300bf3945d00dee0f1 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:c9b8829068199346e2a9ae46f870bbb82ce44de6580321300bf3945d00dee0f1
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
