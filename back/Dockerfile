FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm i -g nodemon

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
