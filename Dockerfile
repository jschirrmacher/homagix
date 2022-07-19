FROM node:14-alpine@sha256:06bc5a651beb7db09a66ceb99a1d19275810d5c9dca8fb9e1ad6d69355a2f42e as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:06bc5a651beb7db09a66ceb99a1d19275810d5c9dca8fb9e1ad6d69355a2f42e
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
