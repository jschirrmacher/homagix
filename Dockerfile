FROM node:14-alpine@sha256:9a2aa545388a135b496bd55cef2be920b96c4526c99c140170e05a8de3fce653 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:9a2aa545388a135b496bd55cef2be920b96c4526c99c140170e05a8de3fce653
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
