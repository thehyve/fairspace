FROM openjdk:17

ADD build/distributions/*.tar /opt/

RUN set -eux; \
	microdnf install findutils

COPY entrypoint.sh /entrypoint.sh

EXPOSE 8090

USER root
RUN chmod u+x /entrypoint.sh

WORKDIR "/opt/config"
ENTRYPOINT ["/entrypoint.sh"]
