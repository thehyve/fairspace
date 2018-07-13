FROM openjdk:8-jdk-alpine
ENV PORT 8080
EXPOSE 8080
COPY app/build/libs/*.jar /opt/app.jar
WORKDIR /opt
CMD ["java", "-jar", "app.jar", "-Xms128m", "-Xmx256m"]