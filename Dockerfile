FROM node:14-alpine@sha256:e389e6411b9951c74289fd51834f59b2b45655ba7aecd3df96e62d1741f4f902 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:e389e6411b9951c74289fd51834f59b2b45655ba7aecd3df96e62d1741f4f902
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
