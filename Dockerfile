FROM node:14-alpine@sha256:b953f75739f5ddce593f8b7cf8542bbe5eb6a2a637cdd855fb7444ad4e296e02 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:b953f75739f5ddce593f8b7cf8542bbe5eb6a2a637cdd855fb7444ad4e296e02
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
