FROM node:lts-slim

RUN mkdir -p /usr/src/client
COPY build/ /usr/src/client

RUN mkdir -p /usr/src/server
COPY server/ /usr/src/server

WORKDIR /usr/src/server

ENV NODE_ENV production
ENV PORT 80

CMD node server.js
