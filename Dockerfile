FROM node:18

WORKDIR /usr/src/app

COPY . .

RUN npm ci

RUN npm install pm2@5.3.0 -g

RUN mkdir logs

ENTRYPOINT ["/bin/sh", "start.sh"]
