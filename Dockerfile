# There is an issue in Skaffold with base images exposing a port
# See https://github.com/jenkins-x/jx/issues/690
# For that reason, we use a base image that does not expose a port
# FROM nginx:alpine
# COPY build/ /usr/share/nginx/html

FROM progrium/busybox

RUN opkg-install uhttpd
RUN printf '#!/bin/sh\nset -e\n\nchmod 755 /www\nexec /usr/sbin/uhttpd $*\n' > /usr/sbin/run_uhttpd && chmod 755 /usr/sbin/run_uhttpd

COPY build/ /www

EXPOSE 8080

ENTRYPOINT ["/usr/sbin/run_uhttpd", "-f", "-p", "8080", "-h", "/www"]
CMD [""]
