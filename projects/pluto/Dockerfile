FROM openjdk:15

ADD build/distributions/*.tar /opt/
ADD ../mercury/build /opt/mercury/build
EXPOSE 8080

WORKDIR "/opt/config"
CMD ["/bin/sh", "-c", "/opt/pluto-*/bin/pluto"]

#COPY build/libs/*.jar /opt/pluto.jar
#WORKDIR /opt
#CMD ["java", "-Xms92m", "-Xmx128m", "-jar", "pluto.jar"]
