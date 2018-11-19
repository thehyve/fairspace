FROM node:8

MAINTAINER fairspace.io

RUN mkdir /titan

COPY ./src /titan/src
COPY ./package.json /titan
COPY ./bin /titan/bin

WORKDIR /titan

EXPOSE 3000

RUN ["npm", "install"]

CMD ["npm", "start"]
