FROM node:14-alpine@sha256:dc7cbd288ba1e4a67443f3ed756a042dfeba26349b873e6fd5f1b0909237bdc1 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:dc7cbd288ba1e4a67443f3ed756a042dfeba26349b873e6fd5f1b0909237bdc1
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
