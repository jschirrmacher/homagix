FROM node:14-alpine@sha256:8e15f5dcdfd288739c9ce71e94ef7ccf49a222a2adf3488ea360525ade6e673d as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:8e15f5dcdfd288739c9ce71e94ef7ccf49a222a2adf3488ea360525ade6e673d
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
