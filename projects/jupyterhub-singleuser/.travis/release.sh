#!/bin/bash

echo "${DOCKER_PASSWORD}" | docker login ${DOCKER_REPO} -u "${DOCKER_USERNAME}" --password-stdin
docker push "${CONTAINER_NAME}-simple"
docker push "${CONTAINER_NAME}-full"
