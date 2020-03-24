FROM openjdk:12

ADD saturn/build/distributions/*.tar /opt/
ADD mercury/build /opt/mercury/build
EXPOSE 8080

WORKDIR "/opt/config"
CMD ["/bin/sh", "-c", "/opt/saturn-*/bin/saturn"]
