FROM node:14-alpine@sha256:e22ee6a906e823dc592d6022a3f520676575b50320fe2c3916c88acb16f471ce as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:e22ee6a906e823dc592d6022a3f520676575b50320fe2c3916c88acb16f471ce
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
