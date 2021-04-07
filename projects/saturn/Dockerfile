FROM openjdk:15

ADD build/distributions/*.tar /opt/
# Requires the contents of ../mercury/build to be copied to build/mercury
ADD build/mercury /opt/mercury/build
EXPOSE 8090

WORKDIR "/opt/config"
CMD ["/bin/sh", "-c", "/opt/saturn-*/bin/saturn"]
