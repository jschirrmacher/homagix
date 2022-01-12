FROM node:14-alpine@sha256:a9b200d25469261a4cccde176db08ec9f0b5799fa4220d8edfe57e69684c6dad as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:a9b200d25469261a4cccde176db08ec9f0b5799fa4220d8edfe57e69684c6dad
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
