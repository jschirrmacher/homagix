FROM node:14-alpine@sha256:2af507df45e7c0a46c6b3001ce0dbc6924f7b39864d442045f781361a1971975 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:2af507df45e7c0a46c6b3001ce0dbc6924f7b39864d442045f781361a1971975
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
