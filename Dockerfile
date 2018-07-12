FROM openjdk:8-jdk-slim
EXPOSE 8080

ADD build/distributions/ceres-*.zip /tmp
RUN unzip /tmp/ceres-*.zip -d /opt/
RUN rm /tmp/ceres-*.zip
RUN mkdir /data/
ENV CERES_DATA_DIR /data/ceres
ENV CERES_AUTH_ENABLED false
ENTRYPOINT /opt/ceres-*/bin/ceres