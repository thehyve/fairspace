FROM openjdk:8-jdk-slim

RUN apt-get update && apt-get install haveged -y

ENV PORT 8080
EXPOSE 8080
COPY build/libs/*.jar /opt/app.jar
WORKDIR /opt

CMD ["java", "-jar", "app.jar", "-Djava.security.egd=file:/dev/./urandom"]
