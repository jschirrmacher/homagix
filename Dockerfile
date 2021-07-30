FROM node:14-alpine@sha256:726642e5eb66aed9cd41a09bd6107954f8feb2fe4c1cd5bcf45149ab0814d577 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:726642e5eb66aed9cd41a09bd6107954f8feb2fe4c1cd5bcf45149ab0814d577
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
