FROM node:14-alpine@sha256:2825e1c8aad5786d79d6fce6ce14cf4c903bd4e03b84f586afe4e39430665fe4 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:2825e1c8aad5786d79d6fce6ce14cf4c903bd4e03b84f586afe4e39430665fe4
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
