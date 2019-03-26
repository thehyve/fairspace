FROM openjdk:11-jre

ADD build/distributions/*.tar /opt/
EXPOSE 8080

WORKDIR "/opt/config"
CMD ["/bin/sh", "-c", "/opt/saturn-*/bin/saturn"]
