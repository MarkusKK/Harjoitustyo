FROM node:10
WORKDIR /pitch-reservation
COPY package.json /pitch-reservation
RUN npm install
COPY . /pitch-reservation
CMD ["npm", "start"]
EXPOSE 3000
