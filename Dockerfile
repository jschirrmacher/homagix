FROM node:14-alpine@sha256:86c59eb57b10df3d55e460b28799f60121f950ad018ff0989ea01ab61a1d9ab2 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:86c59eb57b10df3d55e460b28799f60121f950ad018ff0989ea01ab61a1d9ab2
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
