FROM node:14-alpine@sha256:cc1e73c9e7ce62c0e1c37db382d1edf50e7332f205c46ec36cfcca1efb6defed as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:cc1e73c9e7ce62c0e1c37db382d1edf50e7332f205c46ec36cfcca1efb6defed
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
