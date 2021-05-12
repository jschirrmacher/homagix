FROM node:14-alpine@sha256:d1a10d5865ab05430703f75e5a2a6897c1106a6f264d0317fbd785e24d4e8b25 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:d1a10d5865ab05430703f75e5a2a6897c1106a6f264d0317fbd785e24d4e8b25
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
