FROM node:14-alpine@sha256:12b14bdfa8c89a1a060c53b5714157085700660b12ab7c50a907a4e19d95b6bf as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:12b14bdfa8c89a1a060c53b5714157085700660b12ab7c50a907a4e19d95b6bf
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
