FROM openjdk:15

ADD build/distributions/*.tar /opt/
ADD ../mercury/build /opt/mercury/build
EXPOSE 8090

WORKDIR "/opt/config"
CMD ["/bin/sh", "-c", "/opt/saturn-*/bin/saturn"]
