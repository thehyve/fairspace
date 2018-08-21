FROM node:8

MAINTAINER fairspace.io

RUN mkdir /titan

COPY ./*.js /titan/
COPY ./package.json /titan
COPY ./bin /titan/bin

WORKDIR /titan

EXPOSE 3000

RUN ["npm", "install"]

CMD ["npm", "start"]
