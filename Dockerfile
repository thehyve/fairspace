FROM openjdk:8-jdk-slim
EXPOSE 8080

ADD build/distributions/ceres-*.zip /tmp
RUN unzip /tmp/ceres-*.zip -d /opt/
RUN rm /tmp/ceres-*.zip
ENTRYPOINT /opt/ceres-*/bin/ceres