FROM node:14-alpine@sha256:87641a998f00bee1bad8ad15e00f05ac41d96a7093a6b50c5cf8540dda1b65a6 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:87641a998f00bee1bad8ad15e00f05ac41d96a7093a6b50c5cf8540dda1b65a6
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
