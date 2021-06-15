FROM node:14-alpine@sha256:230a61aff2a8ba4e291b3b0eeac203cca6e25b3aabd4ddbd969bb71125fe7cbc as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:230a61aff2a8ba4e291b3b0eeac203cca6e25b3aabd4ddbd969bb71125fe7cbc
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
