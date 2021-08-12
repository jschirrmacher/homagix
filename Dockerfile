FROM node:14-alpine@sha256:80b5b0066b717e342467f0784c95d5d794fdd8a73eb63a9b5d82d0727feac39b as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:80b5b0066b717e342467f0784c95d5d794fdd8a73eb63a9b5d82d0727feac39b
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
