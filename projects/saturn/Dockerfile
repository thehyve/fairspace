FROM openjdk:17

ADD build/distributions/*.tar /opt/

EXPOSE 8090

WORKDIR "/opt/config"
CMD ["/bin/sh", "-c", "/opt/saturn-*/bin/saturn"]
