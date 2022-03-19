FROM node:14-alpine@sha256:f0c5afa3a649be68f661e51b1b5c26b0b634546bda64d74c55c1d4b64b8da1f5 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:f0c5afa3a649be68f661e51b1b5c26b0b634546bda64d74c55c1d4b64b8da1f5
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
