FROM node:14-alpine@sha256:3f834532c950218dd369142ad5c76de8460b9d0497e2d920415d57fba9af83f9 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:3f834532c950218dd369142ad5c76de8460b9d0497e2d920415d57fba9af83f9
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
