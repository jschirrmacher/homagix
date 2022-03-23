FROM node:14-alpine@sha256:45aa0cdf945fcaa404790ad2da1a4b42d7320dbd7cede39305354b986ac31413 as builder
WORKDIR /build
ADD . .
RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --production && \
    mkdir /app && \
    mv build/server build/frontend node_modules package.json public /app


FROM node:14-alpine@sha256:45aa0cdf945fcaa404790ad2da1a4b42d7320dbd7cede39305354b986ac31413
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder /app .
RUN chown -R node.node .
USER node


EXPOSE 8200
ENV NODE_ENV production
ENV BASEDIR /app
CMD node server
