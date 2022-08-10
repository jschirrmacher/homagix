FROM node:14-alpine@sha256:b3d1c21236eeeaa9b5103d32a6dc17e37506497f65bca681b08e060f5963b593 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:b3d1c21236eeeaa9b5103d32a6dc17e37506497f65bca681b08e060f5963b593
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
