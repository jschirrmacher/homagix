FROM node:14-alpine@sha256:02e393472aa5afffd69214ba6974e3a8ff17e2271b9d2f42ce2f4975ee966ec5 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:02e393472aa5afffd69214ba6974e3a8ff17e2271b9d2f42ce2f4975ee966ec5
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
