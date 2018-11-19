FROM openjdk:10-jre-slim
ENV PORT 8080
EXPOSE 8080
COPY build/libs/*.jar /opt/app.jar
WORKDIR /opt
CMD ["java", "--add-modules", "java.se.ee", "-jar", "app.jar"]
