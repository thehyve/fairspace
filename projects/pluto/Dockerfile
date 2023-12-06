FROM openjdk:17

ADD build/distributions/pluto-boot-*.tar /opt/
# Requires the contents of ../mercury/build to be copied to build/mercury
ADD build/mercury /opt/mercury
COPY entrypoint.sh /entrypoint.sh

EXPOSE 8080

RUN chmod u+x /entrypoint.sh

WORKDIR "/opt/config"
ENTRYPOINT ["/entrypoint.sh"]