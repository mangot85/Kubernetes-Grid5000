FROM node:20

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY main-simple-calculator.js .

EXPOSE 3000

CMD [ "node", "main-simple-calculator.js" ]
