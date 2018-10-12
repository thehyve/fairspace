#!/bin/bash
#
# Required env variables:
#   $CONTAINER_NAME
#
#   $DOCKER_REPO
#   $DOCKER_USERNAME
#   $DOCKER_PASSWORD
#
echo "${DOCKER_PASSWORD}" | docker login ${DOCKER_REPO} -u "${DOCKER_USERNAME}" --password-stdin
docker push "${CONTAINER_NAME}"
