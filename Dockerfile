FROM node:14-alpine@sha256:21b87afa5f267e50b806f696f754b15b37b4118bb0ef722192f27ddff78d8d67 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:21b87afa5f267e50b806f696f754b15b37b4118bb0ef722192f27ddff78d8d67
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
