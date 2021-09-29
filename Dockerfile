FROM node:14-alpine@sha256:276f611d6f338a38c3265f28075e3fb2542358e39ba6b688a1c51a41d4f97682 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:276f611d6f338a38c3265f28075e3fb2542358e39ba6b688a1c51a41d4f97682
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
