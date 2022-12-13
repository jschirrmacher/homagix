FROM node:14-alpine@sha256:80e825b1f5ab859498a2f0f98f8197131a562906e5f8c95977057502e68ca05a as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:80e825b1f5ab859498a2f0f98f8197131a562906e5f8c95977057502e68ca05a
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
