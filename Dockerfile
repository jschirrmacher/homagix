FROM node:dubnium-alpine as builder

RUN mkdir -p /tmp/frontend
ADD package.json /tmp/frontend/package.json
RUN cd /tmp/frontend && npm install --force

ADD public /tmp/frontend/public
ADD src /tmp/frontend/src
ADD config /tmp/frontend/config
ADD babel.config.js /tmp/frontend/babel.config.js
RUN cd /tmp/frontend && npm run build


FROM node:dubnium-alpine

RUN mkdir /app
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
RUN chown nodejs.nodejs /app
USER nodejs
WORKDIR /app

RUN mkdir -p /tmp/backend
ADD package.json /tmp/backend/package.json
RUN cd /tmp/backend && npm install --production --force && cp -a /tmp/backend/node_modules /app/

ADD package.json /app/package.json
ADD server /app/server
ADD public /app/public
COPY --from=builder /tmp/frontend/build /app/build

EXPOSE 8080
ENV NODE_ENV production

CMD node server
