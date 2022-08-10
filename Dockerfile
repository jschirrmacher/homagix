FROM node:14-alpine@sha256:485f3d453eb15ef8411e15842c4868a64e68709f6f8981b5a28b75d96676f627 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:485f3d453eb15ef8411e15842c4868a64e68709f6f8981b5a28b75d96676f627
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
