FROM node:22-alpine

WORKDIR /jkt48/apis

COPY package*.json /jkt48/apis/

RUN npm install && npm install -g pm2 && npm install -g nodemon

COPY . /jkt48/apis

RUN npm run build

EXPOSE 6969

CMD ["pm2-runtime", "start", "package.json"]