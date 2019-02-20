FROM openjdk:10-jre-slim
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y libtcnative-1
ENV PORT 8080
EXPOSE 8080
COPY app/build/libs/*.jar /opt/app.jar
WORKDIR /opt
CMD ["java", "-Xms92m", "-Xmx128m",  "--add-modules", "java.se.ee", "-jar", "app.jar"]
