FROM node:12.8.0

ENV REDISHOST redis
ENV REDISPORT 6379

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]