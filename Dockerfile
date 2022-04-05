FROM node:14-alpine@sha256:8845b4f88f64f8c56a39236648ba22946e806a6153c10911f77b70e5a2edb4ca as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:8845b4f88f64f8c56a39236648ba22946e806a6153c10911f77b70e5a2edb4ca
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
