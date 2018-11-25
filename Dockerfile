FROM node:dubnium-alpine

RUN mkdir /app
ADD package.json /app/
ADD build /app/build
ADD server /app/server
ADD public /app/public

WORKDIR /app
RUN npm install --force --production

EXPOSE 8080

CMD node server
