FROM node:14-alpine@sha256:0fa2fd5119da1ee1d73f95a4f2a9d1abd757c26438366c0b8f88077a8cc8f54b as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:0fa2fd5119da1ee1d73f95a4f2a9d1abd757c26438366c0b8f88077a8cc8f54b
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
