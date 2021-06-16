FROM node:14-alpine@sha256:a1e6227c8a9c3947c64f472f07eaec733e738e0ce0d53aced84e299555b24e05 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:a1e6227c8a9c3947c64f472f07eaec733e738e0ce0d53aced84e299555b24e05
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
