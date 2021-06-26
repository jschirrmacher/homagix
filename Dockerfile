FROM node:14-alpine@sha256:f85811929c38ded543de4294b80868d40d02000af003911179bb75f5629619e5 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:f85811929c38ded543de4294b80868d40d02000af003911179bb75f5629619e5
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
