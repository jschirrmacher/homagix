FROM node:14 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules frontend && \
    npm ci --production && \
    mkdir /app && \
    mv build node_modules package.json public server /app


FROM node:14-alpine
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
CMD node server
