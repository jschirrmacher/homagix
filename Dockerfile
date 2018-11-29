FROM node:dubnium-alpine

RUN mkdir /app
WORKDIR /app

ADD package.json /app/
ADD package-lock.json /app/
ADD server /app/server
ADD public /app/public
ADD src /app/src

RUN npm install --force
RUN npm run build

RUN npm install --force --production

EXPOSE 8080

CMD node server
