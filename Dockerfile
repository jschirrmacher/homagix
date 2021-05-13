FROM node:14-alpine@sha256:3689ad4435a413342ccc352170ad0f77433b41173af7fe4c0076f0c9792642cb as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:3689ad4435a413342ccc352170ad0f77433b41173af7fe4c0076f0c9792642cb
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
