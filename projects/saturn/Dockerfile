FROM openjdk:17

ADD build/distributions/*.tar /opt/

RUN apk update && apk add findutils

EXPOSE 8090

WORKDIR "/opt/config"
CMD ["/bin/sh", "-c", "/opt/saturn-*/bin/saturn"]
