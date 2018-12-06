FROM openjdk:10-jre-slim
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y libtcnative-1
ENV PORT 8080
EXPOSE 8080
COPY build/libs/*.jar /opt/app.jar
WORKDIR /opt
CMD ["java", "--add-modules", "java.se.ee", "-jar", "app.jar"]
