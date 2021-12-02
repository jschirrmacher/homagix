FROM node:14-alpine@sha256:128aa5f72f959702ff5cc78ca420e7e41b03491633732b958145c57924303f14 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:128aa5f72f959702ff5cc78ca420e7e41b03491633732b958145c57924303f14
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
