FROM node:22

# Create app directory
WORKDIR /jkt48/apis

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json /jkt48/apis/

RUN npm install

# Bundle app source
COPY . /jkt48/apis

EXPOSE 6969

CMD [ "npm", "run", "dev" ]