FROM node:22

WORKDIR /jkt48/apis

COPY package*.json /jkt48/apis/

RUN npm install

COPY . /jkt48/apis

EXPOSE 6969

CMD [ "npm", "run", "dev" ]