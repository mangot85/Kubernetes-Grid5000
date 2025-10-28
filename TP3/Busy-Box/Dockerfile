# XXXXXX/YYYYYY is your username/password in https://hub.docker.com/
#
# docker build . --tag tp-04-busy-box:v1
# docker tag tp-04-busy-box:v1 XXXXXX/midl-tp-04-busy-box:v1
# docker login --username XXXXXX --password YYYYYY
# docker push XXXXXX/midl-tp-04-busy-box:v1

FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY main-busy-box.js .
EXPOSE 3000
CMD [ "node", "main-busy-box.js" ]