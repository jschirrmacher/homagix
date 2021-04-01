FROM node:14-alpine@sha256:0a6a21d28509f56155007444075ef4fdd36eef0a97924623cb641d3766e3b8d3 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:0a6a21d28509f56155007444075ef4fdd36eef0a97924623cb641d3766e3b8d3
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
