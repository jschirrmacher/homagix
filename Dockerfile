FROM node:14-alpine@sha256:50808db1777e35ca156d06cfd31fa377febe82df6f26b8413a47c12dcbf5e6c5 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:50808db1777e35ca156d06cfd31fa377febe82df6f26b8413a47c12dcbf5e6c5
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
