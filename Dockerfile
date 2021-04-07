FROM node:14-alpine@sha256:aeb57f10e71d0d7c8e8b9821faf1793e615483bee5fc7dce90f8c82731f80827 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:aeb57f10e71d0d7c8e8b9821faf1793e615483bee5fc7dce90f8c82731f80827
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
