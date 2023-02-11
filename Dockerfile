FROM node:14-alpine@sha256:163bafb0f2a7b8ebb4587347f5c6191679aed92031df8dc4932c11f1fc9bcaf5 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:163bafb0f2a7b8ebb4587347f5c6191679aed92031df8dc4932c11f1fc9bcaf5
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
