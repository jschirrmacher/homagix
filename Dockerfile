FROM node:14-alpine@sha256:c00a7d1764a4d9a570d85cb1d2867de2af50b71462ee8737eed52b74718478d0 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:c00a7d1764a4d9a570d85cb1d2867de2af50b71462ee8737eed52b74718478d0
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
