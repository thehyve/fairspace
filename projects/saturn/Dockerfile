FROM openjdk:10-jre-slim

ADD build/distributions/*.tar /opt/
EXPOSE 8080

CMD ["/bin/sh", "-c", "/opt/saturn-*/bin/saturn"]
