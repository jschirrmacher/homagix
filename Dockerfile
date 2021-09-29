FROM node:14-alpine@sha256:5e96a11d395e8fd0652bbbc35cf4da16f38cf9559ec859f364aa93073bc758dd as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:5e96a11d395e8fd0652bbbc35cf4da16f38cf9559ec859f364aa93073bc758dd
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
