FROM openjdk:11-jre
RUN echo "deb http://ftp.debian.org/debian stretch-backports main" | tee /etc/apt/sources.list.d/backports.list
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get -t stretch-backports install -y libtcnative-1
ENV PORT 8080
EXPOSE 8080
COPY app/build/libs/*.jar /opt/app.jar
WORKDIR /opt
CMD ["java", "-Xms92m", "-Xmx128m", "-jar", "app.jar"]
