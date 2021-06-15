FROM node:14-alpine@sha256:ec68bdc1f61ed11169c319fe71348581a5d474cb1fd8c6a0f734e2698010fcc3 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:ec68bdc1f61ed11169c319fe71348581a5d474cb1fd8c6a0f734e2698010fcc3
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
