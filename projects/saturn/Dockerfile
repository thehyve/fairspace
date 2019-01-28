FROM openjdk:10-jre-slim

ADD build/distributions/*.tar /opt/
EXPOSE 8080

WORKDIR "/opt/config"
CMD ["/bin/sh", "-c", "/opt/saturn-*/bin/saturn"]
